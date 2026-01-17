import {createAgent,createNetwork,createTool,gemini,createState} from "@inngest/agent-kit";
import z from "zod";
import { client, createCall, createMessage } from "../utils/make_call";
import { inngest } from "./client";
import { eld } from "eld";
import { tvly } from "../utils/web";
import { TavilyExtractResponse } from "@tavily/core";
import { RecursiveSplitting } from "../utils/store_embedding";
import DataModel from "../model/data.model";
import { QueryEmbedding } from "../utils/Retrive_embedding";
import { content } from "../types/signup";
import { StoreEmbedding } from "../helper/embedding_helper";
import { Call } from "../model/Summary.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FarmerProfile } from "../model/farmer.info.model";

if ("load" in eld && typeof eld.load === "function") {
  await (eld as any).load();
}

function sanitizeSmsBody(sms: string): string {
  return sms
  .replace(/[*\u2022]/g, '-') // Replace bullets (*) or dots (•) with simple dashes
  .replace(/\n\s*\n/g, '\n')  // Remove double newlines to save space
  // .substring(0, 134)
  .trim();
}

export interface NetworkState {
  completed: boolean;
  skipCall: boolean;
  language: string;
}

export function fastDetect(text: string): string {
  const result = eld.detect(text);
  // Mapping local codes to full language names for your dynamic prompt
  const langMap: Record<string, string> = {
    hi: "Hindi",
    mr: "Marathi",
    en: "English",
    ta: "Tamil",
    te: "Telugu",
  };
  return langMap[result.language] || "English"; // Default to Hindi
}

const webSearchAndScrapeTool = createTool({
  name: "web_search_and_scrape",
  description: "Search the internet for information and scrape content from relevant websites. Use this when you need current information about government schemes, market prices, agricultural practices, or any topic that requires up-to-date web data.",
  parameters: z.object({
    query: z.string().min(3).describe("Search query to find relevant information on the internet. Be specific, e.g., 'PM Kisan scheme 2024', 'wheat market price today', 'organic farming methods'"),
  }),
  handler: async ({ query }, { network, agent, step }) => {
    try {
      if (!step) return;
      console.log('Web search tool called with query:', query);
      
      const englishQuery = await step.run("translate-query", async () => {
        console.log("translating query",query)
        const translation = await step.ai.infer("translate-query",{
          model: step.ai.models.gemini({model:"gemini-2.5-flash",apiKey:process.env.gemini_api}),
          body: {
            contents: [{  
              role: "user",
              parts: [{text: `
              Translate the following farmer query to clear, searchable English. 
              If it's already in English, return it as is.
              Query: "${query}"
              `}]
            }]
          }
        });
        console.log("translation",translation)
        return translation.candidates?.[0]?.content?.parts?.[0]?.parts?.[0]?.text?.trim() || query;
      });
      if (!englishQuery) {
        return {
          query: englishQuery,
          success: false,
          message: "Failed to translate query to English",
          content: []
        };
      }
      
      if (network.state.kv.get("webSearchDone")) {
        console.log('Web search already performed, skipping for query:', query);
        return {
          query: englishQuery,
          success: false,
          message: "Web search already performed in this session",
          content: []
        };
      }
      
      const searchResults = await getWebsites(englishQuery);
      
      if (!searchResults.websites || searchResults.websites.length === 0) {
        const result = {
          query: searchResults.query,
          success: false,
          message: "No websites found for the search query",
          content: []
        };
        network.state.kv.set("webSearchDone", true);
        return result;
      }

      const scrapedContent = await scrapWebsite(searchResults.toBeScrape, englishQuery);
      
      const formattedContent = scrapedContent.scraped.map(item => ({
        url: item.url,
        title: item.url,
        content: item.content
      }));

      inngest.send({
        name:"website/scrape.Database",
        data:{
          content:formattedContent
        }
      })

      const userWebsites = Array.from(searchResults.AlreadyScraped);
      let AlreadyScraped:content[]=[];
      if(userWebsites.length>0){
        AlreadyScraped = await QueryEmbedding(query,userWebsites)
      }

      new Promise((resolve) => setTimeout(resolve, 3000));

      const Content=[...formattedContent,...AlreadyScraped]
      console.log("content gathered---------------------------------",Content)
      const result = {
        query: searchResults.query,
        success: true,
        websitesFound: searchResults.count,
        successfullyScraped: scrapedContent.successCount,
        content: Content,
        summary: `Found ${searchResults.count} websites, successfully scraped ${scrapedContent.successCount} sites with relevant information about "${query}"`
      };
      
      // Mark as done to prevent further calls
      network.state.kv.set("webSearchDone", true);
      
      return result;
    } catch (error) {
      console.error('Error in webSearchAndScrapeTool:', error);
      const result = {
        query,
        success: false,
        error: error instanceof Error ? error.message : "Web search and scrape failed",
        content: []
      };
      network.state.kv.set("webSearchDone", true);
      return result;
    }
  },
});

const callcustomer = createTool({
  name: "make_phone_call",
  description:
    "MUST be called after every response to make a phone call to the farmer with the answer. This is REQUIRED - you must call this tool with your response.",
  parameters: z.object({
    answer: z
      .string()
      .describe("The answer text to speak to the farmer over the phone call."),
  }),
  handler: async (output, { network, agent, step }) => {

    const skipCall = network.state.kv.get("skipCall");
    if (skipCall === true) {
      console.log("Follow-up mode: skipping phone call");
      network.state.kv.set("lastAnswer", output);
      return "Follow-up answer provided";
    }

    if (!network.state.kv.get("callStarted")) {
      network.state.kv.set("callStarted", true);
    }

    console.log("Tool handler called - Network name:", network.name);
    const answer = output.answer;
    console.log("output:", answer);

    try {
      network.state.kv.set("lastAnswer", answer);
    } catch (error) {
      console.log("error in setting answer",error)
    }

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="Polly.Aditi">${answer}</Say>
            <Say voice="Polly.Aditi" language="en-IN">Is there anything else I can help you with today?</Say>
            <Gather 
                input="speech" 
                action="${process.env.URL}/bhoomi-followup"
                method="POST" 
                speechTimeout="auto" 
                language="en-IN">
            </Gather>
            <Say voice="Polly.Aditi" language="en-IN">Thank you for talking with Bhoomi. Goodbye!</Say>
        </Response>`;

        const callSid = await createCall(xmlResponse);

        // Save callSid for polling
        network.state.kv.set("callSid", callSid);
    
        return "Phone call initiated";
  },
});

function convertToSearchableText(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .substring(0, 200); // Limit length
}

export const getWebsites = async (query: string) => {
  try {
    console.log("query recieved for websearch",query)
    const searchableQuery = convertToSearchableText(query);
    const response = await tvly.search(searchableQuery, {
      maxResults: 5, // Get top 5 results
      includeAnswer: false,
      includeRawContent: false,
    });

    const websites = response.results?.map((result: any) => result.url) || [];

    const existingWebsites = await DataModel.find({ website: { $in: websites } }).select("website -_id");

    const existingSet = new Set(
      existingWebsites.map(w => w.website)
    );

    const notPresent = websites.filter(
      website => !existingSet.has(website)
    );

    return {
      query: searchableQuery,
      websites: websites,
      results: response.results || [],
      count: websites.length,
      toBeScrape: notPresent,
      AlreadyScraped:existingSet
    };
  } catch (error) {
    console.error("Error getting websites:", error);
    return {
      query,
      toBeScrape:[],
      AlreadyScraped:[],
      websites: [],
      results: [],
      count: 0,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
};

export const scrapWebsite = async (websites: string[], query: string) => {
  try {
    const scrapedData = await Promise.all(
      websites.map(async (website: string) => {
        try {
          console.log('Scraping website:', website);
          const response:TavilyExtractResponse = await tvly.extract([website], { 
            query: query,
            format: 'text'
          });
          const firstResult = response?.results?.[0];
          return {
            url: website,
            content: firstResult?.rawContent || "No content found",
            images: firstResult?.images || [],
            success: !!firstResult,
          };
        } catch (error) {
          console.error(`Error scraping ${website}:`, error);
          return {
            url: website,
            content: "",
            title: "",
            success: false,
            error: error instanceof Error ? error.message : "Scraping failed",
          };
        }
      })
    );

    return {
      scraped: scrapedData.filter((item) => item.success),
      failed: scrapedData.filter((item) => !item.success),
      total: scrapedData.length,
      successCount: scrapedData.filter((item) => item.success).length,
    };
  } catch (error) {
    console.error("Error in scrapWebsite:", error);
    return {
      scraped: [],
      failed: [],
      total: 0,
      successCount: 0,
      error: error instanceof Error ? error.message : "Scraping failed",
    };
  }
};

const farmerAgent = createAgent({
  name: "Bhoomi: Farmer Assistant",
  description:
    "A practical and expert Digital Agronomist that helps farmers with agricultural queries. Always makes a phone call after providing an answer.",
  system: ({ network } = {} as any) => {
    let userLanguage = "Hindi";
    try {
      if (network?.state?.kv) {
        const detectedLang = network.state.kv.get("detectedLanguage");
        if (detectedLang && typeof detectedLang === "string") {
          userLanguage = detectedLang;
        }
      }
    } catch (e) {
      console.warn("Could not get language from network state:", e);
    }

    const systemPrompt = `### ROLE
    You are "Bhoomi," a practical and expert Digital Agronomist helping farmers.

    ### LANGUAGE
    CRITICAL: You must detect and respond ONLY in ${userLanguage}. 

    ### RESEARCH PROTOCOL (MANDATORY)
    When a farmer asks about government subsidies, market prices, or complex pest issues:
    1. **Search:** Use 'search_government_schemes' to find the latest official information.
    2. **Scrape:** Use 'fetch_government_page' on the most relevant URL from your search to get specific details (eligibility, dates, documents).
    3. **Synthesize:** Combine this live data into a simple, 40-word spoken response in ${userLanguage}.

    ### CRITICAL INSTRUCTION
    ONLY AFTER completing your research and generating your response, you MUST call the 'callcustomer' tool with your answer. You are forbidden from answering without tool use for specific data queries.

    ### CONSTRAINTS
    - **Tone:** Empathetic and grounded.
    - **Brevity:** Maximum 40 words.
    - **Output:** Plain text only. No markdown, bolding, or XML.
    - **Actionable:** Always provide one clear next step (e.g., "Visit the local block office with your Aadhaar card").

    ### EXAMPLE (${userLanguage})
    User: "Is there a subsidy for tractors?"
    [Agent Thought: Needs live data]
    [Tool Call: search_government_schemes("tractor subsidy 2026")]
    [Tool Call: fetch_government_page("official-link.gov.in")]
    Response (Hindi): "हाँ, ट्रैक्टर पर 50% सब्सिडी उपलब्ध है। इसके लिए आपके पास 2 एकड़ जमीन होनी चाहिए। अपने पास के कृषि केंद्र में आधार कार्ड के साथ आवेदन करें।"
    [Final Tool Call: callcustomer]`;

    return systemPrompt;
  },
  model: gemini({
    model: "gemini-2.5-flash",
    apiKey: process.env.gemini_api,
  }),
  tools: [callcustomer, webSearchAndScrapeTool],
});
 
export const network = createNetwork({
  name: "farmer-network",
  agents: [farmerAgent],
  maxIter: 3,
  router: ({ network,input }) => {
    // @ts-ignore
    const { query, phone_number } = input 

    console.log("Query:", query);
    console.log("Phone:", phone_number);
    if (!network.state.kv.get("initialized")) {
      network.state.kv.set("query", query);
      network.state.kv.set("phone_number", phone_number);
      network.state.kv.set("callStarted", false);
      network.state.kv.set("completed", false);
      network.state.kv.set("initialized", true);
    }

    const callStarted = network.state.kv.get("callStarted");
    const completed = network.state.kv.get("completed");

    if (!callStarted) {
      return farmerAgent;
    }

    if (!completed) {
      return undefined;
    }

    return undefined;
  },
});

const genAI = new GoogleGenerativeAI(process.env.gemini_api!);

export async function getBhoomiAdvice(userQuery: string,
  language: string = "Hindi"): Promise<string> {
  console.log("getBhoomiAdvice called with query:", userQuery);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      ### ROLE
      You are "Bhoomi", a practical and expert Digital Agronomist helping farmers.

      ### LANGUAGE
      You MUST respond ONLY in ${language}.

      ### CONSTRAINTS
      - Tone: Empathetic, clear, farmer-friendly
      - Length: Maximum 40 words
      - Output: Plain text only
      - No markdown, no XML, no emojis
      - Provide ONE clear actionable step

      ### TASK
      Answer the farmer's follow-up question below.

      Farmer Question:
      "${userQuery}"
      `;

    const result = await model.generateContent(prompt);

    const response = result.response.text()?.trim();

    if (!response) {
      console.error("Empty response from Gemini");
      return "माफ़ कीजिए, मैं अभी इस सवाल का जवाब नहीं दे पा रहा हूँ। कृपया दोबारा पूछें।";
    }

    console.log("Bhoomi follow-up answer:", response);
    return response;
  } catch (error) {
    console.error("Error in getBhoomiAdvice:", error);
    return "माफ़ कीजिए, तकनीकी समस्या आ गई है। कृपया थोड़ी देर बाद दोबारा कोशिश करें।";
  }
}

export const farmerWorkflow = inngest.createFunction(
  { id: "farmer-callback-process" },
  { event: "app/message" },
  async ({ event, step }) => {
    const lang = await step.run("detect-language", async () => {
      return fastDetect(event.data.text);
    });

    const initialState = createState<NetworkState>({
      completed: false,
      skipCall: false,
      language: lang,
    });

    initialState.kv.set("detectedLanguage", lang);

    return await network.run(event.data.text, {
      state: initialState,
    });
  }
);

export const sendSMS = inngest.createFunction(
  { id: "send-sms" },
  { event: "send-sms" },

  async ({ event, step }) => {
    const { callSid, networkId, input, lang } = event.data;

    if (!input || !lang) return;

    const response = await step.ai.infer("create-sms", {
      model: step.ai.models.gemini({model:"gemini-2.5-flash",apiKey:process.env.gemini_api}),
      body:{
        contents:[{
          role:"user",
          parts:[{
            text: `
            ### ROLE
            You are a concise SMS Summarizer for farmers.

            ### TASK
            Create a bullet-point summary of the following conversation in ${lang}.

            ### RULES (CRITICAL)
            1. **Language:** You MUST respond only in ${lang}.
            2. **Length:** Keep the total text under 450 characters (approx 3-4 short lines).
            3. **No Special Symbols:** DO NOT use bullet points (•), asterisks (*), or bolding (**). 
            4. **GSM-Safe:** Use only simple dashes (-) for lists and plain spaces.
            5. **No Hallucination:** Only summarize the actual conversation provided.

            ### FORMAT
            - [Point 1]
            - [Point 2]
            - [Point 3]
            Summary: [One sentence summary]

            Conversation:${input}
            `
          }]
        }],
      },
    });

    const sms = response.candidates?.[0]?.content?.parts
      ?.map(p => ("text" in p ? p.text : ""))
      .join("") || "";


    try {
      await Call.findOneAndUpdate(
        { callSid },
        {
          status: "completed",
          summary: sms,
          endedAt: new Date(),
        }
      );
    } catch (error) {
      console.log("error in changing status to completed from in_progress",error)
    }

    try {
      await createMessage(sanitizeSmsBody(sms));
    } catch (error) {
      console.log("error in creating message",error)
    }

    const userId = await Call.findOne({callSid:callSid}).select("userId")
    if (!userId) {
      console.log("userId not found in call summary",userId)
      return {message:"userId not found in call summary"}
    }

    await inngest.send({
      name: "call.summary.created",
      data: {
        summary: sms,
        userId: userId, // phone number or farmer id
      },
    });    

    await inngest.send({
      name: "network.completed",
      data: { networkId },
    });
  }
);

export const waitForCallEnd = inngest.createFunction(
  { id: "wait-for-call-end" },
  { event: "call.started" },

  async ({ step, event }) => {
    const { callSid, callId, networkId } = event.data;

    while (true) {
      await step.sleep("wait-5s", "5s");

      const call = await client.calls(callSid).fetch();

      if (call.status === "completed") {
        await inngest.send({
          name: "send-sms",
          data: {
            callSid,
            callId,
            networkId,
          },
        });
        break;
      }

      if (["failed", "no-answer", "busy"].includes(call.status)) {
        throw new Error(`Call failed with status ${call.status}`);
      }
    }
  }
);

export const markNetworkCompleted = inngest.createFunction(
  { id: "mark-network-completed" },
  { event: "network.completed" },

  async ({ event }) => {
    const network = await inngest.getNetwork(event.data.networkId);
    network.state.kv.set("completed", true);
  }
);

export const processEmbeddings = inngest.createFunction(
  {
    id: "background-embedder",
    // Rate limit: Only process 5 embeddings per minute to save costs
    rateLimit: { limit: 5, period: "1m" },
  },
  { event: "website/scrape.Database" },
  async ({ event, step }) => {
    await step.run("chunk-and-embed", async () => {
      await Promise.all(
        event.data.formattedContent.map(async (e: content) => {
          const docs = await RecursiveSplitting(e.content, e.url);

          await StoreEmbedding(docs);
        })
      );
    });
    return {"message":"saved successfully"}
  }
);

export const extractFarmerProfile = inngest.createFunction(
  { id: "extract-farmer-profile" },
  { event: "call.summary.created" },

  async ({ event, step }) => {
    const { summary, userId } = event.data;

    if (!summary || !userId) return;

    const response = await step.ai.infer("extract-profile", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash",
        apiKey: process.env.gemini_api!,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
                Extract farmer profile info from the summary below.

                Rules:
                - Output ONLY valid JSON
                - Use null if unknown
                - Fields: location, soilType, landSize (number, acres)

                Summary:
                "${summary}"

                JSON:
                {
                  "location": string | null,
                  "soilType": string | null,
                  "landSize": number | null
                }
                `,
              },
            ],
          },
        ],
      },
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: {
      location?: string | null;
      soilType?: string | null;
      landSize?: number | null;
    };

    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Failed to parse farmer profile JSON");
      return;
    }

    // Upsert profile
    await FarmerProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(parsed.location && { location: parsed.location }),
          ...(parsed.soilType && { soilType: parsed.soilType }),
          ...(parsed.landSize && { landSize: parsed.landSize }),
        },
      },
      { upsert: true }
    );
  }
);