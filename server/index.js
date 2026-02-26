// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post("/sms", async (req, res) => {
//     const { to, message } = req.body;

//     console.log("📨 Incoming SMS request:", to, message);

//     try {
//         const response = await fetch(
//             // "https://api.sandbox.africastalking.com/version1/messaging"
//             "https://api.africastalking.com/version1/messaging",
//             {
//                 method: "POST",
//                 headers: {
//                     Accept: "application/json",
//                     "Content-Type": "application/x-www-form-urlencoded",
//                     apiKey: process.env.AT_API_KEY,
//                 },
//                 body: new URLSearchParams({
//                     username: process.env.AT_USERNAME,
//                     to,
//                     message,
//                 }),
//             }
//         );

//         const data = await response.json();

//         console.log("📡 Africa's Talking response:", data);

//         // 🚨 SMS failure MUST NOT break frontend
//         res.json({ ok: true, data });

//     } catch (err) {
//         console.error("SMS error:", err);
//         res.json({ ok: false });
//     }
// });

// app.listen(3001, () => {
//     console.log("SMS server running on http://localhost:3001");
// });


///////////////sandbox
//https://api.sandbox.africastalking.com/...this only simulates on postman
/////////////////////// server/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.RESOLVER_API_KEY || "dev-resolver-key";
const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;

// Simple persistent store for demo (file-backed). Replace with DB in prod.
const STORE_FILE = "./userStore.json";
let store = {};
try {
    if (fs.existsSync(STORE_FILE)) {
        store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
    }
} catch (e) {
    console.error("Failed to load store file", e);
}

// helper to persist
const persist = () => {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    } catch (e) {
        console.error("Failed to persist store", e);
    }
};

// Save mapping endpoint
app.post("/user", (req, res) => {
    const key = req.header("x-api-key");
    if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });

    const { userId, phone } = req.body;
    if (!userId || !phone) return res.status(400).json({ error: "missing fields" });

    // Normalize phone: trim and ensure leading plus if you expect it
    const normalized = phone.trim();
    store[userId] = normalized;
    persist();

    console.log(`Saved mapping ${userId} -> ${normalized}`);
    return res.json({ ok: true });
});

// Resolve endpoint used by CRE
app.post("/resolve", (req, res) => {
    const key = req.header("x-api-key");
    if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "missing userId" });

    const phone = store[userId] || null;
    return res.json({ phone });
});

// Optional SMS proxy for local demo
app.post("/sms", async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) return res.status(400).json({ error: "missing fields" });

    try {
        // Use sandbox endpoint for testing if you have sandbox credentials
        const url = process.env.AT_SANDBOX === "true"
            ? "https://api.sandbox.africastalking.com/version1/messaging"
            : "https://api.africastalking.com/version1/messaging";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                apiKey: AT_API_KEY,
            },
            body: new URLSearchParams({
                username: AT_USERNAME,
                to,
                message,
            }),
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return res.json({ ok: false, raw: text });
        }

        return res.json({ ok: true, data });
    } catch (err) {
        console.error("SMS error:", err);
        return res.json({ ok: false });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Resolver SMS server running on http://localhost:${PORT}`);
});
