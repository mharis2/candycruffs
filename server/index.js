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

    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ec407a;">Orde Received! 🍬</h1>
            <p>Hi ${name},</p>
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
    const { email, name, orderCode } = req.body;

    const html = `
        <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #10b981;">Payment Received! 🎉</h1>
            <p>Hi ${name},</p>
            <p>We've received your payment for order <strong>#${orderCode}</strong>.</p>
            <p>We're preparing your freeze-dried treats now! You'll receive another update when they are on the way or ready for pickup.</p>
            <p>Stay Crunchy!</p>
        </div>
    `;

    await sendEmail(email, `Order Paid! #${orderCode}`, html);
    res.json({ success: true });
});

// 3. Order Cancelled/Expired
app.post('/api/emails/cancelled', async (req, res) => {
    const { email, name, orderCode, reason } = req.body;

    const html = `
        <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #ef4444;">Order Cancelled 🛑</h1>
            <p>Hi ${name},</p>
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
