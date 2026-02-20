import { tavily } from "@tavily/core";
import { configDotenv } from "dotenv";
configDotenv()

export const tvly = tavily({ apiKey: process.env.tavily! });