// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const fs = require("fs"); // File system module to save messages
const cors = require("cors"); // Middleware to handle CORS policy
const nodemailer = require("nodemailer"); // Email sending module
const useragent = require("useragent"); // Module to extract device details
const axios = require("axios"); // HTTP client for API requests

const app = express();

// Trust proxy to get real IP address when behind a proxy (e.g., when hosted online)
app.set("trust proxy", true);

app.use(cors()); // Enable CORS to allow frontend to communicate with backend
app.use(express.json()); // Parse JSON data in incoming requests

const filePath = "messages.json"; // File to store messages

// 📧 Configure Nodemailer with Gmail credentials stored in .env
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your App password (not your Gmail password)
    }
});

// 📩 API Route: Handle form submissions from frontend
app.post("/submit-form", async (req, res) => {
    try {
        // Destructure data sent from the frontend
        const { name, email, message, latitude, longitude, mobile } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, email, and message are required" });
        }

        // ✅ Get user's IP address
        const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        // ✅ Get user's device & OS details using user-agent
        const agent = useragent.parse(req.headers["user-agent"]);
        const deviceInfo = agent.os ? `${agent.toString()} (${agent.os.toString()})` : agent.toString();

        // 🌍 Fetch user location and ISP details using ip-api.com
        async function getUserLocation(ip) {
            try {
                const response = await axios.get(`http://ip-api.com/json/${ip}`);
                return response.data;  // Contains country, city, ISP, mobile/wifi, etc.
            } catch (error) {
                console.error("Error fetching IP info:", error.message);
                return null;
            }
        }

        // Call the function to get location data
        const locationData = await getUserLocation(ip);

        if (!locationData) {
            return res.status(500).json({ error: "network error please try again." });
        }

        // Extract all necessary location details
        const { city, region, country, isp, lat, lon, timezone, mobile: isMobile } = locationData;
        const connectionType = isMobile ? "Mobile" : "Wi-Fi";

        // Use precise coordinates if provided by the frontend
        const finalLat = latitude || lat;
        const finalLon = longitude || lon;

        // 💌 Email to Admin (You)
        const adminMailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: "davetechinnovation@gmail.com", // Recipient email
            subject: "New Contact Form Message",
            text: `You just received a new message:
            ------------------------------------
            👤 Name: ${name}
            📧 Email: ${email}
            📞 Mobile: ${mobile || "Not provided"}
            ✉️ Message: ${message}

            🌐 IP Address: ${ip}
            📱 Device: ${deviceInfo}
            🏙 Location: ${city}, ${region}, ${country}
            📡 ISP: ${isp}
            🌍 Coordinates: Latitude ${finalLat}, Longitude ${finalLon}
            ⏰ Timezone: ${timezone}
            📶 Connection Type: ${connectionType}
            📅 Date: ${new Date().toISOString()}
            ------------------------------------`
        };

        // 💌 Email to the Sender (User)
        const userMailOptions = {
            from: process.env.EMAIL_USER, // Your email address
            to: email, // Sender's email
            subject: "Your Message Has Been Received",
            text: `Hello ${name},

            Thank you for reaching out to us. We have received your message and will respond to you within 24 to 48 working hours.

            Here is a copy of your message:
            ------------------------------------
            ✉️ Message: ${message}
            ------------------------------------

            If you have any urgent concerns, feel free to contact us directly at ${process.env.EMAIL_USER}.

            Best regards,  
            Dave Tech Innovation Team`
        };

        // Send both emails asynchronously
        await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        // Save message to JSON file
        const messages = await readMessagesFromFile(filePath);
        const newMessage = { 
            name, 
            email, 
            mobile: mobile || "Not provided", // Save mobile number if available
            message, 
            ip, 
            device: deviceInfo, 
            location: `${city}, ${region}, ${country}`,
            isp, 
            coordinates: { lat: finalLat, lon: finalLon }, 
            timezone, 
            connection: connectionType, 
            date: new Date().toISOString() 
        };
        messages.push(newMessage);
        await writeMessagesToFile(filePath, messages);

        console.log("✅ Emails sent successfully!");
        return res.json({ success: "Message sent successfully! We have also sent you a confirmation email." });

    } catch (error) {
        console.error("❌ Error:", error.message);
        return res.status(500).json({error: "An error occurred while sending the message. Please check your internet connection and try again." });
    }
});

// Helper function to read messages from file
async function readMessagesFromFile(filePath) {
    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            return []; // Return empty array if file doesn't exist
        } else {
            throw error;
        }
    }
}

// Helper function to write messages to file
async function writeMessagesToFile(filePath, messages) {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error("❌ Failed to save message:", error);
    }
}

// Start the backend server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});