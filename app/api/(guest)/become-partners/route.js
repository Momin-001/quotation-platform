import { errorResponse, successResponse } from "@/lib/api-response";
import { SMTP_USER, ADMIN_EMAIL } from "@/lib/constants";
import { createEmailTransporter } from "@/lib/email-transporter";
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, companyName, position, website, email, number, expertise, accepted } = body;

        // Validate required fields
        if (!name || !companyName || !position || !website || !email || !number || !Array.isArray(expertise) || expertise.length === 0 || !accepted) {
            return errorResponse("All fields are required", 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        // Create transporter
        const transporter = createEmailTransporter();
        if (!transporter || !SMTP_USER) {
            return errorResponse("Email service is not configured. Please contact the administrator.", 500);
        }
        // Email content
        await transporter.sendMail({
            from: SMTP_USER,
            to: ADMIN_EMAIL,
            subject: "New Partner Application",
            html: `
                <h2>New Partner Application</h2>
                <p>A new partner application has been submitted:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Company / Organization:</strong> ${companyName}</li>
                    <li><strong>Position:</strong> ${position}</li>
                    <li><strong>Website:</strong> ${website}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone Number:</strong> ${number}</li>
                    <li><strong>Expertise:</strong> ${(expertise || []).join(", ")}</li>
                </ul>
                <p>Please review and respond to this application.</p>
            `,
        });

        return successResponse("Partner application submitted successfully. We will contact you soon.");
    } catch (error) {
        return errorResponse(error.message || "Failed to submit partner application");
    }
}

