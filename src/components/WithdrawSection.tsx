// Contract logic

// Only allowed when loan = 0

// Bonus LIQ is auto handled
import { useState } from "react";
import { useCoreMicroBank } from "../hooks/useCoreMicroBank";
import VoucherDisplay from "./VoucherDisplay";
import { ugxApproxFromUsd } from "@/utils/sharedUtils";
//import { sendSMS } from "../utils/sendSMS";
//import { getUserPhone } from "../utils/userDictionary";
import { saveUserPhone, saveUserPhoneRemote } from "../utils/userDictionary";
// import { phoneToUserId } from "../utils/userId";
import { saveDemoEventRemote } from "@/utils/demoEvent";
import type { Voucher } from "@/types/voucher";
import { useEffect } from "react";

const formCard = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
};
const UGX_PER_USD = 3600;
const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
};
const WithdrawSection = ({ totalLiquidStaked }: { totalLiquidStaked: number }) => {

    const hasYield = totalLiquidStaked > 0;
    const [voucher, setVoucher] = useState<Voucher | null>(null);


    const { withdraw, phoneToUserId, getUserState } = useCoreMicroBank();
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [ugxPreview, setUgxPreview] = useState<number | null>(null);


    // const handleWithdraw = async () => {
    //     if (!phone || !amount) return alert("Missing fields");

    //     try {
    //         const tx = await withdraw(phone, amount);
    //         console.log("WITHDRAW TX:", tx);

    //         setVoucher({
    //             phone,
    //             amount: Number(amount),
    //             code: crypto.randomUUID().slice(0, 8).toUpperCase(),
    //             issuedAt: Date.now(),
    //             txHash: tx.hash,
    //         });

    //         alert("Withdraw successful");
    //     } catch (err) {
    //         console.error(err);
    //         alert("Withdraw failed");
    //     }
    // };
    // const handleWithdraw = async () => {
    //     if (!phone || !amount) return alert("Missing fields");

    //     // normalize and compute userId
    //     const normalized = phone.trim();
    //     const userId = phoneToUserId(normalized);

    //     // persist mapping remotely (so CRE resolver can resolve later)
    //     try {
    //         await saveUserPhoneRemote(userId, normalized);
    //     } catch (err) {
    //         // non-fatal for demo: continue but log
    //         console.warn("Remote save failed; continuing with local save", err);
    //     }

    //     // keep local copy for UI convenience
    //     saveUserPhone(userId, normalized);
    //     localStorage.setItem("lastPhone", normalized);
    //     await saveDemoEventRemote({
    //         eventType: "WithdrawalProcessed",
    //         userId,
    //         amount: Number(amount),
    //     });
    //     // call contract via your hook (adapt if your hook expects phone instead of userId)
    //     try {
    //         // If your hook expects userId:
    //         const tx = await withdraw(normalized, amount);

    //         // If your hook expects phone, change the hook to accept userId or pass normalized phone consistently.
    //         await tx.wait?.();
    //         setVoucher({
    //             phone: normalized,
    //             amount: Number(amount),
    //             code: crypto.randomUUID().slice(0, 8).toUpperCase(),
    //             issuedAt: Date.now(),
    //             txHash: tx.hash,
    //         });
    //         alert("Withdraw successful");
    //     } catch (err) {
    //         console.error("Withdraw failed", err);
    //         alert("Withdraw failed");
    //     }
    // };

    const handleWithdraw = async () => {
        if (!phone || !amount) return alert("Missing fields");

        const normalized = phone.trim();

        try {
            const userId = phoneToUserId(normalized);

            // confirm this exact phone maps to an existing on-chain user
            const userState = await getUserState(normalized);
            if (!userState.exists) {
                alert("User not found for this phone. Use the exact phone format used during registration.");
                return;
            }

            try {
                await saveUserPhoneRemote(userId, normalized);
            } catch (err) {
                console.warn("Remote save failed; continuing with local save", err);
            }

            saveUserPhone(userId, normalized);
            localStorage.setItem("lastPhone", normalized);

            await saveDemoEventRemote({
                eventType: "WithdrawalProcessed",
                userId,
                amount: Number(amount),
            });

            const tx = await withdraw(normalized, amount);
            await tx.wait?.();

            setVoucher({
                phone: normalized,
                amount: Number(amount),
                code: crypto.randomUUID().slice(0, 8).toUpperCase(),
                issuedAt: Date.now(),
                txHash: tx.hash,
            });

            alert("Withdraw successful");
        } catch (err: any) {
            console.error("Withdraw failed", err);
            const msg =
                err?.error?.message ||
                err?.data?.message ||
                err?.reason ||
                err?.message ||
                "Withdraw failed";
            alert(msg);
        }
    };

    useEffect(() => {
        if (!amount) {
            setUgxPreview(null);
            return;
        }

        const usd = Number(amount);
        if (isNaN(usd)) return;

        const ugx = ugxApproxFromUsd(usd, UGX_PER_USD);
        setUgxPreview(ugx);
    }, [amount]);


    return (
        <section id="withdraw" style={{ padding: "100px 20px" }}>
            <h2> Withdraw</h2>

            <div style={{ maxWidth: 420, ...formCard }}>
                <input
                    placeholder="User phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                />

                <input
                    placeholder="Amount (USD)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{ ...inputStyle, width: "90%" }}
                />
                {ugxPreview !== null && (
                    <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
                        ≈ UGX {ugxPreview.toLocaleString()}
                    </div>
                )}
                <VoucherDisplay voucher={voucher} context="withdraw" />


                <button
                    onClick={handleWithdraw}
                    disabled={!hasYield}
                    style={{
                        marginTop: 16,
                        width: "100%",
                        padding: 12,
                        borderRadius: 12,
                        fontWeight: 600,
                        background: hasYield ? "#111827" : "#9ca3af",
                        color: "#fff",
                        cursor: hasYield ? "pointer" : "not-allowed",
                    }}
                >
                    Withdraw
                </button>

                {!hasYield && (
                    <p style={{ color: "orange", marginTop: 8 }}>
                        Yield not available yet. Convert fees first.
                    </p>
                )}


            </div>
        </section>
    );
};

export default WithdrawSection;
