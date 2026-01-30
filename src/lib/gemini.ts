import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

export const searchModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // @ts-ignore - SDK types are out of sync with API requirements for 2.5-flash
    tools: [{ googleSearch: {} }]
});
