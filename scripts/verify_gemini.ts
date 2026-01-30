import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
const logFile = path.join(process.cwd(), "verify_log.txt");

function log(message: string) {
    console.log(message);
    fs.appendFileSync(logFile, message + "\n");
}

if (!apiKey) {
    log("❌ Missing GEMINI_API_KEY");
    process.exit(1);
}

// Clear log file
if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    log("----------------------------------------");
    log("🧪 Testing Gemini Configuration");
    log("----------------------------------------");

    // 1. Test Simple Generation with 2.5-flash
    log("\n1️⃣  Testing Simple Generation (gemini-2.5-flash)...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say 'Hello World'");
        log("✅ Success: " + result.response.text().trim());
    } catch (e: any) {
        log("❌ Failed: " + e.message);
    }

    // 2. Test Search with googleSearchRetrieval
    log("\n2️⃣  Testing Search Tool (googleSearchRetrieval)...");
    try {
        const searchModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearchRetrieval: {} }],
        });
        const result = await searchModel.generateContent("What is the latest breaking news in Brazil today? Short answer.");
        log("✅ Success: " + result.response.text());
    } catch (e: any) {
        log("❌ Failed: " + e.message);
    }

    // 3. Test Search with googleSearch (Legacy/Alternative?)
    log("\n3️⃣  Testing Search Tool (googleSearch)...");
    try {
        const searchModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} } as any], // Cast to any to bypass TS check if needed
        });
        const result = await searchModel.generateContent("What is the latest breaking news in Brazil today? Short answer.");
        log("✅ Success: " + result.response.text());
    } catch (e: any) {
        log("❌ Failed: " + e.message);
    }

    // 4. Test 1.5-flash + Google Search Retrieval (Control Group)
    log("\n4️⃣  Testing 1.5-flash + googleSearchRetrieval (Control)...");
    try {
        const searchModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            tools: [{ googleSearchRetrieval: {} }],
        });
        const result = await searchModel.generateContent("What is the latest breaking news in Brazil today? Short answer.");
        log("✅ Success: " + result.response.text());
    } catch (e: any) {
        log("❌ Failed: " + e.message);
    }
}

test();
