import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Tag, ArrowRight, Gift, XCircle } from 'lucide-react';
import { DEALS, isBundleAvailable } from '../data/deals';
import { getStockLevel } from '../utils/inventoryService';
import Reveal from './ui/Reveal';

// Confetti particle component
const ConfettiParticle = ({ delay, left, color }) => (
    <motion.div
        initial={{ y: -10, opacity: 0, rotate: 0 }}
        animate={{
            y: [0, 15, 30],
            opacity: [0, 1, 0.3],
            rotate: [0, 180, 360]
        }}
        transition={{
            duration: 3,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className={`absolute w-2 h-2 ${color} rounded-sm`}
        style={{ left: `${left}%`, top: '20%' }}
    />
);

const LaunchDeals = ({ stockMap }) => {
    const { collectionBundle, mixAndMatch } = DEALS;

    if (!collectionBundle.active && !mixAndMatch.active) return null;

    // Check if bundle is available (all component SKUs in stock)
    const bundleInStock = stockMap && stockMap.size > 0
        ? isBundleAvailable(stockMap, getStockLevel)
        : true; // Assume available if stock not loaded yet

    // Confetti colors
    const confettiColors = [
        'bg-amber-400', 'bg-pink-400', 'bg-yellow-300',
        'bg-orange-400', 'bg-rose-400', 'bg-amber-300'
    ];

    return (
        <div className="mb-16">
            {/* Grand Opening Banner */}
            <Reveal>
                <div className="relative mb-8 overflow-hidden">
                    {/* Main Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-2xl py-6 px-8 shadow-xl border-2 border-amber-300"
                    >
                        {/* Confetti Effect */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <ConfettiParticle
                                    key={i}
                                    delay={i * 0.2}
                                    left={8 + i * 8}
                                    color={confettiColors[i % confettiColors.length]}
                                />
                            ))}
                        </div>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Sparkles size={28} className="text-amber-700 animate-pulse" />
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-amber-900 tracking-tight uppercase">
                                    Grand Opening Launch Week Exclusives
                                </h2>
                                <Sparkles size={28} className="text-amber-700 animate-pulse" />
                            </div>
                            <p className="text-amber-800 font-medium text-sm md:text-base">
                                Limited time offers to celebrate our launch! 🎉
                            </p>
                        </div>

                        {/* Corner Decorations */}
                        <div className="absolute top-2 left-2">
                            <Gift size={24} className="text-amber-600/50" />
                        </div>
                        <div className="absolute bottom-2 right-2">
                            <Gift size={24} className="text-amber-600/50" />
                        </div>
                    </motion.div>
                </div>
            </Reveal>

            {/* Equal Width Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Card 1: The Full Collection Bundle */}
                {collectionBundle.active && (
                    <Reveal delay={0.1} width="100%" className="h-full">
                        <motion.div
                            whileHover={bundleInStock ? { scale: 1.02, y: -4 } : {}}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`relative bg-gradient-to-br from-white via-white to-amber-50/50 rounded-[1.5rem] border-2 shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col w-full ${bundleInStock
                                ? 'border-amber-200 hover:shadow-2xl group'
                                : 'border-gray-300 opacity-75'
                                }`}
                        >
                            {/* Decorative glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-primary/10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-6 relative z-10 flex flex-col h-full">
                                {/* Save Badge or Sold Out Badge */}
                                <div className="flex justify-end mb-3">
                                    {bundleInStock ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg shadow-red-500/40"
                                        >
                                            🎁 SAVE ${collectionBundle.savings}!
                                        </motion.div>
                                    ) : (
                                        <div className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg flex items-center gap-2">
                                            <XCircle size={16} />
                                            SOLD OUT
                                        </div>
                                    )}
                                </div>

                                {/* Image */}
                                <div className={`relative h-64 mb-4 flex items-center justify-center ${!bundleInStock && 'grayscale opacity-60'}`}>
                                    <motion.img
                                        src={collectionBundle.image}
                                        alt={collectionBundle.name}
                                        className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="text-center flex-grow flex flex-col">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Package size={20} className="text-amber-500" />
                                        <h3 className="text-xl font-display font-bold text-gray-900">
                                            {collectionBundle.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-3">
                                        All 5 signature flavors in one bundle
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <span className="text-gray-400 line-through text-lg">
                                            ${collectionBundle.originalPrice}
                                        </span>
                                        <span className={`text-3xl font-black ${bundleInStock ? 'text-primary' : 'text-gray-500'}`}>
                                            ${collectionBundle.salePrice}
                                        </span>
                                    </div>

                                    {/* CTA Button - Push to bottom */}
                                    <div className="mt-auto">
                                        {bundleInStock ? (
                                            <Link to="/order?bundle=full-collection">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full bg-gradient-to-r from-primary via-pink-500 to-rose-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <Package size={18} />
                                                    Add All to Cart
                                                    <ArrowRight size={18} />
                                                </motion.button>
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                Currently Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Reveal>
                )}

                {/* Card 2: Mix & Match Deal */}
                {mixAndMatch.active && (
                    <Reveal delay={0.2} width="100%" className="h-full">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative bg-gradient-to-br from-white via-white to-emerald-50/50 rounded-[1.5rem] border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full flex flex-col w-full"
                        >
                            {/* Decorative glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-teal-400/10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-6 relative z-10 flex flex-col h-full">
                                {/* Deal Badge */}
                                <div className="flex justify-end mb-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg shadow-emerald-500/40"
                                    >
                                        💰 SAVE $3!
                                    </motion.div>
                                </div>

                                {/* Visual: Three bags icon */}
                                <div className="relative h-36 mb-4 flex items-center justify-center">
                                    <div className="flex items-end gap-2">
                                        {[0.9, 1, 0.9].map((scale, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.15 }}
                                                style={{ transform: `scale(${scale})` }}
                                                className="w-14 h-20 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg flex items-center justify-center border-2 border-gray-200 relative"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-secondary/50 flex items-center justify-center shadow-inner">
                                                    <span className="text-xs font-black text-primary">L</span>
                                                </div>
                                                {/* Little tag */}
                                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full shadow" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* "3" Badge */}
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg shadow-xl shadow-emerald-500/40"
                                    >
                                        3
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="text-center flex-grow flex flex-col">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Tag size={20} className="text-emerald-500" />
                                        <h3 className="text-xl font-display font-bold text-gray-900">
                                            {mixAndMatch.name}
                                        </h3>
                                    </div>
                                    <p className="text-2xl font-black text-emerald-600 mb-2">
                                        {mixAndMatch.tagline}
                                    </p>
                                    <p className="text-gray-500 text-sm mb-3">
                                        {mixAndMatch.description}
                                    </p>

                                    {/* Savings callout - Push to bottom */}
                                    <div className="mt-auto bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl px-4 py-3">
                                        <p className="text-emerald-800 font-bold text-sm">
                                            Save <span className="text-lg">${mixAndMatch.savingsPerSet}</span> on every 3 Large bags!
                                        </p>
                                        <p className="text-emerald-600 text-xs mt-1">
                                            Stacks automatically — 6 bags = $54, 9 bags = $81
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Reveal>
                )}
            </div>
        </div>
    );
};

export default LaunchDeals;
