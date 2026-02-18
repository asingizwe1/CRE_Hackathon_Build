export type Voucher = {
    phone: string;
    amount: number;
    code: string;
    issuedAt: number;
    txHash?: string;
};