import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from "@/lib/constants";

/** Returns a nodemailer transporter or null if SMTP is not configured. */
export function createEmailTransporter() {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
        return null;
    }
    const port = SMTP_PORT;
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASSWORD,
        },
    });
}
