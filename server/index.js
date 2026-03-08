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

    const normalized = phone.trim();
    const normalizedId = String(userId).toLowerCase();
    store[normalizedId] = normalized;
    persist();

    console.log(`Saved mapping ${normalizedId} -> ${normalized}`);
    return res.json({ ok: true });
});

// Resolve endpoint used by CRE
app.post("/resolve", (req, res) => {
    const key = req.header("x-api-key");
    if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "missing userId" });
    const normalizedId = String(userId).toLowerCase();
    const phone = store[normalizedId] || null;
    return res.json({ phone });
});

app.post("/notify", async (req, res) => {
    const key = req.header("x-api-key");
    if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });

    const {
        userId,
        eventType,
        netAmount,
        feeAmount,
        usdtAmount,
        liquidAmount,
        amount,
        totalDebt,
        debtCleared,
    } = req.body;

    if (!userId || !eventType) {
        return res.status(400).json({ error: "missing fields" });
    }

    const normalizedId = String(userId).toLowerCase();
    const phone = store[normalizedId] || null;

    if (!phone) {
        return res.json({ ok: false, error: "no phone found" });
    }

    let message = "Event received.";
    switch (eventType) {
        case "UserRegistered":
            message = "✅ Registration successful. Welcome to CoreMicroBank.";
            break;
        case "DepositRecorded":
            message = `💰 Deposit recorded. Net: ${netAmount} (fee: ${feeAmount}).`;
            break;
        case "FeesConvertedToLiquid":
            message = `🤖 Automation: Fees auto-converted & staked. ${usdtAmount} → LIQ ${liquidAmount}.`;
            break;
        case "LoanIssued":
            message = `📢 Loan issued: ${amount}. Total debt: ${totalDebt}.`;
            break;
        case "DemoActiveBorrowerUpdated":
            message = "🕒 You are the active borrower. Interest will auto-accrue.";
            break;
        case "WithdrawalProcessed":
            message = `✅ Withdrawal processed: ${amount}.`;
            break;
        case "UserLiquidated":
            message = `⚠️ Liquidation executed. Debt cleared: ${debtCleared}.`;
            break;
    }

    try {
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
                to: phone,
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

        return res.json({ ok: true, phone, message, data });
    } catch (err) {
        console.error("notify error:", err);
        return res.json({ ok: false, error: "notify failed" });
    }
});
// Optional SMS proxy for local demo
app.post("/sms", async (req, res) => {
    const { to, message } = req.body;

    // respond 200 even when missing so CRE doesn't treat as hard failure
    if (!to || !message) {
        console.warn("SMS request missing fields:", { to, message });
        return res.json({ ok: false, error: "missing fields" }); // HTTP 200
    }

    try {
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
            // If response isn't JSON, still return 200 with raw text
            console.warn("AT returned non-JSON:", text);
            return res.json({ ok: false, raw: text });
        }

        return res.json({ ok: true, data });
    } catch (err) {
        console.error("SMS error:", err);
        return res.json({ ok: false, error: "sms send failed" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Resolver SMS server running on http://localhost:${PORT}`);
});
