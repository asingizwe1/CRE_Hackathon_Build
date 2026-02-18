import { useEffect, useState } from "react";
import { useCoreMicroBank } from "../hooks/useCoreMicroBank";
import { notifySMS } from "@/utils/smsClient";
import { ugxApproxFromUsd } from "@/utils/sharedUtils";

const UGX_PER_USD = 3600;

const formCard = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #f1f5f9",
    fontSize: 14,
    outline: "none",
};

const actionBtn = {
    marginTop: 12,
    width: "100%",
    padding: 12,
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
};

const LoanSection = () => {
    const { requestLoan, repayLoan, maxBorrowable, getUserDebt } =
        useCoreMicroBank();

    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [max, setMax] = useState<string | null>(null);
    const [ugxPreview, setUgxPreview] = useState<number | null>(null);

    // ✅ UGX approximation preview
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

    // ✅ Request loan
    const handleRequest = async () => {
        if (!phone || !amount) {
            alert("Missing fields");
            return;
        }

        try {
            await requestLoan(phone, amount);

            notifySMS(
                phone,
                `Osuubiddwa ssente mu Liquid.\n` +
                `Amount / Omuwendo: UGX ${amount}\n` +
                `Webale nnyo / Thank you`
            );

            alert("Loan requested");
        } catch (e) {
            console.error(e);
            alert("Loan request failed");
        }
    };

    // ✅ Repay loan
    const handleRepay = async () => {
        if (!phone || !amount) {
            alert("Missing fields");
            return;
        }

        const debt = await getUserDebt(phone);

        if (Number(amount) > Number(debt)) {
            alert(`Cannot repay more than outstanding debt (${debt})`);
            return;
        }

        try {
            await repayLoan(phone, amount);
            alert("Loan repaid");
        } catch (err) {
            console.error(err);
            alert("Repay failed");
        }
    };

    // ✅ Max borrowable
    const handleMaxBorrowable = async () => {
        if (!phone) return alert("Enter phone first");
        const value = await maxBorrowable(phone);
        setMax(value);
    };

    // ✅ Repay full
    const handleRepayFull = async () => {
        if (!phone) return alert("Enter phone first");
        const debt = await getUserDebt(phone);
        setAmount(debt);
    };

    return (
        <section id="loan" style={{ padding: "100px 20px" }}>
            <h2> Loans</h2>

            <div style={{ maxWidth: 400, ...formCard }}>
                <input
                    placeholder="User phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ ...inputStyle, width: "90%" }}
                />

                <input
                    placeholder="Amount (USD)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ ...inputStyle, width: "90%" }}
                />

                {ugxPreview !== null && (
                    <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
                        ≈ UGX {ugxPreview.toLocaleString()}
                    </div>
                )}

                <button style={actionBtn} onClick={handleRequest}>
                    Request Loan
                </button>

                <button style={actionBtn} onClick={handleRepay}>
                    Repay Loan
                </button>

                {/* <button style={actionBtn} onClick={handleMaxBorrowable}>
                    Check Max Borrowable
                </button>

                {max && <p>Max Borrowable: {max}</p>}

                <button style={actionBtn} onClick={handleRepayFull}>
                    Repay Full
                </button> */}

                {/* <p>Outstanding Debt: {max}</p> */}
            </div>
        </section>
    );
};

export default LoanSection;
