// 100% events-based
// <li>LoanIssued</li>
//             <li>InterestAccrued</li>
//             <li>WithdrawalProcessed</li>
import { useState } from "react";
import { useCoreMicroBankEvents } from "../hooks/useCoreMicroBankEvents";
import TransactionCard from "./TransactionCard";
type Props = {
    events: any[];
};
const eventCard = {
    background: "#0b1220",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    color: "#e5e7eb",
};
const TransactionsSection = ({ events }: Props) => {
    return (
        <section
            id="transactions"
            style={{ padding: "100px 20px", minHeight: "100vh" }}
        >
            <h2> Transactions</h2>
            <p>Live protocol activity powered by events</p>

            {events.length === 0 && <p>No activity yet</p>}


            {events.map((e, i) => (
                <TransactionCard key={i} event={e} />
            ))}

        </section>
    );
};

export default TransactionsSection;