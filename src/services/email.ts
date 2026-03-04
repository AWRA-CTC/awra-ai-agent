import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
};

export const sendWarningEmail = async (
  email: string,
  loanId: string,
  healthFactor: number,
): Promise<void> => {
  if (!RESEND_FROM_EMAIL) {
    throw new Error("Missing RESEND_FROM_EMAIL environment variable.");
  }

  const resend = getResendClient();
  const formattedHealthFactor = healthFactor.toFixed(4);

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: email,
    subject: "\u26A0\uFE0F AWRA Loan Health Warning",
    text: [
      "Your AWRA loan health factor is in a risky range.",
      "",
      `Loan ID: ${loanId}`,
      `Current health factor: ${formattedHealthFactor}`,
      "",
      "If the health factor drops below 1, your loan can be liquidated.",
      "Please consider adding collateral to improve your loan safety.",
    ].join("\n"),
    html: [
      "<p>Your AWRA loan health factor is in a risky range.</p>",
      `<p><strong>Loan ID:</strong> ${loanId}<br/>`,
      `<strong>Current health factor:</strong> ${formattedHealthFactor}</p>`,
      "<p>If the health factor drops below 1, your loan can be liquidated.</p>",
      "<p>Please consider adding collateral to improve your loan safety.</p>",
    ].join(""),
  });

  console.log("email sent from resend");
};
