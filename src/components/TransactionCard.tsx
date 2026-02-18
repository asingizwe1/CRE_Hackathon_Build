// import { useState } from "react";
// //import { useCoreMicroBankEvents } from "../hooks/useCoreMicroBankEvents";
// // F:\soon_pay_frontend\vite-ethersjs-template\src\hooks\useCoreMicroBankEvents.ts
// //Event listeners must be mounted ONCE
// //only in App.tsx

// type Props = {
//     events: any[];
// };
// export default function TransactionsSection({ events }: Props) {
//     // const [events, setEvents] = useState<any[]>([]);

//     // useCoreMicroBankEvents((event) => {
//     //     setEvents((prev) => [event, ...prev]);
//     // });

//     return (
//         <section
//             id="transactions"
//             style={{ padding: "100px 20px", minHeight: "100vh" }}
//         >
//             <h2>📜 Live Protocol Activity</h2>

//             {events.length === 0 && <p>No activity yet</p>}

//             {events.map((event, i) => (
//                 <pre
//                     key={i}
//                     style={{
//                         background: "#0f172a",
//                         color: "#e5e7eb",
//                         padding: "12px",
//                         borderRadius: "8px",
//                         marginBottom: "10px",
//                         overflowX: "auto"
//                     }}
//                 >
//                     {JSON.stringify(event, null, 2)}
//                 </pre>
//             ))}
//         </section>
//     );
// }
type Props = {
    event: any;
};

const labelStyle = {
    fontSize: 12,
    color: "#9ca3af",
};

const valueStyle = {
    fontSize: 14,
    fontWeight: 500,
};

const cardStyle = {
    background: "#020617",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    maxWidth: 780,
    color: "#e5e7eb",
};

const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
};
const decodeBN = (bn: any) => {
  if (bn === undefined || bn === null) return "—";

  try {
    // ethers v6 BigInt
    if (typeof bn === "bigint") return bn.toString();

    // ethers v5 BigNumber
    if (bn._isBigNumber) return bn.toString();

    // hex fallback
    if (bn.hex) return parseInt(bn.hex, 16).toString();

    return String(bn);
  } catch {
    return "—";
  }
};


const TransactionCard = ({ event }: Props) => {
    return (
        <div style={cardStyle}>
          {/* Header */}
<div style={{ marginBottom: 10 }}>
  <span
    style={{
      background: "#1d4ed8",
      color: "white",
      fontSize: 12,
      padding: "4px 10px",
      borderRadius: 999,
      fontWeight: 600,
    }}
  >
    {event.type}
  </span>
</div>
            {/* Common fields */}
            {event.userId && (
                <div style={rowStyle}>
                    <span style={labelStyle}>User</span>
                    <span style={valueStyle}>{event.userId}</span>
                </div>
            )}

            {event.agent && (
                <div style={rowStyle}>
                    <span style={labelStyle}>Agent</span>
                    <span style={valueStyle}>{event.agent}</span>
                </div>
            )}

            {event.to && (
                <div style={rowStyle}>
                    <span style={labelStyle}>To</span>
                    <span style={valueStyle}>{event.to}</span>
                </div>
            )}

            {/* Amount fields */}
            {event.amount !== undefined && (
                <div style={rowStyle}>
                    <span style={labelStyle}>Amount</span>
                    <span style={valueStyle}>
                        {decodeBN(event.amount)}
                    </span>
                </div>
            )}

           {event.gross !== undefined && (
  <div style={rowStyle}>
    <span style={labelStyle}>Gross</span>
    <span style={valueStyle}>
      {decodeBN(event.gross)}
    </span>
  </div>
)}

{event.fee !== undefined && (
  <div style={rowStyle}>
    <span style={labelStyle}>Fee</span>
    <span style={valueStyle}>
      {decodeBN(event.fee)}
    </span>
  </div>
)}

{event.net !== undefined && (
  <div style={rowStyle}>
    <span style={labelStyle}>Net</span>
    <span style={valueStyle}>
      {decodeBN(event.net)}
    </span>
  </div>
)}

        </div>
    );
};

export default TransactionCard;
