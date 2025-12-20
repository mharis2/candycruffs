import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: "Sarah J.",
        quote: "I never knew candy could be this crunchy! The flavor is so intense, I'm addicted.",
        rating: 5
    },
    {
        id: 2,
        name: "Mike T.",
        quote: "Bought these for my kids, ended up eating the whole bag myself. Sorry not sorry!",
        rating: 5
    },
    {
        id: 3,
        name: "Emily R.",
        quote: "The texture is insane. It literally melts in your mouth. Best snack ever.",
        rating: 5
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-pink-50/50 via-purple-50/50 to-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
                            Sweet Words
                        </h2>
                        <div className="w-24 h-1.5 bg-primary rounded-full mx-auto mt-6 opacity-30" />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-pink-100/50 border border-white relative hover:-translate-y-2 transition-transform duration-300 ring-1 ring-black/5"
                        >
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={18} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-600 text-lg mb-6 italic leading-relaxed">"{t.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {t.name[0]}
                                </div>
                                <p className="font-bold text-gray-900">{t.name}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
