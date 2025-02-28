import { useState } from "react";
import "../styles/contactform.css";

function ContactForm() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("https://contact-dandave.onrender.com/submit-form",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("✅ Message sent successfully! Expect a reply within 24 - 48 working hours! and do well to check ur mail or mail spam for email comfirmation message thank you 😊");
                setFormData({ name: "", email: "", message: "" });

                // Reload the page after 12seconds
                setTimeout(() => {
                    setSuccessMessage("");
                    window.location.reload(); // Reload the page
                }, 12000);

               
            }else {
                    setSuccessMessage(data.error || "❌ Failed to send message. Please check your connection and try again.");
                
                    // Hide error message after 12 seconds
                    setTimeout(() => {
                        setSuccessMessage("");
                    }, 12000); // 12 seconds
                }
                  
                } catch (error) {
                    console.error("Error:", error);
                    setSuccessMessage("❌ Failed to connect to the server. Please check your connection and try again.");
                
                    // Hide error message after 12 seconds
                    setTimeout(() => {
                        setSuccessMessage("");
                    }, 12000); // 12 seconds
                }

        setLoading(false); // Hide loader
    };

    return (
        <div className="contact">
            <h2>Contact us</h2>
            <p>Note: Any email provided below will be used to reply to your message. Ensure you provide a valid and functional email.</p>
            
            <form onSubmit={handleSubmit} className="contact-form">
                <input type="text"  name="name"  placeholder="Your Name e.g Dandave"  value={formData.name} onChange={handleChange}  required />
                <input  type="email"  name="email"  placeholder="Your Email e.g dandave@gmail.com"  value={formData.email}  onChange={handleChange}  required />
                <textarea  name="message"  placeholder="Your Message eg hello i have a complaint"  value={formData.message}  onChange={handleChange}  required></textarea>
                
                <button type="submit" disabled={loading}> {loading ? "Sending..." : "Send Message"}</button>
            </form>

            {/* Success message */}
            {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
        </div>
    );
}

export default ContactForm;
