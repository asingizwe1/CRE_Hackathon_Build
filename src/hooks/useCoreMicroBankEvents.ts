import { useEffect, useRef } from "react";
import { ethers } from "ethers";
import CoreMicroBankABI from "../abi/CoreMicroBank.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CORE_MICROBANK_ADDRESS;

export function useCoreMicroBankEvents(
    onEvent: (event: any) => void
) {
    const initialized = useRef(false);


    useEffect(() => {
        if (!window.ethereum) return;
        if (initialized.current) return; // 🛑 PREVENT DUPLICATES

        initialized.current = true;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CoreMicroBankABI,
            provider
        );

        contract.on("UserRegistered", (userId, agent, timestamp, event) => {
            onEvent({
                id: event.transactionHash + "-" + event.logIndex, // ✅ ADD THIS
                type: "UserRegistered",
                userId,
                agent,
                timestamp
            });
        });

        contract.on("DepositRecorded", (userId, agent, gross, fee, net, event) => {
            onEvent({
                id: event.transactionHash + "-" + event.logIndex,
                type: "DepositRecorded",
                userId,
                agent,
                gross,
                fee,
                net
            });
        });

        contract.on("LoanIssued", (userId, amount, debt, event) => {
            onEvent({
                id: event.transactionHash + "-" + event.logIndex,
                type: "LoanIssued",
                userId,
                amount,
                debt
            });
        });

        contract.on("InterestAccrued", (userId, interest, debt, event) => {
            onEvent({
                id: event.transactionHash + "-" + event.logIndex,
                type: "InterestAccrued",
                userId,
                interest,
                debt
            });
        });

        contract.on("WithdrawalProcessed", (userId, to, amount, event) => {
            onEvent({
                id: event.transactionHash + "-" + event.logIndex,
                type: "WithdrawalProcessed",
                userId,
                to,
                amount
            });
        });


        return () => {
            contract.removeAllListeners();
            initialized.current = false;
        };
    }, [onEvent]);
}

//dont attach listeners inside action hooks
// Something like this does not work reliably:

// await registerUser(phone);
// // expecting event magically here ❌


// Because:

// Event fires asynchronously

// React already finished the function

// Listener may not exist yet