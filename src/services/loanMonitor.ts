import cron from "node-cron";
import { Borrower } from "../models/Borrower";
import { contract } from "../config/blockchain";

export const startLoanMonitor = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Checking loans...");

    const borrowers = await Borrower.find();

    for (const borrower of borrowers) {
      const loan = await contract.getLoan(borrower.loanId);

      const healthFactor = Number(loan.healthFactor);

      if (healthFactor < 1.2) {
        console.log(
          `Warning: Loan ${borrower.loanId} is risky for ${borrower.email}`,
        );
        // Later → send email
      }
    }
  });
};
