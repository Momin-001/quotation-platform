import { errorResponse, successResponse } from "@/lib/api-response";
import { createEmailTransporter } from "@/lib/email-transporter";
import { SMTP_USER, ADMIN_EMAIL } from "@/lib/constants";

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(req) {
    try {
        const body = await req.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const subject = typeof body.subject === "string" ? body.subject.trim() : "";
        const message = typeof body.message === "string" ? body.message.trim() : "";

        if (!name || !email || !subject || !message) {
            return errorResponse("Name, email, subject, and message are required", 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        if (subject.length > 200) {
            return errorResponse("Subject is too long", 400);
        }

        if (message.length > 10000) {
            return errorResponse("Message is too long", 400);
        }

        const transporter = createEmailTransporter();
        if (!transporter || !SMTP_USER || !ADMIN_EMAIL) {
            return errorResponse("Email service is not configured. Please contact the administrator.", 500);
        }

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message).replace(/\r\n|\r|\n/g, "<br/>");

        await transporter.sendMail({
            from: SMTP_USER,
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `[Contact] ${subject.slice(0, 80)}${subject.length > 80 ? "…" : ""}`,
            html: `
                <h2>Contact form submission</h2>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Subject:</strong> ${safeSubject}</p>
                <p><strong>Message:</strong></p>
                <p>${safeMessage}</p>
            `,
        });

        return successResponse("Thank you. Your message has been sent.");
    } catch (error) {
        return errorResponse(error.message || "Failed to send message");
    }
}
