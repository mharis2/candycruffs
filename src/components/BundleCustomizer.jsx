import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronDown, ChevronUp, Package, Sparkles, Check } from 'lucide-react';
import { DEALS, getBundleProductImage, getBundleStock, getBundleSelectionTotal } from '../data/deals';
import { getStockLevel } from '../utils/inventoryService';

/**
 * BundleCustomizer — Expandable flavor picker for The Crunch Jackpot bundle.
 * Users select which flavors they want and how many of each (max 6 total).
 * 
 * Props:
 *  - stockMap: Map of SKU → stock quantity
 *  - selections: { [sku]: quantity } — current bundle selections (controlled)
 *  - onSelectionsChange: (newSelections) => void — callback when selections change
 *  - onAddToCart: () => void — called when user confirms 6-bag selection
 *  - isAdded: boolean — whether the bundle is already in the cart
 *  - onRemoveFromCart: () => void — remove the bundle from the cart
 *  - compact: boolean — if true, uses a more compact layout (for LaunchDeals card)
 */
const BundleCustomizer = ({
    stockMap,
    selections,
    onSelectionsChange,
    onAddToCart,
    isAdded = false,
    onRemoveFromCart,
    compact = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bundle = DEALS.collectionBundle;
    const totalSelected = getBundleSelectionTotal(selections);
    const isComplete = totalSelected === bundle.maxItems;

    // Get stock for each eligible product
    const bundleStock = useMemo(() => {
        return getBundleStock(stockMap, getStockLevel);
    }, [stockMap]);

    // Get product images
    const productImages = useMemo(() => {
        const images = {};
        bundle.eligibleProducts.forEach(p => {
            images[p.sku] = getBundleProductImage(p.productId);
        });
        return images;
    }, []);

    const updateSelection = (sku, delta) => {
        const current = selections[sku] || 0;
        const newQty = Math.max(0, current + delta);
        const stock = bundleStock[sku] || 0;

        // Don't exceed stock
        if (newQty > stock) return;

        // Don't exceed max items total
        const newTotal = totalSelected - current + newQty;
        if (newTotal > bundle.maxItems) return;

        const newSelections = { ...selections, [sku]: newQty };
        if (newQty === 0) delete newSelections[sku];
        onSelectionsChange(newSelections);
    };

    const remaining = bundle.maxItems - totalSelected;
    const progressPercent = (totalSelected / bundle.maxItems) * 100;

    return (
        <div className={`${compact ? '' : ''}`}>
            {/* Toggle Button */}
            {!isAdded ? (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isExpanded
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-200/50'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Package size={16} />
                        {isExpanded ? 'Customize Your Bundle' : 'Build Your Bundle — Pick 6 Bags!'}
                    </span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            ) : (
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <Check size={16} className="bg-green-100 rounded-full p-0.5" />
                        Bundle Added!
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold underline"
                        >
                            Edit
                        </button>
                        <button
                            onClick={onRemoveFromCart}
                            className="text-xs text-red-500 hover:text-red-700 font-bold underline"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            {/* Expandable Picker */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-3">
                            {/* Progress Bar */}
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                        {totalSelected}/{bundle.maxItems} bags selected
                                    </span>
                                    {remaining > 0 ? (
                                        <span className="text-xs text-purple-600 font-medium">
                                            {remaining} more to go!
                                        </span>
                                    ) : (
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                            <Sparkles size={12} /> Bundle complete!
                                        </span>
                                    )}
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${isComplete
                                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                                : 'bg-gradient-to-r from-purple-400 to-pink-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Flavor Grid */}
                            <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
                                {bundle.eligibleProducts.map(product => {
                                    const qty = selections[product.sku] || 0;
                                    const stock = bundleStock[product.sku] || 0;
                                    const isOutOfStock = stock <= 0;
                                    const canAdd = !isOutOfStock && qty < stock && totalSelected < bundle.maxItems;

                                    return (
                                        <div
                                            key={product.sku}
                                            className={`relative bg-white rounded-xl border-2 p-2.5 transition-all ${qty > 0
                                                    ? 'border-purple-300 ring-1 ring-purple-200 shadow-sm'
                                                    : isOutOfStock
                                                        ? 'border-gray-200 opacity-50'
                                                        : 'border-gray-100 hover:border-purple-200'
                                                }`}
                                        >
                                            {/* Product Image & Name */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {productImages[product.sku] ? (
                                                        <img
                                                            src={productImages[product.sku]}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <Package size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-900 leading-tight truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">{product.sizeName}</p>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            {isOutOfStock ? (
                                                <div className="text-[10px] text-red-500 font-bold text-center py-1">
                                                    Sold Out
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => updateSelection(product.sku, -1)}
                                                        disabled={qty === 0}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${qty === 0
                                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                                                            }`}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className={`w-8 text-center font-bold text-sm ${qty > 0 ? 'text-purple-700' : 'text-gray-400'
                                                        }`}>
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() => updateSelection(product.sku, 1)}
                                                        disabled={!canAdd}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${!canAdd
                                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 active:scale-95'
                                                            }`}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Stock indicator */}
                                            {!isOutOfStock && stock <= 5 && (
                                                <p className="text-[9px] text-orange-500 font-bold text-center mt-1 animate-pulse">
                                                    Only {stock} left
                                                </p>
                                            )}

                                            {/* Selected count badge */}
                                            {qty > 0 && (
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-purple-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                                                    {qty}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add to Cart Button */}
                            {!isAdded ? (
                                <button
                                    onClick={() => {
                                        if (isComplete) {
                                            onAddToCart();
                                            setIsExpanded(false);
                                        }
                                    }}
                                    disabled={!isComplete}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isComplete
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-200/50 active:scale-[0.98]'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isComplete ? (
                                        <>
                                            <Sparkles size={16} />
                                            Add Bundle to Cart — ${bundle.salePrice}
                                        </>
                                    ) : (
                                        `Select ${remaining} more bag${remaining !== 1 ? 's' : ''}`
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onAddToCart();
                                        setIsExpanded(false);
                                    }}
                                    disabled={!isComplete}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isComplete
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg active:scale-[0.98]'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Check size={16} />
                                    Update Bundle
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BundleCustomizer;
