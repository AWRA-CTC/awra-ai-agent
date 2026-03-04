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

  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "⚠️ AWRA Loan Health Warning",

      // plain‑text fallback
      text: [
        "AWRA Loan Health Warning",
        "",
        "Your AWRA loan health factor is in a risky range.",
        "",
        `Loan ID: ${loanId}`,
        `Current health factor: ${formattedHealthFactor}`,
        "",
        "If the health factor drops below 1, your loan can be liquidated.",
        "Please consider adding collateral to improve your loan safety.",
        "",
        "Visit our website: https://awra-ctc.vercel.app/ for more information.",
      ].join("\n"),

      // HTML version – centred, white background, big AWRA logo colour
      html: `
        <div style="background-color:#ffffff;
                    padding:20px;
                    text-align:center;
                    font-family:Arial, sans-serif;
                    color:#333;">
          <h1 style="color:#e31c32;
                     font-size:32px;
                     margin:0;
                     line-height:1;">
            AWRA
          </h1>
          <p style="font-size:16px;margin:0 0 20px 0;">
            Loan Health Warning
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="font-size:14px;line-height:1.5;">
            Your AWRA loan health factor is in a risky range.
          </p>
          <p style="font-size:14px;line-height:1.5;">
            <strong>Loan ID:</strong> ${loanId}<br/>
            <strong>Current health factor:</strong> ${formattedHealthFactor}
          </p>
          <p style="font-size:14px;line-height:1.5;">
            If the health factor drops below 1, your loan can be liquidated.
          </p>
          <p style="font-size:14px;line-height:1.5;">
            Please consider adding collateral to improve your loan safety.
          </p>
          <p style="font-size:14px;margin-top:30px;">
            Visit our&nbsp;
            <a href="https://awra-ctc.vercel.app/"
               style="color:#e31c32;text-decoration:none;">
              website
            </a>
            for more information.
          </p>
        </div>
      `,
    });

    console.log("email sent from resend");
  } catch (err) {
    console.error("failed to send email via Resend:", err);
    // re‑throw if the caller needs to react to the failure
    throw err;
  }
};
