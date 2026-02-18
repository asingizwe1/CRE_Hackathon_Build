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
/////////////////////
import dotenv from "dotenv";
dotenv.config();
console.log("API KEY:", process.env.AT_API_KEY);
console.log("USERNAME:", process.env.AT_USERNAME);

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/sms", async (req, res) => {
    const { to, message } = req.body;

    console.log("📨 Incoming SMS request:", to, message);

    try {
        const response = await fetch(
            "https://api.africastalking.com/version1/messaging/bulk",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    apiKey: process.env.AT_API_KEY,
                },
                body: JSON.stringify({
                    username: process.env.AT_USERNAME,
                    phoneNumbers: [to],   // MUST be array
                    message: message,
                }),
            }
        );

        const text = await response.text();   // 👈 IMPORTANT: read raw first
        console.log("📡 Raw Africa's Talking response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("❌ Not JSON response from Africa's Talking");
            return res.json({ ok: false, raw: text });
        }

        console.log("✅ Parsed SMS response:", data);

        res.json({ ok: true, data });

    } catch (err) {
        console.error("❌ SMS error:", err);
        res.json({ ok: false });
    }
});

app.listen(3001, () => {
    console.log("SMS server running on http://localhost:3001");
});
