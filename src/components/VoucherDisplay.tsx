// components/VoucherDisplay.tsx
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import logo from "../assets/logo.png";
import { toPng } from "html-to-image";
import { useRef } from "react";
import type { Voucher } from "@/types/voucher";

// type Voucher = {
//     phone: string;
//     amount: number;
//     code: string;
//     issuedAt: number;
//     txHash?: string;
// };



const styles: any = {
    wrapper: {
        marginTop: 40,
        display: "flex",
        justifyContent: "center",
    },

    voucher: (active: boolean) => ({
        position: "relative",
        width: 420,
        padding: 24,
        borderRadius: 12,
        background: active
            ? 'linear-gradient(135deg, #f8fafc, #eef2f7)'
            : 'linear-gradient(135deg, #e5e7eb, #f3f4f6)',
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        clipPath:
            "polygon(0 0, 100% 0, 100% 94%, 95% 100%, 90% 94%, 85% 100%, 80% 94%, 75% 100%, 70% 94%, 65% 100%, 60% 94%, 55% 100%, 50% 94%, 45% 100%, 40% 94%, 35% 100%, 30% 94%, 25% 100%, 20% 94%, 15% 100%, 10% 94%, 5% 100%, 0 94%)",
        overflow: "hidden",
    }),

    shimmer: {
        position: "absolute",
        inset: 0,
        background:
            "linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 70%)",
        animation: "shimmer 2s infinite",
    },

    logo: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 48,
        opacity: 0.9,
    },

    title: {
        textAlign: "center",
        fontWeight: 700,
        letterSpacing: 1,
        marginBottom: 20,
    },

    body: {
        display: "flex",
        gap: 16,
    },

    qrBox: {
        width: 110,
        height: 110,
        background: '#f8fafc',
        boxShadow: 'inset 0 0 0 1px #e5e7eb',
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    qrPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 6,
        background:
            "repeating-linear-gradient(45deg, #d1d5db, #d1d5db 10px, #e5e7eb 10px, #e5e7eb 20px)",
    },

    details: {
        flex: 1,
    },

    line: {
        margin: "6px 0",
        fontSize: 14,
        color: "#111827",
    },

    code: (active: boolean) => ({
        marginTop: 10,
        padding: "6px 10px",
        borderRadius: 6,
        fontWeight: 700,
        letterSpacing: 1,
        background: '#0b1220',
        color: '#f8fafc',
        filter: active ? "none" : "blur(4px)",
    }),

    time: {
        marginTop: 6,
        fontSize: 12,
        color: "#6b7280",
    },
};


type VoucherDisplayProps = {
    voucher: Voucher | null;
    context?: "deposit" | "withdraw"; // 👈 NEW (optional, default-safe)
};
const VoucherDisplay = ({
    voucher,
    context = "deposit",
}: VoucherDisplayProps) => {
    const UGX_PER_USD = 3800; // or your actual rate

    const formatUsd = (val: number) =>
        val.toFixed(2); // only 2dp for display

    const formatUgx = (val: number) =>
        Math.round(val).toLocaleString(); // no decimals for UGX

    const ugxApproxFromUsd = (usd: number) =>
        usd * UGX_PER_USD;

    const hasVoucher = voucher !== null;
    const voucherRef = useRef<HTMLDivElement>(null);
    const downloadVoucher = async () => {
        if (!voucherRef.current) return;

        const dataUrl = await toPng(voucherRef.current);
        const link = document.createElement("a");
        link.download = "liquid-agent-voucher.png";
        link.href = dataUrl;
        link.click();
    };

    // const qrPayload = hasVoucher
    //     ? JSON.stringify({
    //         type: voucher.amount === 0 ? "USER_REGISTRATION" : "VALUE_VOUCHER",
    //         userId: voucher.code,
    //         amount: voucher.amount,
    //         issuedAt: voucher.issuedAt,
    //     })
    //     : "";
    const qrPayload =
        hasVoucher && voucher?.txHash
            ? `https://sepolia.etherscan.io/tx/${voucher.txHash}`
            : "";

    return (
        <div style={styles.wrapper}>
            <div ref={voucherRef} style={styles.voucher(hasVoucher)}>
                {/* Shimmer overlay (only when empty) */}
                {!hasVoucher && <div style={styles.shimmer} />}

                {/* Logo */}
                <img
                    src={logo}
                    alt="Liquid Agent"
                    style={styles.logo}
                />

                {/* Header */}
                <h3 style={styles.title}>
                    {voucher?.amount === 0
                        ? "LIQUID AGENT USER ID"
                        : "LIQUID AGENT VOUCHER"}
                </h3>


                {/* Body */}

                <div style={styles.body}>
                    {/* QR Section */}
                    <div style={styles.qrBox}>
                        {hasVoucher && voucher?.txHash ? (
                            <a
                                href={`https://sepolia.etherscan.io/tx/${voucher.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: "inline-block", cursor: "pointer" }}
                                title="View transaction on Etherscan"
                            >
                                <QRCodeSVG
                                    value={`https://sepolia.etherscan.io/tx/${voucher.txHash}`}
                                    size={100}
                                    bgColor="#ffffff"
                                    fgColor="#111827"
                                />
                            </a>
                        ) : (
                            <div style={styles.qrPlaceholder} />
                        )}
                    </div>


                    {/* Later, you can replace the hardcoded URL with env:

const EXPLORER = import.meta.env.VITE_EXPLORER_URL; */}

                    {/* Details */}
                    <div style={styles.details}>
                        <p style={styles.line}>
                            <strong>Phone / Essimu:</strong>{" "}
                            {hasVoucher ? voucher!.phone : "••••••••"}
                        </p>

                        <p style={styles.line}>
                            <strong>Amount / Omuwendo:</strong>{" "}
                            {hasVoucher ? (
                                context === "withdraw" ? (
                                    <>
                                        ${formatUsd(voucher!.amount)}{" "}
                                        (≈ UGX {formatUgx(ugxApproxFromUsd(voucher!.amount))})
                                    </>
                                ) : (
                                    <>UGX {formatUgx(voucher!.amount)}</>
                                )
                            ) : (
                                context === "withdraw" ? "$•••• (≈ UGX ••••)" : "UGX ••••"
                            )}
                        </p>


                        <p style={styles.line}>
                            <strong>Issued / Yafunye ku:</strong>{" "}
                            {hasVoucher
                                ? new Date(voucher!.issuedAt).toLocaleString()
                                : "••••••"}
                        </p>

                        <p style={styles.code(hasVoucher)}>
                            {hasVoucher ? voucher!.code : "VOUCHER-CODE-XXXX"}
                        </p>

                        {hasVoucher && (
                            <button
                                onClick={downloadVoucher}
                                style={{
                                    marginTop: 16,
                                    width: "95%",
                                    maxWidth: 240,
                                    padding: 10,
                                    background: "#111827",
                                    color: "#fff",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                }}
                            >
                                ⬇ Download Voucher
                            </button>
                        )}y
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherDisplay;



// ┌──────────────────────────────┐
// │  Torn Edge / Zigzag Outline  │  ← CSS clip-path or SVG
// ├──────────────────────────────┤
// │  Header                      │
// │  Logo        Voucher Title   │
// ├──────────────────────────────┤
// │  Body                        │
// │  QR Code   |  Details        │
// │            |  Amount         │
// │            |  Voucher Code   │
// │            |  Date           │
// ├──────────────────────────────┤
// │  Footer (branding / note)    │
// └──────────────────────────────┘


// Option A (recommended): CSS clip-path

// Use clip-path: polygon(...)

// Gives you zig-zag / receipt effect

// Lightweight, no images

// This matches the third image you attached best.

// Option B: SVG background

// More control

// Slightly heavier

// Good if you want animated edges later

// Do NOT generate vouchers inside the component

// ❌ Do NOT call contracts from this component

// ❌ Do NOT store voucher state here

// VoucherDisplay.tsx (userId visible)
