import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { ArrowRight, Star, Sparkles, Tag, Candy } from 'lucide-react';

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
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Exclusive Deals Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-4 lg:mb-6"
                >
                    <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl py-4 px-6 md:py-5 md:px-8 shadow-2xl border-2 border-purple-400/30 overflow-hidden">
                        {/* Animated Sparkle Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.3,
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                    className="absolute text-white/30"
                                    style={{
                                        left: `${10 + i * 12}%`,
                                        top: `${20 + (i % 3) * 25}%`
                                    }}
                                >
                                    <Sparkles size={16} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Shimmer Effect */}
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                            style={{ width: '50%' }}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-3 text-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={28} className="text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-lg md:text-2xl lg:text-3xl font-display font-black text-white tracking-tight">
                                    ✨ EXCLUSIVE LIMITED TIME DEALS ✨
                                </h2>
                                <p className="text-white/80 text-xs md:text-sm font-medium">
                                    Stackable savings & free delivery on orders $70+ • Don't miss out!
                                </p>
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Tag size={28} className="text-white" />
                            </motion.div>
                        </div>

                        {/* Decorative corners */}
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/20 rounded-tl" />
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white/20 rounded-tr" />
                        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white/20 rounded-bl" />
                        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/20 rounded-br" />
                    </div>
                </motion.div>

                {/* New Flavours Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8 lg:mb-12"
                >
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl py-3 px-5 flex items-center justify-center gap-3 shadow-sm">
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xl"
                        >
                            🍬
                        </motion.span>
                        <p className="text-amber-800 font-bold text-sm md:text-base">
                            New Flavours Coming Soon!
                        </p>
                        <motion.span
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            className="text-xl"
                        >
                            🍬
                        </motion.span>
                    </div>
                </motion.div>

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
                                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={scrollToFlavors}>
                                    View Flavours
                                </Button>
                            </div>
                        </Reveal>
                    </motion.div>

                    {/* Visual Content */}
                    <div
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
                                    src="/assets/logo.webp"
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
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
