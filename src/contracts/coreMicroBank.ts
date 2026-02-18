import { ethers } from "ethers";
import CoreMicroBankABI from "../abi/CoreMicroBank.json";

export const CORE_MICROBANK_ADDRESS =
  import.meta.env.VITE_CORE_MICROBANK_ADDRESS;

export function getCoreMicroBankContract(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
  return new ethers.Contract(
    CORE_MICROBANK_ADDRESS,
    CoreMicroBankABI,
    signerOrProvider
  );
}
