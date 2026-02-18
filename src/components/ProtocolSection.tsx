import { useState } from "react";
import { ethers } from "ethers";
import { useCoreMicroBank } from "../hooks/useCoreMicroBank";

type ProtocolSectionProps = {
    stats: any;
    refreshProtocol: () => Promise<void>;
};



const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
    marginTop: 20,
    width: "80%",
};

const statCard = {
    background: "#f9fafb",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
};

const statLabel = {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
};

const statValue = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
};
const ProtocolSection = ({ stats, refreshProtocol }: ProtocolSectionProps) => {
    // const [searchPhone, setSearchPhone] = useState("");
    // const [userState, setUserState] = useState<any>(null);

    // const { getUserState } = useCoreMicroBank();

    // const handleSearch = async () => {
    //     const state = await getUserState(searchPhone);
    //     setUserState(state);
    // };

    const { convertFeesAndStake } = useCoreMicroBank();
    if (!stats) return <p>Loading protocol data...</p>;

    const feePool = Number(stats.feePool).toLocaleString();

    const totalStakedLIQ = ethers.utils.formatUnits(stats.totalStaked, 18);
    const protocolLIQ = ethers.utils.formatUnits(stats.liquidBalance, 18);
    return (
        <section
            id="protocol"
            style={{
                padding: "100px 20px",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <h2> Protocol Dashboard</h2>
            <p style={{ color: "#6b7280", marginBottom: 30 }}>
                Live system treasury & staking controls
            </p>

            {!stats ? (
                <p>Loading protocol data...</p>
            ) : (
                <div style={{ width: "100%", maxWidth: 800 }}>
                    {/* Stat Cards */}
                    <div style={cardGrid}>
                        <div style={statCard}>
                            <div style={statLabel}>Protocol Fee Pool</div>
                            <div style={statValue}>
                                {Number(feePool).toLocaleString()}
                            </div>
                        </div>

                        <div style={statCard}>
                            <div style={statLabel}>Total Liquid Staked</div>
                            <div style={statValue}>
                                {Number(totalStakedLIQ).toLocaleString()} LIQ
                            </div>
                        </div>

                        <div style={statCard}>
                            <div style={statLabel}>Protocol LIQ Balance</div>
                            <div style={statValue}>
                                {Number(protocolLIQ).toLocaleString()} LIQ
                            </div>
                        </div>

                    </div>

                    {/* Admin Action */}
                    <div
                        style={{
                            marginTop: 40,
                            padding: 24,
                            borderRadius: 16,
                            background: "#111827",
                            color: "white",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        }}
                    >
                        <h3 style={{ marginBottom: 10 }}>Admin Controls</h3>
                        <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
                            Convert accumulated fees into LIQ and stake into protocol yield pool.
                        </p>

                        <button
                            style={{
                                padding: "12px 20px",
                                borderRadius: 10,
                                border: "none",
                                background: "#2563eb",   // 🔥 Professional blue instead of green
                                color: "white",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                            onClick={async () => {
                                try {
                                    await convertFeesAndStake();
                                    await refreshProtocol();
                                    alert("Fees converted to LIQ ✅");
                                } catch (e) {
                                    alert("Conversion failed ❌");
                                    console.error(e);
                                }
                            }}
                        >
                            Convert Fees → Stake LIQ
                        </button>
                    </div>
                </div>

            )}
            {/* <input
                placeholder="Enter phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
            />

            <button onClick={handleSearch}>Search User</button>

            {userState && (
                <div>
                    <p>Deposit: {userState.depositBalance}</p>
                    <p>Loan Debt: {userState.loanDebt}</p>
                </div>
            )} */}

        </section>
    );
};

export default ProtocolSection;

// // protocolLiquidBalance()

// // protocolFeePool

// // totalLiquidStaked
// import { useEffect, useState } from "react";
// import { useCoreMicroBank } from "../hooks/useCoreMicroBank";

// const ProtocolSection = ({ stats }: { stats: any }) => {

//     // const {
//     //     getProtocolStats,
//     //     getUGXtoUSD
//     // } = useCoreMicroBank();

//     const [stats, setStats] = useState<any>(null);
//     const [price, setPrice] = useState<number | null>(null);

//     // useEffect(() => {
//     //     async function load() {
//     //         const s = await getProtocolStats();
//     //         const p = await getUGXtoUSD();

//     //         setStats(s);
//     //         setPrice(p);
//     //     }
//     //     load();
//     // }, []);

//     return (
//         <section id="protocol" style={{ padding: "100px 20px" }}>
//             <h2>🏛 Protocol</h2>

//             {!stats ? (
//                 <p>Loading protocol data...</p>
//             ) : (
//                 <ul>
//                     <li>Protocol Fee Pool: {stats.feePool}</li>
//                     <li>Total Liquid Staked: {stats.totalStaked}</li>
//                     <li>Protocol LIQ Balance: {stats.liquidBalance}</li>
//                     <li>UGX / USD Price: {price}</li>
//                 </ul>
//             )}
//         </section>
//     );
// };

// export default ProtocolSection;
