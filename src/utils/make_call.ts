import { configDotenv } from "dotenv";
import twilio from "twilio"
configDotenv()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const client = twilio(accountSid, authToken);

export async function createCall(answer:string): Promise<any> {
 try {
   const call = await client.calls.create({
     from: "+18173693739",
     to: "+919696645655",
     twiml: answer,
   });
   console.log(call)
   return call.sid 
 } catch (error) {
  console.log("error in calling",error)
 }
};


export async function createMessage(sms:string) {
  const message = await client.messages.create({
    body: sms,
    from: "+18173693739",
    to: "+919696645655",
  });

  console.log(message.body);
}