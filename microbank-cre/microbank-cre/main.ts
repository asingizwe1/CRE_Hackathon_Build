// // // import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";

// // // type Config = {
// // //   schedule: string;
// // // };

// // // const onCronTrigger = (runtime: Runtime<Config>): string => {
// // //   runtime.log("Hello world! Workflow triggered.");
// // //   return "Hello world!";
// // // };

// // // const initWorkflow = (config: Config) => {
// // //   const cron = new CronCapability();

// // //   return [
// // //     handler(
// // //       cron.trigger(
// // //         { schedule: config.schedule }
// // //       ), 
// // //       onCronTrigger
// // //     ),
// // //   ];
// // // };

// // // export async function main() {
// // //   const runner = await Runner.newRunner<Config>();
// // //   await runner.run(initWorkflow);
// // // }
// // import fetch from "node-fetch";

// // /**
// //  * Simulated contract event type
// //  */
// // type ContractEvent = {
// //   __name__:
// //   | "UserRegistered"
// //   | "DepositRecorded"
// //   | "FeesConvertedToLiquid"
// //   | "LoanIssued"
// //   | "DemoActiveBorrowerUpdated"
// //   | "WithdrawalProcessed"
// //   | "UserLiquidated";
// //   userId: string;

// //   netAmount?: number;
// //   feeAmount?: number;
// //   usdtAmount?: number;
// //   liquidAmount?: number;
// //   amount?: number;
// //   totalDebt?: number;
// //   debtCleared?: number;
// // };

// // /**
// //  * Resolve phone from your Render backend
// //  */
// // async function resolvePhone(userId: string) {
// //   const response = await fetch(
// //     `${process.env.RESOLVER_BASE_URL}/resolve`,
// //     {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "x-api-key": process.env.RESOLVER_API_KEY || "",
// //       },
// //       body: JSON.stringify({ userId }),
// //     }
// //   );

// //   const data = await response.json();
// //   return data.phone;
// // }

// // /**
// //  * Send SMS via your Render backend proxy
// //  */
// // async function sendSms(to: string, message: string) {
// //   const response = await fetch(
// //     `${process.env.RESOLVER_BASE_URL}/sms`,
// //     {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ to, message }),
// //     }
// //   );

// //   return await response.json();
// // }

// // /**
// //  * Build message based on event type
// //  */
// // function buildMessage(event: ContractEvent): string {
// //   switch (event.__name__) {
// //     case "UserRegistered":
// //       return "✅ Registration successful. Welcome to CoreMicroBank.";

// //     case "DepositRecorded":
// //       return `💰 Deposit recorded. Net: ${event.netAmount} (fee: ${event.feeAmount}).`;

// //     case "FeesConvertedToLiquid":
// //       return `🤖 Automation: Fees auto-converted & staked. ${event.usdtAmount} → LIQ ${event.liquidAmount}.`;

// //     case "LoanIssued":
// //       return `📢 Loan issued: ${event.amount}. Total debt: ${event.totalDebt}.`;

// //     case "DemoActiveBorrowerUpdated":
// //       return "🕒 You are the active borrower. Interest will auto-accrue.";

// //     case "WithdrawalProcessed":
// //       return `✅ Withdrawal processed: ${event.amount}.`;

// //     case "UserLiquidated":
// //       return `⚠️ Liquidation executed. Debt cleared: ${event.debtCleared}.`;

// //     default:
// //       return "Event received.";
// //   }
// // }

// // /**
// //  * Main simulation entry
// // //  */
// // // export async function main() {
// // //   // 🔥 CHANGE THIS MOCK EVENT TO TEST DIFFERENT FLOWS
// // //   const mockEvent: ContractEvent = {
// // //     __name__: "DepositRecorded",
// // //     userId: "0xTEST_USER_ID",
// // //     netAmount: 95,
// // //     feeAmount: 5,
// // //   };

// // //   console.log("🔔 Event triggered:", mockEvent.__name__);

// // //   const phone = await resolvePhone(mockEvent.userId);

// // //   if (!phone) {
// // //     console.log("⚠️ No phone found for userId.");
// // //     return;
// // //   }

// // //   const message = buildMessage(mockEvent);

// // //   const smsResponse = await sendSms(phone, message);

// // //   console.log("📨 SMS Response:", smsResponse);
// // //   console.log("✅ Simulation finished.");
// // // }
// // export async function main() {
// //   const eventType =
// //     (process.env.EVENT_TYPE as ContractEvent["__name__"]) || "DepositRecorded";

// //   const event: ContractEvent = {
// //     __name__: eventType,
// //     userId: "0xtest_user_id", // keep this the same as the mapping saved in your backend
// //     netAmount: 95,
// //     feeAmount: 5,
// //     usdtAmount: 5,
// //     liquidAmount: 5,
// //     amount: 50,
// //     totalDebt: 50,
// //     debtCleared: 50,
// //   };

// //   console.log("🔔 Event triggered:", event.__name__);

// //   const phone = await resolvePhone(event.userId);

// //   if (!phone) {
// //     console.log("⚠️ No phone found for userId.");
// //     return "No phone found";
// //   }

// //   const message = buildMessage(event);

// //   const smsResponse = await sendSms(phone, message);

// //   console.log("📨 SMS Response:", smsResponse);
// //   console.log("✅ Simulation finished.");

// //   return smsResponse;
// // }


// import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";
// import fetch from "node-fetch";

// type Config = {
//   schedule: string;
// };

// type ContractEvent = {
//   __name__:
//   | "UserRegistered"
//   | "DepositRecorded"
//   | "FeesConvertedToLiquid"
//   | "LoanIssued"
//   | "DemoActiveBorrowerUpdated"
//   | "WithdrawalProcessed"
//   | "UserLiquidated";
//   userId: string;
//   netAmount?: number;
//   feeAmount?: number;
//   usdtAmount?: number;
//   liquidAmount?: number;
//   amount?: number;
//   totalDebt?: number;
//   debtCleared?: number;
// };

// async function resolvePhone(userId: string) {
//   const response = await fetch(`${process.env.RESOLVER_BASE_URL}/resolve`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": process.env.RESOLVER_API_KEY || "",
//     },
//     body: JSON.stringify({ userId }),
//   });

//   const data = await response.json();
//   return data.phone as string | null;
// }

// async function sendSms(to: string, message: string) {
//   const response = await fetch(`${process.env.RESOLVER_BASE_URL}/sms`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ to, message }),
//   });

//   return await response.json();
// }

// function buildMessage(event: ContractEvent): string {
//   switch (event.__name__) {
//     case "UserRegistered":
//       return "✅ Registration successful. Welcome to CoreMicroBank.";
//     case "DepositRecorded":
//       return `💰 Deposit recorded. Net: ${event.netAmount} (fee: ${event.feeAmount}).`;
//     case "FeesConvertedToLiquid":
//       return `🤖 Automation: Fees auto-converted & staked. ${event.usdtAmount} → LIQ ${event.liquidAmount}.`;
//     case "LoanIssued":
//       return `📢 Loan issued: ${event.amount}. Total debt: ${event.totalDebt}.`;
//     case "DemoActiveBorrowerUpdated":
//       return "🕒 You are the active borrower. Interest will auto-accrue.";
//     case "WithdrawalProcessed":
//       return `✅ Withdrawal processed: ${event.amount}.`;
//     case "UserLiquidated":
//       return `⚠️ Liquidation executed. Debt cleared: ${event.debtCleared}.`;
//     default:
//       return "Event received.";
//   }
// }

// const onCronTrigger = async (runtime: Runtime<Config>) => {
//   const eventType =
//     (process.env.EVENT_TYPE as ContractEvent["__name__"]) || "DepositRecorded";

//   const event: ContractEvent = {
//     __name__: eventType,
//     userId: "0xtest_user_id",
//     netAmount: 95,
//     feeAmount: 5,
//     usdtAmount: 5,
//     liquidAmount: 5,
//     amount: 50,
//     totalDebt: 50,
//     debtCleared: 50,
//   };

//   runtime.log(`Triggered simulation for event: ${event.__name__}`);

//   const phone = await resolvePhone(event.userId);

//   if (!phone) {
//     runtime.log("No phone found for this userId.");
//     return "No phone found";
//   }

//   const message = buildMessage(event);
//   const smsResponse = await sendSms(phone, message);

//   runtime.log(`SMS response: ${JSON.stringify(smsResponse)}`);
//   return smsResponse;
// };

// const initWorkflow = (config: Config) => {
//   const cron = new CronCapability();

//   return [
//     handler(
//       cron.trigger({ schedule: config.schedule }),
//       onCronTrigger
//     ),
//   ];
// };

// export async function main() {
//   const runner = await Runner.newRunner<Config>();
//   await runner.run(initWorkflow);
// }

import { CronCapability, handler, Runner, type Runtime } from "@chainlink/cre-sdk";
import fetch from "node-fetch";

type Config = {
  schedule?: string;
};

type ContractEvent = {
  __name__:
  | "UserRegistered"
  | "DepositRecorded"
  | "FeesConvertedToLiquid"
  | "LoanIssued"
  | "DemoActiveBorrowerUpdated"
  | "WithdrawalProcessed"
  | "UserLiquidated";
  userId: string;
  netAmount?: number;
  feeAmount?: number;
  usdtAmount?: number;
  liquidAmount?: number;
  amount?: number;
  totalDebt?: number;
  debtCleared?: number;
};

async function resolvePhone(userId: string) {
  const response = await fetch(`${process.env.RESOLVER_BASE_URL}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.RESOLVER_API_KEY || "",
    },
    body: JSON.stringify({ userId }),
  });

  const data = await response.json();
  return data.phone as string | null;
}

async function sendSms(to: string, message: string) {
  const response = await fetch(`${process.env.RESOLVER_BASE_URL}/sms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, message }),
  });

  return await response.json();
}

function buildMessage(event: ContractEvent): string {
  switch (event.__name__) {
    case "UserRegistered":
      return "✅ Registration successful. Welcome to CoreMicroBank.";
    case "DepositRecorded":
      return `💰 Deposit recorded. Net: ${event.netAmount} (fee: ${event.feeAmount}).`;
    case "FeesConvertedToLiquid":
      return `🤖 Automation: Fees auto-converted & staked. ${event.usdtAmount} → LIQ ${event.liquidAmount}.`;
    case "LoanIssued":
      return `📢 Loan issued: ${event.amount}. Total debt: ${event.totalDebt}.`;
    case "DemoActiveBorrowerUpdated":
      return "🕒 You are the active borrower. Interest will auto-accrue.";
    case "WithdrawalProcessed":
      return `✅ Withdrawal processed: ${event.amount}.`;
    case "UserLiquidated":
      return `⚠️ Liquidation executed. Debt cleared: ${event.debtCleared}.`;
    default:
      return "Event received.";
  }
}

const onCronTrigger = async (runtime: Runtime<Config>) => {
  const eventType =
    (process.env.EVENT_TYPE as ContractEvent["__name__"]) || "DepositRecorded";

  const event: ContractEvent = {
    __name__: eventType,
    userId: "0xtest_user_id",
    netAmount: 95,
    feeAmount: 5,
    usdtAmount: 5,
    liquidAmount: 5,
    amount: 50,
    totalDebt: 50,
    debtCleared: 50,
  };

  runtime.log(`Triggered simulation for event: ${event.__name__}`);

  const phone = await resolvePhone(event.userId);

  if (!phone) {
    runtime.log("No phone found for this userId.");
    return "No phone found";
  }

  const message = buildMessage(event);
  const smsResponse = await sendSms(phone, message);

  runtime.log(`SMS response: ${JSON.stringify(smsResponse)}`);
  return smsResponse;
};

const initWorkflow = (_config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger({ schedule: "* * * * *" }),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
/**
 * Before simulating, save the mapping
curl -X POST https://cre-hackathon-build.onrender.com/user `
  -H "Content-Type: application/json" `
  -H "x-api-key: dev-resolver-key" `
  -d "{\"userId\":\"0xtest_user_id\",\"phone\":\"+2567YOURNUMBER\"}"
 * 
 * 
 * Deposit test
$env:EVENT_TYPE="DepositRecorded"
cre workflow simulate microbank-cre
Register test
$env:EVENT_TYPE="UserRegistered"
cre workflow simulate microbank-cre
Automation test
$env:EVENT_TYPE="FeesConvertedToLiquid"
cre workflow simulate microbank-cre
Loan test
$env:EVENT_TYPE="LoanIssued"
cre workflow simulate microbank-cre
Withdraw test
$env:EVENT_TYPE="WithdrawalProcessed"
cre workflow simulate microbank-cre
 */