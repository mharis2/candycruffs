import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">



                <div className="grid md:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="block w-48 mb-6">
                            <img src="/assets/logo-text.webp" alt="Candy Cruffs" loading="lazy" className="w-full h-auto brightness-0 invert" />
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            Reinventing snacking with freeze-dried wonder.
                            Crunchy, airy, and packed with flavor.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Shop</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/order" className="hover:text-white transition-colors">Order Now</Link></li>
                            <li>
                                <span className="hover:text-white transition-colors cursor-not-allowed opacity-70">Bundles</span>
                                <span className="ml-2 text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">SOON</span>
                            </li>
                            <li>
                                <span className="hover:text-white transition-colors cursor-not-allowed opacity-70">Gift Cards</span>
                                <span className="ml-2 text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">SOON</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Candy Cruffs. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="https://www.instagram.com/candycruffs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="https://www.facebook.com/Candy.Cruffs/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
