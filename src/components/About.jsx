import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Heart, CheckCircle } from 'lucide-react';
import Reveal from './ui/Reveal';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -10 }}
        className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <Icon size={28} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-display font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
);

const About = () => {
    return (
        <section className="py-20 lg:py-32 bg-white relative" id="about">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                    <div className="order-2 lg:order-1">
                        <Reveal>
                            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-4 block">
                                Our Story
                            </span>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
                                Pure. Crunchy. <br />
                                <span className="text-primary">Simply Delightful.</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={0.4}>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    Candy Cruffs started with a simple craving: we wanted the fun of freeze-dried candy, but we needed it to be 100% pure and authentic.
                                </p>
                                <p>
                                    So we started making it ourselves right here in Edmonton. We take your favorite treats and transform them using advanced freeze-drying technology.
                                </p>
                                <p>
                                    The result? An airy, crispy texture that intensifies the flavor and melts in your mouth. It's not just candy; it's an experience.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.6}>
                            <div className="mt-8 flex gap-4">
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span>100% Halal</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span>Locally Made</span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="order-1 lg:order-2 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden relative"
                        >
                            {/* Decorative blobs */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    src="/assets/logo.png"
                                    alt="Made with Love"
                                    className="w-48 h-48 object-contain opacity-80 rotate-[-10deg]"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Zap}
                        title="Hyper Crunchy"
                        description="Satisfyingly crisp and airy. No more chewy jaw-breakers, just pure crunch."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={Heart}
                        title="Intense Flavor"
                        description="Removing water concentrates the taste. Prepare for a flavor impact like never before."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={Sparkles}
                        title="Perfect for Gifting"
                        description="Unique, fun, and delicious. The perfect treat for parties, weddings, or just yourself."
                        delay={0.5}
                    />
                </div>
            </div>
        </section>
    );
};

export default About;
