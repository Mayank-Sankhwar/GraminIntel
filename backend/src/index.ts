import express, { Request, Response } from "express";
import { network, getBhoomiAdvice, farmerWorkflow, sendSMS, fastDetect, getMarketPrices } from "./inngest/functions";
import { serve } from 'inngest/express';
import { inngest } from './inngest/client';
import { configDotenv } from "dotenv";
import cors from "cors";
import { signin, signup } from "./types/signup";
import mongoose from "mongoose";
import UserModel from "./model/user.model";
import { FarmerProfile } from "./model/farmer.info.model";
import { Call } from "./model/Summary.model";
import axios from "axios";
import OpenAI from "openai";
configDotenv()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
mongoose.connect(process.env.mongo_URL!)
app.use(cors())
app.use("/api/inngest", serve({
    client: inngest,
    functions: [farmerWorkflow, sendSMS]
}));

interface ConversationSession {
    history: Array<any>; // Changed to any to support multimodal content parts
    language: string;
}

const conversationSessions = new Map<string, ConversationSession>();

app.post('/bhoomi-followup', async (req, res) => {
    try {
        console.log("Received /bhoomi-followup request:", req.body);
        const callSid = req.body.CallSid || req.body.CallSID || 'default-session';
        const userSpeech = req.body.SpeechResult || req.body.speechResult || req.body.Speech || req.body.speech;

        console.log("user-questions-------", userSpeech);
        console.log("CallSid-------", callSid);

        if (!conversationSessions.has(callSid)) {
            conversationSessions.set(callSid, {
                history: [],
                language: 'Hindi'
            });
        }

        const session = conversationSessions.get(callSid)!;

        const endConversationKeywords = ['no', 'nahi', 'नहीं', 'nothing', 'no thanks', 'no thank you', 'all done', 'done', 'that\'s all'];
        const userSpeechLower = (userSpeech || '').toLowerCase().trim();
        const wantsToEnd = !userSpeech || userSpeech.trim() === '' || endConversationKeywords.some(keyword => userSpeechLower.includes(keyword));

        if (wantsToEnd) {
            const conversationText = session.history
                .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
                .join('\n\n');

            const langMap: Record<string, string> = {
                'Hindi': 'Hindi',
                'Marathi': 'Marathi',
                'English': 'English',
                'Tamil': 'Tamil',
                'Telugu': 'Telugu',
            };
            const langForSMS = langMap[session.language] || 'English';
            console.log("langForSMS-------", langForSMS);
            console.log("conversationText-------", conversationText);

            console.log("chat length", session.history.length)
            console.log("SMS sent with conversation history");

            sendWhatsAppMessage("918739072402", conversationText);
            await inngest.send({
                name: "send-sms",
                data: {
                    callSid,
                    input: conversationText,
                    lang: langForSMS,
                },
            });

            conversationSessions.delete(callSid);
            return res.type('text/xml').send('<Response><Say voice="Polly.Aditi" language="en-IN">Goodbye!</Say><Hangup/></Response>');
        }

        if (session.history.length === 0 && userSpeech) {
            try {
                const detectedLang = fastDetect(userSpeech);
                session.language = detectedLang;
                console.log("Detected language:", detectedLang);
            } catch (langError) {
                console.error("Error detecting language:", langError);
                session.language = 'English';
            }
        }

        session.history.push({ role: 'user', content: userSpeech });

        let nextAnswer: string;
        try {
            nextAnswer = await getBhoomiAdvice(userSpeech, session.language);
            console.log("nextAnswer-------", nextAnswer);
        } catch (error) {
            console.error("Error getting Bhoomi advice:", error);
            nextAnswer = "माफ़ कीजिए, मैं अभी इस सवाल का जवाब नहीं दे पा रहा हूँ। कृपया दोबारा पूछें।";
        }

        session.history.push({ role: 'assistant', content: nextAnswer });

        const escapedAnswer = nextAnswer
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        const recursiveTwiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="Polly.Aditi" language="en-IN">${escapedAnswer}</Say>
                <Say voice="Polly.Aditi" language="en-IN">Is there anything else I can help you with today?</Say>
                <Gather 
                    input="speech" 
                    action="https://teensy-unenterprisingly-laila.ngrok-free.dev/bhoomi-followup"
                    method="POST" 
                    speechTimeout="auto" 
                    language="en-IN">
                </Gather>
                <Say voice="Polly.Aditi" language="en-IN">Thank you for talking with Bhoomi. Goodbye!</Say>
            </Response>`;

        res.type('text/xml');
        res.send(recursiveTwiml);
    } catch (error) {
        console.error('Error in /bhoomi-followup:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMsg);
        res.type('text/xml').send('<Response><Say voice="Polly.Aditi" language="en-IN">I apologize, but an error occurred. Please try again later.</Say><Hangup/></Response>');
    }
});

app.post('/signup', async (req: Request, res: Response) => {
    console.log(req.body)
    try {
        const data = signup.safeParse(req.body)
        if (!data.success) {
            return res.status(400).json({ "message": "data is missing" })
        }

        const createuser = await UserModel.create({
            username: data.data?.username,
            email: data.data?.email,
            code: data.data?.code,
            phone_number: data.data?.phone_number,
            disability_is: data.data?.disability_is,
            disability_type: data.data?.disability_type,
            answer_preference: data.data?.answer_preference
        })

        res.status(200).json({ "message": "user created successfully" })

    } catch (error) {
        console.log("Error in signup", error)
        return res.status(500).json({ "message": "server error has occured" })
    }

})

app.post('/signin', async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const data = signin.safeParse(req.body);
        if (!data.success) {
            return res.status(400).json({ "message": "Invalid or missing data" });
        }

        const user = await UserModel.findOne({
            phone_number: data.data.phone_number,
        });

        if (!user) {
            return res.status(404).json({ "message": "User not found" });
        }

        const checkPassword = user.code === data.data.code;

        if (!checkPassword) {
            return res.status(401).json({ "message": "Invalid code" });
        }

        res.status(200).json({ "message": "User logged in successfully", user: user });

    } catch (error) {
        console.log("Error in signin", error);
        return res.status(500).json({ "message": "Server error has occured" });
    }
});

app.get('/getprofile/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ "message": "User not found" });
        }

        const farmerInfo = await FarmerProfile.findOne({ userId });

        res.status(200).json({ user, farmerInfo });
    } catch (error) {
        console.log("Error in getprofile", error);
        return res.status(500).json({ "message": "Server error has occured" });
    }
});

app.post('/farmer-info', async (req: Request, res: Response) => {
    try {
        const { userId, location, soilType, landSize } = req.body;

        if (!userId) {
            return res.status(400).json({ "message": "userId is required" });
        }

        const profile = await FarmerProfile.findOneAndUpdate(
            { userId },
            { location, soilType, landSize },
            { upsert: true, new: true }
        );

        res.status(200).json({ "message": "Profile updated successfully", profile });
    } catch (error) {
        console.log("Error in farmer-info", error);
        return res.status(500).json({ "message": "Server error has occured" });
    }
});

app.get('/weather/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const farmerInfo = await FarmerProfile.findOne({ userId });
        const location = farmerInfo?.location || "Raipur, Chhattisgarh";

        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            // High-quality mock data when API key is missing
            return res.status(200).json({
                type: "Sunny",
                temp: 32,
                feels_like: 35,
                humidity: 45,
                wind: 12,
                pressure: 1012,
                visibility: 10,
                location,
                isDemo: true
            });
        }
        console.log("Weather API:", location, farmerInfo);
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`);
        const data = weatherResponse.data;

        // Map OpenWeatherMap condition to Dashboard WeatherType
        let weatherType = "Sunny";
        const condition = data.weather[0].main;
        if (condition === "Clouds") weatherType = "Cloudy";
        if (condition === "Rain" || condition === "Drizzle") weatherType = "Rainy";
        if (condition === "Thunderstorm") weatherType = "Stormy";

        res.status(200).json({
            type: weatherType,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6), // conversion from m/s to km/h
            pressure: data.main.pressure,
            visibility: data.visibility / 1000, // meters to km
            location: data.name,
            isDemo: false
        });
    } catch (error) {
        console.log("Error in weather fetch", error);
        // Fallback to mock on API error to keep UI functional
        return res.status(200).json({
            type: "Cloudy",
            temp: 28,
            feels_like: 30,
            humidity: 60,
            wind: 8,
            pressure: 1010,
            visibility: 8,
            location: "Local Area",
            isDemo: true,
            error: "API Error"
        });
    }
});

app.get("/", (req, res) => {
    res.send("healthy")
})

app.post('/', async (req: Request, res: Response) => {
    try {
        const { query, userId } = req.body
        console.log("query", query)
        console.log("userId", userId)
        if (!query || !userId) {
            return res.status(404).json({ "message": "no query found" })
        }
        let call: any;
        try {
            call = await Call.create({
                userId,
                query,
                status: "initiated"
            });
            console.log("call created successfully", call)
        } catch (error) {
            console.log("Error in creating call", error)
            return res.status(500).json({ message: "server error has occured" })
        }

        // @ts-ignore
        await network.run({ query, phone_number: userId });
        res.status(201).json({
            callId: call._id as string,
            status: call.status as string,
            message: "call started successfully"
        });
    } catch (error) {
        console.log("Error in /", error)
        return res.status(500).json({ message: "server error has occured" })
    }
})

app.get("/status/:callId", async (req: Request, res: Response) => {
    try {
        const { callId } = req.params;

        const call = await Call.findById(callId).select(
            "status summary error updatedAt"
        );

        if (!call) {
            return res.status(404).json({ message: "Call not found" });
        }

        res.json({
            status: call.status,
            summary: call.summary ?? null,
            error: call.error ?? null,
            updatedAt: call.updatedAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch call status" });
    }
});

app.post("/twilio/ended", async (req: Request, res: Response) => {
    try {
        const { CallSid } = req.body;

        const call = await Call.findOne({ callSid: CallSid });

        if (!call) {
            return res.sendStatus(404);
        }

        // Get conversation history from session if available
        const session = conversationSessions.get(CallSid);
        const conversationText = session?.history
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n') || '';
        const langForSMS = session?.language || 'English';

        // Trigger Inngest summary job
        if (conversationText) {
            await inngest.send({
                name: "send-sms",
                id: `send-sms-${CallSid}`,
                data: {
                    callSid: CallSid,
                    input: conversationText,
                    lang: langForSMS
                }
            });
        }

        await Call.findByIdAndUpdate(call._id, {
            status: "in_progress", // still processing summary
            endedAt: new Date()
        });

        // Clean up conversation session
        conversationSessions.delete(CallSid);

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post("/market-prices", async (req: Request, res: Response) => {
    try {
        const { stateName, commodityName } = req.body;

        if (!stateName || !commodityName) {
            return res.status(400).json({ message: "stateName and commodityName are required" });
        }

        const result = await getMarketPrices(stateName, commodityName);

        if (!result.success) {
            return res.status(404).json({ message: result.error });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in /market-prices:", error);
        return res.status(500).json({ message: "Server error occurred" });
    }
});

//@ts-ignore
const WEBHOOK_TOKEN = "MyverifyToken" || process.env.WEBHOOK_TOKEN;

app.get('/webhook', (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === WEBHOOK_TOKEN) {
        console.log("✅ Webhook verified");
        return res.status(200).send(challenge);
    }

    console.log("❌ Verification failed");
    res.sendStatus(403);
})

app.post('/webhook', async (req, res) => {
    try {
        const { entry } = req.body;
        if (!entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            return res.sendStatus(200); // Not a message or empty
        }

        const messagePacket = entry[0].changes[0].value.messages[0];
        const from = messagePacket.from; // Phone number
        let userText = "";
        let buttonId = "";

        // Handle different message types
        if (messagePacket.type === "text") {
            userText = messagePacket.text?.body;
        } else if (messagePacket.type === "interactive") {
            const interactive = messagePacket.interactive;
            if (interactive.type === "button_reply") {
                buttonId = interactive.button_reply?.id;
                userText = interactive.button_reply?.title;
                console.log(`🔘 Button clicked: ${buttonId} (${userText})`);
            }
        }

        if (!userText && !buttonId && messagePacket.type !== "image") return res.sendStatus(200);

        console.log(`📩 Received WhatsApp from ${from}: ${userText}`);

        // Handle "Call Me" button or command
        const callKeywords = ['call me', 'phone call'];
        const shouldCall = buttonId === "call_me" || callKeywords.some(k => userText.toLowerCase().includes(k));

        if (shouldCall) {
            console.log("📞 Triggering call logic for", from);
            // Fix: Use correct endpoint and payload for calling
            try {
                await axios.post('https://teensy-unenterprisingly-laila.ngrok-free.dev', {
                    userId: "6969faf3cf2f6f7e39bb0b07", // Use the sender's phone number
                    query: "hello"
                });
                await sendWhatsAppMessage(from, "ठीक है! मैं आपको अभी कॉल कर रही हूँ। (Okay! I am calling you now.)");
            } catch (callError: any) {
                console.error("❌ Call Trigger Error:", callError.response?.data || callError.message);
                await sendWhatsAppMessage(from, "माफ़ कीजिए, कॉल शुरू करने में समस्या हुई। कृपया बाद में कोशिश करें।");
            }
            return res.status(200).send("Call initiated");
        }

        // Handle termination
        const terminationKeywords = ['bye', 'exit', 'stop', 'done', 'tata', 'शुक्रिया', 'नमस्ते'];
        const shouldTerminate = buttonId === "end_chat" || terminationKeywords.some(k => userText.toLowerCase().includes(k));

        if (shouldTerminate) {
            await sendWhatsAppMessage(from, "धन्यवाद! अगर आपको फिर से मदद चाहिए तो कभी भी मैसेज करें। शुभ दिन! (Goodbye! Feel free to message anytime.)");
            conversationSessions.delete(from);
            return res.status(200).send("Session terminated");
        }

        // Session management
        if (!conversationSessions.has(from)) {
            conversationSessions.set(from, {
                history: [
                    { role: 'system' as any, content: "You are Bhoomi, a helpful Digital Agronomist assisting farmers. You can analyze images of crops to identify pests, diseases, or deficiencies. Keep responses concise, empathetic, and in the language of the user (mainly Hindi/English). Provide practical organic and chemical solutions. Max 60 words." }
                ],
                language: 'Mixed'
            });
        }

        const session = conversationSessions.get(from)!;

        let messageContent: any = userText;
        console.log("Received message:", messagePacket);
        // Handle images
        if (messagePacket.type === "image") {
            const mediaId = messagePacket.image?.id;
            const caption = messagePacket.image?.caption || "";
            console.log(`🖼️ Received image from ${from}, mediaId: ${mediaId}`);

            try {
                const base64Image = await downloadWhatsAppMedia(mediaId);
                messageContent = [
                    { type: "text", text: caption || "Please analyze this image for any pests, diseases, or crop health issues and suggest solutions." },
                    { type: "image_url", image_url: { url: base64Image } }
                ];
                // If it's just an image with no caption and no previous text, we use a default prompt
                if (!caption && !userText) {
                    userText = "Image upload analysis";
                }
            } catch (imageError) {
                console.error("Error processing image:", imageError);
                await sendWhatsAppMessage(from, "माफ़ कीजिए, मैं आपकी फोटो को प्रोसेस नहीं कर पाया। (Sorry, I couldn't process your photo.)");
                return res.sendStatus(200);
            }
        }

        session.history.push({ role: 'user', content: messageContent });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Using 4o for better performance/speed
            messages: session.history,
            max_tokens: 500 // Increased for more detailed analysis
        });

        const aiResponse = completion.choices[0].message.content || "माफ़ कीजिए, मैं अभी जवाब नहीं दे पा रहा हूँ।";

        session.history.push({ role: 'assistant', content: aiResponse });

        // Send AI reply followed by interactive buttons
        await sendWhatsAppMessage(from, aiResponse);

        await sendWhatsAppInteractive(from, "आप आगे क्या करना चाहेंगे? (What would you like to do next?)", [
            { id: "call_me", title: "📞 Call Me" },
            { id: "end_chat", title: "👋 End Chat" }
        ]);

        res.status(200).send("webhook processed");
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.sendStatus(500);
    }
})

//@ts-ignore
const WHATSAPP_TOKEN = "EAAYRszYGgX8BQ88yI0ZANGnSIgcL6fTVTX3LLlqkbXaXt0Sb9jbiSX5ruimZBJ2PNGH3r1pRWBIsylAXzPZC9ocgKCQUpKCZAfnRZCq4tb5Xy5FaNtfxpaF6Xe4wdZAEQ4vHLuWylj7jlFnABoAhMn1d7AMBaqiW4V8QrAQowYIDk7CSZBLMxZCCQl6QRVqGB6k0wTcZC4EMPegJq9T4sZBFe0O6l5ZAUyVMSOxm0ZC8081KFUbzNn5nat7ACJGZALpJ2TXYvLIYe9hhVoVXIUiGoDEYCIUk29wZDZD" || process.env.WHATSAPP_TOKEN;

export async function sendWhatsAppMessage(to: string, message: string) {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/1062153640304536/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Message sent:", response.data);
        return response.data;

    } catch (error) {
        console.error(
            "❌ WhatsApp Send Error:",
            error.response?.data || error.message
        );
        throw error;
    }
}

export async function sendWhatsAppInteractive(to: string, bodyText: string, buttons: { id: string, title: string }[]) {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/1062153640304536/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: {
                        text: bodyText
                    },
                    action: {
                        buttons: buttons.map(b => ({
                            type: "reply",
                            reply: {
                                id: b.id,
                                title: b.title
                            }
                        }))
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Interactive Message sent:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "❌ WhatsApp Interactive Error:",
            error.response?.data || error.message
        );
        throw error;
    }
}

export async function downloadWhatsAppMedia(mediaId: string): Promise<string> {
    try {
        // Step 1: Get the media URL
        const urlResponse = await axios.get(
            `https://graph.facebook.com/v22.0/${mediaId}`,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                },
            }
        );

        const downloadUrl = urlResponse.data.url;

        // Step 2: Download the media
        const mediaResponse = await axios.get(downloadUrl, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            },
            responseType: 'arraybuffer',
        });

        // Convert to base64
        const base64Image = Buffer.from(mediaResponse.data, 'binary').toString('base64');
        const mimeType = mediaResponse.headers['content-type'] || 'image/jpeg';

        return `data:${mimeType};base64,${base64Image}`;
    } catch (error: any) {
        console.error("❌ WhatsApp Media Download Error:", error.response?.data || error.message);
        throw error;
    }
}

app.listen(3000, () => console.log("express running on 3000"))