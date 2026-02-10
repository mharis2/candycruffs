import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Package, Tag, ArrowRight, Gift, XCircle, ShoppingBag } from 'lucide-react';
import { DEALS, isBundleAvailable, getBundleSelectionTotal } from '../data/deals';
import { getStockLevel } from '../utils/inventoryService';
import Reveal from './ui/Reveal';
import BundleCustomizer from './BundleCustomizer';

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
    const { collectionBundle, mixAndMatch, regularDeal } = DEALS;
    const navigate = useNavigate();
    const [bundleSelections, setBundleSelections] = useState({});

    if (!collectionBundle.active && !mixAndMatch.active && !regularDeal.active) return null;

    // Check if bundle is available (all component SKUs in stock)
    const bundleInStock = stockMap && stockMap.size > 0
        ? isBundleAvailable(stockMap, getStockLevel)
        : true; // Assume available if stock not loaded yet

    // Confetti colors — shifted to purple/pink scheme
    const confettiColors = [
        'bg-purple-400', 'bg-pink-400', 'bg-rose-300',
        'bg-violet-400', 'bg-fuchsia-400', 'bg-purple-300'
    ];

    return (
        <div className="mb-16">
            {/* Exclusive Limited Time Deals Banner */}
            <Reveal>
                <div className="relative mb-8 overflow-hidden max-w-5xl mx-auto">
                    {/* Main Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl py-6 px-8 shadow-xl border-2 border-purple-400/30"
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
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />

                        {/* Content */}
                        <div className="relative z-10 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Sparkles size={28} className="text-white/80 animate-pulse" />
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white tracking-tight uppercase">
                                    Exclusive Limited Time Deals
                                </h2>
                                <Sparkles size={28} className="text-white/80 animate-pulse" />
                            </div>
                            <p className="text-white/80 font-medium text-sm md:text-base">
                                Stack your savings — deals apply automatically! 💰
                            </p>
                        </div>

                        {/* Corner Decorations */}
                        <div className="absolute top-2 left-2">
                            <Gift size={24} className="text-white/20" />
                        </div>
                        <div className="absolute bottom-2 right-2">
                            <Gift size={24} className="text-white/20" />
                        </div>
                    </motion.div>
                </div>
            </Reveal>

            {/* Three Deal Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Card 1: The Crunch Jackpot Bundle */}
                {collectionBundle.active && (
                    <Reveal delay={0.1} width="100%" className="h-full">
                        <motion.div
                            whileHover={bundleInStock ? { scale: 1.02, y: -4 } : {}}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`relative bg-gradient-to-br from-white via-white to-purple-50/50 rounded-[1.5rem] border-2 shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col w-full ${bundleInStock
                                ? 'border-purple-200 hover:shadow-2xl group'
                                : 'border-gray-300 opacity-75'
                                }`}
                        >
                            {/* Decorative glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-pink-400/10 pointer-events-none" />
                            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-5 relative z-10 flex flex-col h-full">
                                {/* Save Badge or Sold Out Badge */}
                                <div className="flex justify-end mb-3">
                                    {bundleInStock ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-purple-500/40"
                                        >
                                            🎁 SAVE ${collectionBundle.savings}!
                                        </motion.div>
                                    ) : (
                                        <div className="bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-2">
                                            <XCircle size={14} />
                                            SOLD OUT
                                        </div>
                                    )}
                                </div>

                                {/* Image */}
                                <div className={`relative h-48 mb-3 flex items-center justify-center ${!bundleInStock && 'grayscale opacity-60'}`}>
                                    <motion.img
                                        src={collectionBundle.image}
                                        alt={collectionBundle.name}
                                        className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="text-center flex-grow flex flex-col">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Package size={18} className="text-purple-500" />
                                        <h3 className="text-lg font-display font-bold text-gray-900">
                                            {collectionBundle.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-2">
                                        Any 6 Large bags (Prism Pops included) — 1 bag FREE!
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        <span className="text-gray-400 line-through text-base">
                                            ${collectionBundle.originalPrice}
                                        </span>
                                        <span className={`text-2xl font-black ${bundleInStock ? 'text-purple-600' : 'text-gray-500'}`}>
                                            ${collectionBundle.salePrice}
                                        </span>
                                    </div>

                                    {/* Bundle Customizer */}
                                    <div className="mt-auto">
                                        {bundleInStock ? (
                                            <BundleCustomizer
                                                stockMap={stockMap}
                                                selections={bundleSelections}
                                                onSelectionsChange={setBundleSelections}
                                                onAddToCart={() => {
                                                    // Navigate to order page with selections
                                                    const params = new URLSearchParams();
                                                    params.set('bundle', 'custom');
                                                    params.set('selections', JSON.stringify(bundleSelections));
                                                    navigate(`/order?${params.toString()}`);
                                                }}
                                                compact={true}
                                            />
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full bg-gray-400 text-white font-bold py-2.5 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                            >
                                                <XCircle size={16} />
                                                Currently Unavailable
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Reveal>
                )}

                {/* Card 2: Mix & Match 3 for $27 Deal */}
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

                            <div className="p-5 relative z-10 flex flex-col h-full">
                                {/* Deal Badge */}
                                <div className="flex justify-end mb-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-emerald-500/40"
                                    >
                                        💰 SAVE $3!
                                    </motion.div>
                                </div>

                                {/* Visual: Three bags icon */}
                                <div className="relative h-28 mb-3 flex items-center justify-center">
                                    <div className="flex items-end gap-2">
                                        {[0.9, 1, 0.9].map((scale, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + i * 0.15 }}
                                                style={{ transform: `scale(${scale})` }}
                                                className="w-12 h-16 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg flex items-center justify-center border-2 border-gray-200 relative"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/50 flex items-center justify-center shadow-inner">
                                                    <span className="text-[10px] font-black text-primary">L</span>
                                                </div>
                                                {/* Little tag */}
                                                <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full shadow" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* "3" Badge */}
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-base shadow-xl shadow-emerald-500/40"
                                    >
                                        3
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="text-center flex-grow flex flex-col">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Tag size={18} className="text-emerald-500" />
                                        <h3 className="text-lg font-display font-bold text-gray-900">
                                            {mixAndMatch.name}
                                        </h3>
                                    </div>
                                    <p className="text-xl font-black text-emerald-600 mb-1">
                                        {mixAndMatch.tagline}
                                    </p>
                                    <p className="text-gray-500 text-xs mb-3">
                                        {mixAndMatch.description}
                                    </p>

                                    {/* Savings callout - Push to bottom */}
                                    <div className="mt-auto bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl px-3 py-2.5">
                                        <p className="text-emerald-800 font-bold text-xs">
                                            Save <span className="text-base">${mixAndMatch.savingsPerSet}</span> on every 3 Large bags!
                                        </p>
                                        <p className="text-emerald-600 text-[10px] mt-1">
                                            Stacks automatically — 6 bags = $54, 9 bags = $81
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Reveal>
                )}

                {/* Card 3: 2 Regulars for $15 Deal */}
                {regularDeal.active && (
                    <Reveal delay={0.3} width="100%" className="h-full">
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative bg-gradient-to-br from-white via-white to-blue-50/50 rounded-[1.5rem] border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group h-full flex flex-col w-full"
                        >
                            {/* Decorative glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-indigo-400/10 pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="p-5 relative z-10 flex flex-col h-full">
                                {/* Deal Badge */}
                                <div className="flex justify-end mb-3">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg shadow-blue-500/40"
                                    >
                                        💰 SAVE $1!
                                    </motion.div>
                                </div>

                                {/* Visual: Two bags icon */}
                                <div className="relative h-28 mb-3 flex items-center justify-center">
                                    <div className="flex items-end gap-3">
                                        {[0.95, 0.95].map((scale, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + i * 0.15 }}
                                                style={{ transform: `scale(${scale})` }}
                                                className="w-12 h-16 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg flex items-center justify-center border-2 border-gray-200 relative"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-300/50 to-indigo-400/50 flex items-center justify-center shadow-inner">
                                                    <span className="text-[10px] font-black text-blue-600">R</span>
                                                </div>
                                                {/* Little tag */}
                                                <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full shadow" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* "2" Badge */}
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-500 to-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black text-base shadow-xl shadow-blue-500/40"
                                    >
                                        2
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="text-center flex-grow flex flex-col">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <ShoppingBag size={18} className="text-blue-500" />
                                        <h3 className="text-lg font-display font-bold text-gray-900">
                                            {regularDeal.name}
                                        </h3>
                                    </div>
                                    <p className="text-xl font-black text-blue-600 mb-1">
                                        {regularDeal.tagline}
                                    </p>
                                    <p className="text-gray-500 text-xs mb-3">
                                        {regularDeal.description}
                                    </p>

                                    {/* Savings callout - Push to bottom */}
                                    <div className="mt-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl px-3 py-2.5">
                                        <p className="text-blue-800 font-bold text-xs">
                                            Save <span className="text-base">${regularDeal.savingsPerSet}</span> on every 2 Regular bags!
                                        </p>
                                        <p className="text-blue-600 text-[10px] mt-1">
                                            Stacks automatically — 4 bags = $30, 6 bags = $45
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
