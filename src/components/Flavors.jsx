import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { products } from '../data/products';
import { ShoppingBag } from 'lucide-react';
import { fetchStockData, getStockLevel, subscribeToStockUpdates } from '../utils/inventoryService';

const FlavorCard = ({ product, index, stockMap }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [showComparison, setShowComparison] = useState(false);
    const lastHoverTime = useRef(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setShowComparison(false);
    };

    const handleMouseEnter = () => {
        setShowComparison(true);
        lastHoverTime.current = Date.now();
    };

    const handleImageClick = () => {
        // Debounce click check to separate "Tap to Hover" from "Tap to Toggle"
        if (Date.now() - lastHoverTime.current > 200) {
            setShowComparison(prev => !prev);
        }
    };

    // Calculate Price Range
    const prices = product.sizes?.map(s => s.price) || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `From $${minPrice}`;

    // Check Stock Status
    let isFullySoldOut = true;
    let hasLowStock = false;
    let totalStock = 0;

    if (product.sizes) {
        product.sizes.forEach(size => {
            const qty = size.sku ? getStockLevel(stockMap, size.sku) : 0;
            if (qty > 0) isFullySoldOut = false;
            if (qty > 0 && qty <= 10) {
                hasLowStock = true;
                totalStock += qty;
            }
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 z-10 hover:z-20"
        >
            <div className="flex flex-col h-full rounded-[2rem] overflow-hidden">
                {/* Image Area - Updated for Bleed Effect */}
                <div
                    className="relative h-72 bg-gray-50 flex items-center justify-center cursor-pointer" // Increased height, removed overflow-hidden here initially, but keeping it on parent for rounded corners? 
                    // Wait, if we want bleed, we can't have overflow-hidden on the parent "rounded-[2rem]" container if the image goes OUTSIDE.
                    // But if the image is just "floating" inside a larger header area, it's fine.
                    // The user said "getting cut out from the card as the image is going past the bottom".
                    // The issue is likely `overflow-hidden` on the card wrapper or the image container.
                    // Let's TRY to keep overflow-hidden on the card for border-radius, but allow the image to scale nicely WITHIN ample space, OR remove overflow-hidden and handle border-radius on children.

                    // User wants "bleed out". This usually means overlapping sections.
                    // For a "premium seamless" look where it lands nice:
                    // 1. Remove overflow-hidden from the main card container? No, that ruins rounded corners.
                    // 2. UNLESS we simulate rounded corners on the background div, and let the image float above.

                    // Revised Approach: 
                    // 1. Remove `overflow-hidden` from the Card root.
                    // 2. Add an "inner" background card that HAS rounded corners and background.
                    // 3. Position the image absolutely or relatively such that it pops OUT of that background.

                    // Actually, simpler fix for "seamless modern":
                    // Use a specific margin/negative margin trick or z-index.

                    // Let's try: Remove overflow-hidden from Card.
                    // Add `rounded-[2rem]` to the content wrapper div (the white bg).
                    // The top image area needs its own background with top-rounded corners.

                    onMouseEnter={handleMouseEnter}
                    onClick={handleImageClick}
                >
                    {/* Background blob/gradient that STAYS inside rounded corners */}
                    <div className="absolute inset-0 bg-gray-50 rounded-t-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.1, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative z-30 w-[85%] h-[85%] flex items-center justify-center" // Removed fixed w-80 h-80 to be responsive and contained yet pop
                    >
                        {/* Product Image Container */}
                        <div className="w-full h-full relative drop-shadow-2xl">
                            {/* Main Image */}
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    className={`w-full h-full object-contain transition-opacity duration-500 filter drop-shadow-lg ${showComparison && product.sizeComparisonImage ? 'opacity-0' : 'opacity-100'}`}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold">Img</div>
                            )}

                            {/* Size Comparison Image */}
                            {product.sizeComparisonImage && (
                                <img
                                    src={product.sizeComparisonImage}
                                    alt={`${product.name} sizes`}
                                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 filter drop-shadow-lg ${showComparison ? 'opacity-100' : 'opacity-0'}`}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                        {product.badges?.map((badge) => {
                            const badgeColors = {
                                'HALAL': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                                'GELATIN-FREE': 'bg-teal-50 text-teal-700 border-teal-100',
                                'SWEET': 'bg-pink-50 text-pink-700 border-pink-100',
                                'SOUR': 'bg-lime-50 text-lime-700 border-lime-100',
                                'SPICY': 'bg-red-50 text-red-700 border-red-100',
                                'FRUITY': 'bg-orange-50 text-orange-700 border-orange-100',
                                'CRUNCHY': 'bg-amber-50 text-amber-700 border-amber-100',
                                'BEST SELLER': 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                'NEW': 'bg-blue-50 text-blue-700 border-blue-100',
                                'NEON': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
                                'COLA': 'bg-stone-50 text-stone-700 border-stone-100',
                                'FIZZY': 'bg-violet-50 text-violet-700 border-violet-100',
                                'RAINBOW': 'bg-indigo-50 text-indigo-700 border-indigo-100',
                            };

                            const colorClass = badgeColors[badge] || 'bg-gray-50 text-gray-700 border-gray-100';

                            return (
                                <span key={badge} className={`${colorClass} backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm border uppercase`}>
                                    {badge}
                                </span>
                            );
                        })}
                    </div>
                    {/* Interaction Cue */}
                    {product.sizeComparisonImage && (
                        <div className={`absolute top-4 left-4 z-20 pointer-events-none transition-opacity duration-300 ${showComparison ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="md:hidden">Tap</span>
                                <span className="hidden md:inline">Hover</span>
                                {' '}me to see sizes
                            </span>
                        </div>
                    )}

                    {/* Stock Overlays */}
                    {isFullySoldOut && (
                        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 shadow-xl border-4 border-white">
                                SOLD OUT
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-8 pt-24 flex flex-col flex-grow bg-white relative z-20">
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-display font-bold text-gray-900 leading-tight">{product.name}</h3>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                    {priceDisplay}
                                </span>
                                {hasLowStock && !isFullySoldOut && (
                                    <span className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wide animate-pulse">
                                        Low in Stock!
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Tagline */}
                        <p className="text-sm font-medium text-secondary mb-3">{product.tagline}</p>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{product.description}</p>
                    </div>

                    <div className="mt-auto pt-6">
                        <Link to={`/order?product=${product.id}`}>
                            <Button
                                className="w-full group-hover:bg-primary group-hover:text-white shadow-md shadow-primary/10 group-hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isFullySoldOut}
                            >
                                {isFullySoldOut ? 'Sold Out' : 'Order Now'}
                                <ShoppingBag size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Flavors = () => {
    const [stockMap, setStockMap] = useState(new Map());

    useEffect(() => {
        fetchStockData().then(setStockMap);

        const sub = subscribeToStockUpdates(setStockMap);
        return () => sub.unsubscribe();
    }, []);

    return (
        <section className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden" id="flavors">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-40" />
                <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl opacity-40" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Reveal>
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-4 block">
                            Our Menu
                        </span>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
                            The Signature <br />
                            <span className="text-primary">Collection.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.4}>
                        <p className="text-lg text-gray-600">
                            Our premium freeze-dried selection. Always fresh, always crunchy.
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto perspective-1000">
                    {products.map((product, index) => (
                        <FlavorCard key={product.id} product={product} index={index} stockMap={stockMap} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Flavors;
