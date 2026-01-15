import express, { Request, Response }  from "express";
import { network, getBhoomiAdvice, farmerWorkflow, sendSMS, fastDetect } from "./inngest/functions";
import { createServer } from '@inngest/agent-kit/server';
import { serve } from 'inngest/express';
import { inngest } from './inngest/client';
import { configDotenv } from "dotenv";
import { signin, signup } from "./types/signup";
import mongoose from "mongoose";
import UserModel from "./model/user.model";
configDotenv()

const app=express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
mongoose.connect(process.env.mongo_URL!)

app.use("/api/inngest", serve({ 
    client: inngest, 
    functions: [farmerWorkflow,sendSMS] 
}));

interface ConversationSession {
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    language: string;
}

const conversationSessions = new Map<string, ConversationSession>();

app.post('/bhoomi-followup', async (req, res) => {
    try {
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
            
            if (session.history.length > 0) {
                await inngest.send({
                    name: "send-sms",
                    id: `send-sms`,
                    data: {
                        input: conversationText,
                        lang: langForSMS
                    }
                });
                console.log("chat length",session.history.length)
                console.log("SMS sent with conversation history");
            }
            
            conversationSessions.delete(callSid);
            return res.type('text/xml').send('<Response><Say voice="Polly.Aditi" language="en-IN">Goodbye!</Say><Hangup/></Response>');
        }

        if (session.history.length === 0) {
            const detectedLang = fastDetect(userSpeech);
            session.language = detectedLang;
            console.log("Detected language:", detectedLang);
        }

        session.history.push({ role: 'user', content: userSpeech });

        const nextAnswer = await getBhoomiAdvice(userSpeech);
        console.log("nextAnswer-------", nextAnswer);

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
                    action="https://constructed-wrote-functions-telecom.trycloudflare.com/bhoomi-followup" 
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
        res.type('text/xml').send('<Response><Say voice="Polly.Aditi" language="en-IN">I apologize, but an error occurred. Please try again later.</Say><Hangup/></Response>');
    }
});

app.post('/signup',async (req:Request,res:Response)=>{
    console.log(req.body)
    try {
        const data=signup.safeParse(req.body)
        if(!data.success){
            return res.status(400).json({"message":"data is missing"})
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

        res.status(200).json({"message":"user created successfully"})

    } catch (error) {
        console.log("Error in signup",error)
        return res.status(500).json({"message":"server error has occured"})   
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

        res.status(200).json({ "message": "User logged in successfully" });

    } catch (error) {
        console.log("Error in signin", error);
        return res.status(500).json({ "message": "Server error has occured" });
    }
});

app.get("/",(req,res)=>{
    res.send("healthy")
})

app.post('/',async (req,res)=>{
    try {
        const {query,phone_number}=req.body
        if(!query){
            return res.status(404).json({"message":"no query found"})
        }

        // @ts-ignore
        await network.run({query,phone_number});
        return res.status(200).json({"message":"network run successfully"})
    } catch (error) {
        console.log("Error in /",error)
        return res.status(500).json({"message":"server error has occured"}) 
    }
})

app.listen(3000,()=> console.log("express running on 3000"))

const server = createServer({
    networks: [network]
})

server.listen(3010, () => console.log("Agent kit running!"));