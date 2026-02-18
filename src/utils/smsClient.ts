// export async function notifySMS(to: string, message: string) {
//     try {
//         await fetch("http://localhost:3001/sms", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ to, message }),
//         });
//     } catch {
//         // 🔕 Silent fail (intended)
//     }
// }
export async function notifySMS(to: string, message: string) {
    try {
        const res = await fetch("http://localhost:3001/sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to, message }),
        });

        const data = await res.json();
        console.log("📩 SMS CLIENT RESPONSE:", data);

        return data;
    } catch (err) {
        console.error("❌ SMS CLIENT ERROR:", err);
        return null;
    }
}
