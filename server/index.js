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
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Order Endpoint
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, subtotal, deliveryFee, total } = req.body;

        // Basic validation
        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        // Format email content
        const itemsList = items.map(item =>
            `- ${item.name} x${item.quantity} ($${item.price * item.quantity})`
        ).join('\n');

        const emailContent = `
New Order Received!

Customer Details:
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone}
Address: 
${customer.address}

Order Summary:
${itemsList}

Subtotal: $${subtotal}
Delivery Fee: $${deliveryFee}
Total: $${total}

(Note: Payment to be collected manually)
        `;

        // Send Email (Fire and forget - don't wait for it)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'harismuhammad455@gmail.com',
                subject: `New Candy Cruffs Order from ${customer.name}`,
                text: emailContent
            }).then(() => {
                console.log('Order email sent successfully');
            }).catch(err => {
                console.error('Failed to send email:', err);
            });
        } else {
            console.log('Email credentials missing, skipping email send.');
        }

        // Respond immediately
        res.status(200).json({ message: 'Order received successfully' });

    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
