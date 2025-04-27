export function startSpinner() {
    document.getElementById('spinnerOverlay').classList.remove("d-none");
}

export function stopSpinner() {
    document.getElementById('spinnerOverlay').classList.add("d-none");
}
//use spinner when using await calls cause we are assuming they take a while

// Function to send reminder emails using SendGrid API
export async function sendReminderEmail(toEmail, subject, text, html) {
    const SENDGRID_API_KEY = "YOUR_SENDGRID_API_KEY"; // 🔥 Insert your real SendGrid API key here carefully
    const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";

    const emailData = {
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: "pshell@uco.edu" }, // your verified single sender email
        subject: subject,
        content: [
            { type: "text/plain", value: text },
            { type: "text/html", value: html }
        ],
    };

    try {
        const response = await fetch(SENDGRID_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${SENDGRID_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        if (response.ok) {
            console.log("Email sent successfully!");
        } else {
            console.error("SendGrid error:", await response.text());
        }
    } catch (error) {
        console.error("Error sending reminder:", error);
    }
}
