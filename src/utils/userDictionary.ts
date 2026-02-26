// utils/userDirectory.ts
export const saveUserPhone = (userId: string, phone: string) => {
    localStorage.setItem(`user:${userId}`, phone);
};

export const getUserPhone = (userId: string): string | null => {
    return localStorage.getItem(`user:${userId}`);
};
//cant sendCRE cannot access browser localStorage. 
// Instead, when the agent records a deposit (or registers a user), 
// POST the mapping to your backend so CRE can query it.
//persist mapping to your backend
export const saveUserPhoneRemote = async (userId: string, phone: string) => { await fetch(`${import.meta.env.VITE_API_BASE}/user`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_API_KEY }, body: JSON.stringify({ userId, phone }), }); };