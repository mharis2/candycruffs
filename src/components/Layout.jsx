import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import Footer from './Footer';

const Layout = ({ children }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Flavours', path: '/#flavors' }, // Anchor link for home
        { name: 'About', path: '/#about' },
    ];
    return (
        <div className="min-h-screen flex flex-col font-sans text-text bg-background">
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <img src="/assets/logo-text.webp" alt="Candy Cruffs" className="h-12 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.path} className="font-medium hover:text-primary transition-colors">
                                {link.name}
                            </a>
                        ))}
                        <Link
                            to="/order"
                            className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary-dark transition-colors flex items-center gap-2"
                        >
                            <span>Order Now</span>
                            <ShoppingBag size={18} />
                        </Link>
                    </div>

                    <button
                        className="md:hidden text-text p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            < AnimatePresence >
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col space-y-6 text-center">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    className="text-2xl font-medium text-text"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <Link
                                to="/order"
                                className="bg-primary text-white py-4 rounded-xl text-xl font-bold shadow-xl shadow-primary/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Order Now
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >

            <main className="flex-grow pt-20">
                {children}
            </main>

            <Footer />
        </div >
    );
};

export default Layout;
