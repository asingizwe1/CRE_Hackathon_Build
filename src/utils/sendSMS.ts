export async function sendSMS({
    to,
    message,
}: {
    to: string;
    message: string;
}) {
    const apiKey = import.meta.env.VITE_MyAppApiKey;
    const username = import.meta.env.VITE_AT_USERNAME;

    if (!apiKey || !username) {
        console.error("Missing Africa's Talking env vars");
        return;
    }

    const body = new URLSearchParams({
        username,
        to,
        message,
    });

    const res = await fetch(
        "https://api.sandbox.africastalking.com/version1/messaging",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                apiKey,
            },
            body,
        }
    );

    const data = await res.json();
    console.log("📩 SMS response:", data);
    return data;
}
