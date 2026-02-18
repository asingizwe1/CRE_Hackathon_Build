import { ethers } from "ethers";

export function phoneToUserId(phone: string): string {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(phone.trim())
  );
}

















//import { keccak256, toUtf8Bytes } from "ethers";
//you’re running into a breaking change between ethers v5 and v6. In ethers v6, the way utility functions are exported has changed. Let me break it down clearly: