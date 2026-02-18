// UserSection.tsx (polished layout + search styling + userId on voucher)
import { useState } from "react";
import { ethers } from "ethers";
import { getCoreMicroBankContract } from "../contracts/coreMicroBank";
import { phoneToUserId } from "../utils/userId";
import VoucherDisplay from "./VoucherDisplay";
import type { Voucher } from "@/types/voucher";
import { notifySMS } from "@/utils/smsClient";
import { useCoreMicroBank } from "@/hooks/useCoreMicroBank";

const pageWrap = {

  maxWidth: 920,              // wider so cards breathe
  marginLeft: 0,            // pull section left
  marginRight: "auto",
  padding: "60px 20px 20px",  // reduce bottom padding
};


const grid = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 420px) minmax(320px, 420px)",
  gap: 20,            // more breathing room between cards
};

const card = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,   // slightly more vertical balance
  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
};

const input = {
  width: "90%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  outline: "none",
};

const button = {
  marginTop: 14,
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const muted = { color: "#6b7280", fontSize: 13 };

const UserSection = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [userState, setUserState] = useState<any>(null);
  const { getUserState } = useCoreMicroBank();

  const handleSearch = async () => {
    const state = await getUserState(searchPhone);
    setUserState(state);
  };

  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  const registerUser = async () => {
    try {
      if (!window.ethereum) return alert("MetaMask not found");

      setStatus("Waiting for wallet...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getCoreMicroBankContract(signer);

      const userId = phoneToUserId(phone);
      setStatus("Registering user on-chain...");

      const tx = await contract.registerUser(userId);
      await tx.wait();

      setVoucher({
        phone,
        amount: 0,
        code: userId, // full userId now
        issuedAt: Date.now(),
        txHash: tx.hash,
      });

      await notifySMS(phone,
        `Osuubiddwa ssente mu Liquid.\n` +
        `Omukozesa awandiikiddwa bulungi.\n` +
        `Webale nnyo / Thank you`
      );

      setStatus("✅ User registered successfully");
    } catch (err: any) {
      const message = err?.error?.message || err?.data?.message || err?.reason || err?.message;
      if (message?.includes("User exists")) setStatus("⚠️ User already exists");
      else setStatus("❌ Registration failed");
    }
  };

  return (
    <section id="user" style={pageWrap}>
      <h2 style={{ marginBottom: 32 }}>User Registration</h2>

      <div style={grid}>
        {/* Registration */}
        <div style={card}>
          <h3>Register New User</h3>
          <input
            type="text"
            placeholder="User phone number (e.g. +2567xxxxxxx)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={input}
          />

          <button onClick={registerUser} style={button}>
            Register User
          </button>

          {status && <p style={{ marginTop: 12, fontSize: 14 }}>{status}</p>}
          <p style={{ marginTop: 8, ...muted }}>
            Phone is hashed into a cryptographic userId on-chain.
          </p>
        </div>

        {/* Search */}
        <div style={card}>
          <h3>Search User</h3>
          <input
            placeholder="Enter phone number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            style={input}
          />

          <button onClick={handleSearch} style={{ ...button, background: "#111827" }}>
            Search User
          </button>

          {userState && (
            <div style={{ marginTop: 14 }}>
              <p><strong>Deposit:</strong> {userState.depositBalance}</p>
              <p><strong>Loan Debt:</strong> {userState.loanDebt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Voucher */}
      <div
        style={{
          marginTop: 16,
          maxWidth: 860,
          overflow: "hidden",
        }}
      >
        <VoucherDisplay voucher={voucher} />
      </div>
    </section>
  );
};

export default UserSection;
