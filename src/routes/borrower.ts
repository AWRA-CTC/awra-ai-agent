import { Router } from "express";
import { Borrower } from "../models/Borrower";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { walletAddress, email, loanId } = req.body;

    if (!walletAddress || !email || !loanId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const borrower = await Borrower.create({
      walletAddress,
      email,
      loanId,
    });

    res.status(201).json(borrower);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
