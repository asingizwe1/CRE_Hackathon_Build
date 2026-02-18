// utils/userDirectory.ts
export const saveUserPhone = (userId: string, phone: string) => {
    localStorage.setItem(`user:${userId}`, phone);
};

export const getUserPhone = (userId: string): string | null => {
    return localStorage.getItem(`user:${userId}`);
};