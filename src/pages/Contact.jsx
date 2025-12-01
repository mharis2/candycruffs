import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-gray-600">Have a question or feedback? We'd love to hear from you.</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                            <p className="text-gray-600 mb-8">
                                Thank you for reaching out. We'll get back to you as soon as possible.
                            </p>
                            <Button onClick={() => setStatus('idle')}>Send Another Message</Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                    placeholder="What's on your mind?"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2"
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? (
                                    'Sending...'
                                ) : (
                                    <>
                                        Send Message <Send size={18} />
                                    </>
                                )}
                            </Button>

                            {status === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm"
                                >
                                    <AlertCircle size={20} />
                                    <p>Failed to send message. Please try again later.</p>
                                </motion.div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
