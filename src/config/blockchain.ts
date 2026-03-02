import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

export const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS!,
  [
    "function getLoan(uint256 loanId) view returns (uint256 debt, uint256 healthFactor)",
  ],
  provider,
);
