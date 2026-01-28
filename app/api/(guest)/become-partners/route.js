import { errorResponse, successResponse } from "@/lib/api-response";
import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, ADMIN_EMAIL } from "@/lib/constants";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, number } = body;

        // Validate required fields
        if (!name || !email || !number) {
            return errorResponse("Name, email, and phone number are required", 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        // Check if email configuration is set
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !ADMIN_EMAIL) {
            return errorResponse("Email service is not configured. Please contact the administrator.", 500);
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });

        // Email content
        const mailOptions = {
            from: SMTP_USER,
            to: ADMIN_EMAIL,
            subject: "New Partner Application",
            html: `
                <h2>New Partner Application</h2>
                <p>A new partner application has been submitted:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone Number:</strong> ${number}</li>
                </ul>
                <p>Please review and respond to this application.</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return successResponse("Partner application submitted successfully. We will contact you soon.");
    } catch (error) {
        return errorResponse(error.message || "Failed to submit partner application");
    }
}

