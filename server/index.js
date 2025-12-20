import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://candycruffs.ca',
    'https://www.candycruffs.ca',
    'https://monumental-salamander-4a33bc.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

// Email Transporter Setup
// In production, use environment variables. For dev, we'll log if missing.
// Email Transporter Setup
// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Candy Cruffs API is running!');
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email Sending Helper
const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email credentials missing. Skipped sending:', subject);
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"Candy Cruffs" <${process.env.EMAIL_USER}>`,
            to,
            bcc: process.env.EMAIL_USER, // Admin receives a copy of EVERYTHING
            subject,
            html: htmlContent
        });
        console.log(`✅ Email sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('❌ Email Failed:', error);
        return false;
    }
};

// --- ENDPOINTS ---

// 1. Order Placed (Payment Instruction)
app.post('/api/emails/placed', async (req, res) => {
    const { email, name, orderCode, total, items } = req.body;
    const firstName = name.split(' ')[0]; // Extract first name

    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec407a;">Order Received! 🍬</h1>
            <p>Hi ${firstName},</p>
            <p>Thanks for your order. To complete your purchase, please send an e-Transfer within <strong>1 hour</strong>.</p>
            
            <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; border: 2px solid #fbcfe8; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #be185d;">AMOUNT DUE: $${total}</p>
                <p style="margin: 10px 0;">Send to: <strong>candycruffs@gmail.com</strong></p>
                <p style="margin: 0;">Message/Memo: <strong style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #ddd;">${orderCode}</strong></p>
                <p style="font-size: 12px; margin-top: 10px; color: #be185d;">*IMPORTANT: You MUST include the Code in the message field so we can match your payment.</p>
            </div>

            <h3>Order Summary</h3>
            <ul>
                ${items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('')}
            </ul>
        </div>
    `;

    await sendEmail(email, `Payment Required for Order #${orderCode}`, html);
    res.json({ success: true });
});

// 2. Order Paid (Confirmation)
app.post('/api/emails/paid', async (req, res) => {
    const { email, name, orderCode, deliveryType } = req.body; // Expect deliveryType: 'pickup' or 'delivery'
    const firstName = name.split(' ')[0];

    const pickupAddress = "5509 35 Ave NW, Edmonton, AB T6L 2C7";
    const googleMapsLink = "https://www.google.com/maps/search/?api=1&query=5509+35+Ave+NW,+Edmonton,+AB+T6L+2C7";

    let deliveryMessage = '';
    if (deliveryType === 'pickup') {
        deliveryMessage = `
            <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0; margin-top: 24px;">
                <h3 style="margin-top: 0; color: #166534; font-size: 18px; display: flex; align-items: center;">
                    📍 Ready for Pickup
                </h3>
                <p style="margin-bottom: 8px; color: #166534;">Please pick up your order at:</p>
                <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #052e16;">
                    ${pickupAddress}
                </p>
                <a href="${googleMapsLink}" style="display: inline-block; background: #166534; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                    Get Directions
                </a>
                <p style="margin-top: 16px; font-size: 14px; color: #166534;">
                    <strong>Start Heading Over!</strong><br/>
                    Please text/email us when you are on your way so we can have it ready at the door.
                </p>
            </div>
        `;
    } else {
        deliveryMessage = `
            <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe; margin-top: 24px;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">🚚 Delivery Update</h3>
                <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.5;">
                    We will be dropping off your treats within <strong>3-7 business days</strong>.
                </p>
                <p style="margin-top: 10px; font-size: 14px; color: #3b82f6;">
                    You will receive a final notification when it has been delivered.
                </p>
            </div>
        `;
    }

    const html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #db2777; margin: 0; font-size: 28px; font-weight: 800;">Payment Received! 🎉</h1>
                <p style="color: #666; font-size: 16px; margin-top: 8px;">Order #${orderCode} Confirmed</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
            <p style="font-size: 16px; line-height: 1.6;">
                Thank you! We've received your payment. We are preparing everything now.
            </p>

            ${deliveryMessage}

            <div style="background: #fdf2f8; padding: 16px; border-radius: 12px; border: 1px solid #fbcfe8; margin-top: 24px; text-align: center;">
                <p style="margin: 0; color: #9d174d; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Your Confirmation Code</p>
                <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: 900; color: #be185d; letter-spacing: 2px;">${orderCode}</p>
                <p style="margin-top: 8px; font-size: 13px; color: #9d174d;">Please provide this code upon pickup or delivery.</p>
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 14px;">
                <p style="margin-bottom: 0;">Stay Crunchy! 🍬</p>
                <p style="margin-top: 5px;">- The Candy Cruffs Team</p>
            </div>
        </div>
    `;

    await sendEmail(email, `Order Paid! #${orderCode}`, html);
    res.json({ success: true });
});

// 3. Order Cancelled/Expired
app.post('/api/emails/cancelled', async (req, res) => {
    const { email, name, orderCode, reason } = req.body;
    const firstName = name.split(' ')[0];

    const html = `
        <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #ef4444;">Order Cancelled 🛑</h1>
            <p>Hi ${firstName},</p>
            <p>Your order <strong>#${orderCode}</strong> has been cancelled.</p>
            <p><strong>Reason:</strong> ${reason || 'Payment was not received within the 1-hour window.'}</p>
            <p>If you still want these treats, please place a new order on our website.</p>
        </div>
    `;

    await sendEmail(email, `Order Cancelled #${orderCode}`, html);
    res.json({ success: true });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
