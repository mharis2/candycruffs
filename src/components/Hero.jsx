import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { ArrowRight, Star } from 'lucide-react';

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    // Removed text/visual parallax to prevent overlap on mobile

    const scrollToFlavors = (e) => {
        e.preventDefault();
        const flavorsSection = document.getElementById('flavors');
        if (flavorsSection) {
            flavorsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-background to-white">
            {/* Background Elements */}
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />
            </motion.div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text Content */}
                    <motion.div
                        className="text-left lg:text-left order-2 lg:order-1"
                    >
                        <Reveal>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-6 mr-auto lg:mx-0">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">Halal Ingredients</span>
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1] text-left lg:text-left">
                                Airy, Crunchy, <br />
                                <span className="text-primary">
                                    Halal Treats.
                                </span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mr-auto lg:mx-0 leading-relaxed text-left">
                                Experience the wonder of freeze-dried candy. Intense flavor, airy texture, and a crunch that melts in your mouth.
                                <span className="block mt-2 font-medium text-primary">Locally made in Edmonton, AB.</span>
                            </p>
                        </Reveal>

                        <Reveal delay={0.6}>
                            <div className="flex flex-col sm:flex-row gap-4 justify-start lg:justify-start">
                                <Link to="/order">
                                    <Button size="lg" className="group w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40">
                                        Order Now
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <button onClick={scrollToFlavors} className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full pointer-events-none">
                                        View Flavors
                                    </Button>
                                </button>
                            </div>
                        </Reveal>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative order-1 lg:order-2"
                    >
                        <div className="relative aspect-square max-w-md mx-auto lg:max-w-full">
                            {/* Main Image Container */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10"
                            >
                                <img
                                    src="/assets/logo.png"
                                    alt="Candy Cruffs Premium Freeze Dried Candy"
                                    className="w-full h-full object-contain drop-shadow-2xl"
                                />
                            </motion.div>

                            {/* Floating Elements */}


                            {/* Floating Badge */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="absolute bottom-0 right-0 lg:right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-glass border border-white/50 rotate-[-6deg] cursor-pointer z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-tight">Premium Quality</p>
                                        <p className="text-xs text-gray-500">100% Halal</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
