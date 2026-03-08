export const saveDemoEventRemote = async (payload: Record<string, any>) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/demo-event`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_RESOLVER_API_KEY,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`demo-event failed: ${res.status}`);
    }

    return await res.json();
};