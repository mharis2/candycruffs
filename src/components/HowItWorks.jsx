import React from 'react';
import { motion } from 'framer-motion';
import { Snowflake, Wind, Package, Smile } from 'lucide-react';

const steps = [
    { icon: Snowflake, title: "Freeze", desc: "Flash frozen to lock in freshness." },
    { icon: Wind, title: "Dry", desc: "Ice turns to vapor in a vacuum." },
    { icon: Package, title: "Pack", desc: "Sealed tight for maximum crunch." },
    { icon: Smile, title: "Snack", desc: "Ready for you to enjoy." },
];

const HowItWorks = () => {
    return (
        <section className="py-20 bg-blue-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                        The Science of Crunch
                    </h2>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        How do we make it so airy? It's a simple process with amazing results.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <step.icon size={32} className="text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-white/70 text-sm">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
