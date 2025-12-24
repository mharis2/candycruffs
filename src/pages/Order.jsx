import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import { Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, PartyPopper, Info, ZoomIn, Sparkles, Package } from 'lucide-react';
import AddressAutocomplete from '../components/AddressAutocomplete';
import ProductImageModal from '../components/ui/ProductImageModal';
import { fetchStockData, getStockLevel, subscribeToStockUpdates } from '../utils/inventoryService';
import { supabase } from '../utils/supabaseClient';
import { generateOrderCode } from '../utils/orderUtils';
import { DEALS, calculateMixMatchDiscount, isEligibleForMixMatch, isBundleAvailable, getMaxBundleQuantity } from '../data/deals';

// Helper: Get product and size from a unique key "productId_sizeId"
const getProductAndSize = (key) => {
    const [productId, sizeId] = key.split('_');
    const product = products.find(p => p.id === productId);
    const size = product?.sizes?.find(s => s.id === sizeId);
    return { product, size };
};

const ProductItem = ({ product, quantities, updateQuantity, onImageClick, stockMap }) => {
    // Helper function to find the best available size
    const findBestAvailableSize = (currentStockMap) => {
        // First try to find Large size
        const largeSize = product.sizes?.find(s => s.name === 'Large' || s.id === 'lrg');
        if (largeSize) {
            // If stock data is loaded and Large is out of stock, find alternative
            if (currentStockMap && currentStockMap.size > 0 && largeSize.sku) {
                const largeStock = getStockLevel(currentStockMap, largeSize.sku);
                if (largeStock <= 0) {
                    // Large is out of stock, find first available
                    const availableSize = product.sizes?.find(s => {
                        if (!s.sku) return true;
                        return getStockLevel(currentStockMap, s.sku) > 0;
                    });
                    return availableSize ? availableSize.id : largeSize.id;
                }
            }
            // Large is available or stock data not loaded yet - default to Large
            return largeSize.id;
        }

        // No Large size exists, fall back to first size
        return product.sizes?.[0]?.id || 'lrg';
    };

    // Default to Large size if available, otherwise first size
    const [activeSizeId, setActiveSizeId] = useState(() => findBestAvailableSize(stockMap));

    // Re-evaluate active size when stockMap loads or changes
    // This handles the case where stockMap was empty on initial render
    useEffect(() => {
        if (stockMap && stockMap.size > 0) {
            const activeSize = product.sizes?.find(s => s.id === activeSizeId);
            // Only switch if current size is out of stock AND user hasn't added any to cart
            if (activeSize?.sku) {
                const currentStock = getStockLevel(stockMap, activeSize.sku);
                const quantityKey = `${product.id}_${activeSizeId}`;
                const hasQuantityInCart = (quantities[quantityKey] || 0) > 0;

                if (currentStock <= 0 && !hasQuantityInCart) {
                    // Current size is out of stock, switch to best available
                    const bestSize = findBestAvailableSize(stockMap);
                    if (bestSize !== activeSizeId) {
                        setActiveSizeId(bestSize);
                    }
                }
            }
        }
    }, [stockMap, product.id, product.sizes, activeSizeId, quantities]);

    const activeSize = product.sizes?.find(s => s.id === activeSizeId);
    const quantityKey = `${product.id}_${activeSizeId}`;
    const currentQuantity = quantities[quantityKey] || 0;

    // Check stock for the CURRENTLY active size
    const currentStock = activeSize?.sku ? getStockLevel(stockMap, activeSize.sku) : 0;
    const isOutOfStock = currentStock <= 0;

    // Animation control for the "pop" effect
    const [isAnimating, setIsAnimating] = useState(false);

    const handleSizeChange = (sizeId) => {
        if (sizeId === activeSizeId) return;
        setActiveSizeId(sizeId);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300); // Reset after animation
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border transition-all ${currentQuantity > 0 ? 'border-primary ring-1 ring-primary shadow-md' : 'border-gray-100'}`}
        >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Image */}
                <motion.div
                    animate={isAnimating ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-full sm:w-24 h-48 sm:h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer"
                >
                    {/* Main Image */}
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${product.sizeComparisonImage ? 'group-hover:opacity-0' : ''}`}
                        />
                    ) : (
                        <span className="text-xs text-gray-400">Img</span>
                    )}

                    {/* Size Comparison Image Toggle */}
                    {product.sizeComparisonImage && (
                        <img
                            src={product.sizeComparisonImage}
                            alt="Size comparison"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                    )}

                    {/* Zoom Hint Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 rounded-full p-1.5 shadow-sm text-gray-600 scale-75 group-hover:scale-100 transition-transform duration-300">
                            <ZoomIn size={16} />
                        </div>
                    </div>

                    {/* Click Handler Overlay */}
                    <div
                        className="absolute inset-0 z-10"
                        onClick={() => onImageClick && onImageClick(product.sizeComparisonImage || product.image)}
                    />
                </motion.div>

                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{product.tagline}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="font-bold text-primary text-xl">${activeSize?.price}</span>
                            </div>
                        </div>
                    </div>

                    {/* Size Selector - Large First */}
                    {product.sizes && product.sizes.length > 1 && (
                        <div className="flex bg-gray-100 p-1 rounded-lg w-max mb-4">
                            {/* Reorder sizes to show Large first */}
                            {[...product.sizes].sort((a, b) => {
                                const aIsLarge = a.name === 'Large' || a.id === 'lrg';
                                const bIsLarge = b.name === 'Large' || b.id === 'lrg';
                                if (aIsLarge && !bIsLarge) return -1;
                                if (!aIsLarge && bIsLarge) return 1;
                                return 0;
                            }).map(size => {
                                const stock = size.sku ? getStockLevel(stockMap, size.sku) : 0;
                                const isOOS = stock <= 0;
                                const isLarge = size.name === 'Large' || size.id === 'lrg';

                                return (
                                    <button
                                        key={size.id}
                                        onClick={() => !isOOS && handleSizeChange(size.id)}
                                        disabled={isOOS}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 
                                        ${activeSizeId === size.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                        ${isOOS ? 'opacity-50 cursor-not-allowed bg-gray-200/50' : ''}
                                        ${isLarge && DEALS.mixAndMatch.active ? 'ring-1 ring-amber-300' : ''}
                                    `}
                                    >
                                        {size.name}
                                        {isLarge && DEALS.mixAndMatch.active && (
                                            <span className="text-[8px] uppercase tracking-wide text-amber-600 font-bold">Deal</span>
                                        )}
                                        {isOOS ? (
                                            <span className="text-[9px] uppercase tracking-wide text-red-500 font-extrabold">(Sold Out)</span>
                                        ) : (
                                            stock > 0 && stock <= 10 && (
                                                <span className="text-[9px] uppercase tracking-wide text-orange-500 font-bold ml-1 animate-pulse">
                                                    Only {stock} left!
                                                </span>
                                            )
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                        {isOutOfStock ? (
                            <div className="px-4 py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg border border-gray-200">
                                Temporarily Sold Out
                            </div>
                        ) : (
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => updateQuantity(product.id, activeSizeId, -1)}
                                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-bold text-gray-900">{currentQuantity}</span>
                                <button
                                    onClick={() => updateQuantity(product.id, activeSizeId, 1)}
                                    disabled={currentQuantity >= currentStock}
                                    className={`p-2 rounded-r-lg transition-colors ${currentQuantity >= currentStock ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'}`}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Order = () => {
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('product');
    const initialBundle = searchParams.get('bundle');

    // State tracks quantities by "productId_sizeId" keys
    const [quantities, setQuantities] = useState({});
    const [stockMap, setStockMap] = useState(new Map());

    useEffect(() => {
        const loadStock = async () => {
            const map = await fetchStockData();
            setStockMap(map);
        };
        loadStock();

        const sub = subscribeToStockUpdates((newMap) => {
            setStockMap(newMap);
        });

        return () => sub.unsubscribe();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [isPickup, setIsPickup] = useState(true);
    const [status, setStatus] = useState('idle');
    const [selectedImage, setSelectedImage] = useState(null);
    const [orderCode, setOrderCode] = useState(null);
    const [addressValid, setAddressValid] = useState(true);

    // Effect to handle URL parameters - needs stockMap to be loaded first for smart size selection
    const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

    useEffect(() => {
        // Only process URL params once stockMap is loaded (or if no product param)
        if (urlParamsProcessed) return;

        // Handle product URL parameter - wait for stock data
        if (initialProductId) {
            // Wait for stockMap to load before selecting size
            if (stockMap.size === 0) return; // Stock not loaded yet

            const product = products.find(p => p.id === initialProductId);
            if (product && product.sizes?.length > 0) {
                // Smart size selection: prefer Large if in stock, otherwise first available
                let defaultSizeId = product.sizes[0].id;

                // Try to find Large size first
                const largeSize = product.sizes.find(s => s.name === 'Large' || s.id === 'lrg');
                if (largeSize) {
                    const largeStock = getStockLevel(stockMap, largeSize.sku);
                    if (largeStock > 0) {
                        defaultSizeId = largeSize.id;
                    } else {
                        // Large is out of stock, find first available size
                        const availableSize = product.sizes.find(s => {
                            if (!s.sku) return true;
                            return getStockLevel(stockMap, s.sku) > 0;
                        });
                        if (availableSize) {
                            defaultSizeId = availableSize.id;
                        }
                    }
                } else {
                    // No Large size, find first available
                    const availableSize = product.sizes.find(s => {
                        if (!s.sku) return true;
                        return getStockLevel(stockMap, s.sku) > 0;
                    });
                    if (availableSize) {
                        defaultSizeId = availableSize.id;
                    }
                }

                // Only add if the selected size has stock
                const selectedSize = product.sizes.find(s => s.id === defaultSizeId);
                const selectedStock = selectedSize?.sku ? getStockLevel(stockMap, selectedSize.sku) : 0;
                if (selectedStock > 0) {
                    setQuantities(prev => ({ ...prev, [`${initialProductId}_${defaultSizeId}`]: 1 }));
                }
            }
            setUrlParamsProcessed(true);
        } else {
            // No product param, just mark as processed
            setUrlParamsProcessed(true);
        }

        // Handle bundle URL parameter
        if (initialBundle === 'full-collection' && isBundleAvailable(stockMap, getStockLevel)) {
            setQuantities(prev => ({ ...prev, 'full-collection-bundle_bundle': 1 }));
        }

        window.scrollTo(0, 0);
    }, [initialProductId, initialBundle, stockMap, urlParamsProcessed]);

    const updateQuantity = (productId, sizeId, delta) => {
        const key = `${productId}_${sizeId}`;
        setQuantities(prev => {
            const current = prev[key] || 0;
            const next = Math.max(0, current + delta);
            const newQuantities = { ...prev, [key]: next };
            // Optional: cleanup zero keys
            if (next === 0) delete newQuantities[key];
            return newQuantities;
        });
    };

    const calculateTotal = () => {
        let subtotal = 0;
        let bundleTotal = 0;

        Object.keys(quantities).forEach(key => {
            const count = quantities[key];

            // Handle bundle separately
            if (key === 'full-collection-bundle_bundle') {
                bundleTotal += DEALS.collectionBundle.salePrice * count;
                return;
            }

            const { size } = getProductAndSize(key);
            if (size) {
                subtotal += size.price * count;
            }
        });

        // Calculate Mix & Match discount
        const { savings: mixMatchSavings, dealSets, eligibleCount } = calculateMixMatchDiscount(quantities, getProductAndSize);

        // Apply discount to subtotal
        const discountedSubtotal = subtotal - mixMatchSavings;
        const totalBeforeDelivery = discountedSubtotal + bundleTotal;

        // Delivery fee calculation - FREE if total order (including bundles) >= $70
        let deliveryFee = 15;
        if (isPickup || totalBeforeDelivery >= 70) {
            deliveryFee = 0;
        }

        return {
            subtotal: subtotal + bundleTotal,
            mixMatchSavings,
            dealSets,
            eligibleCount,
            bundleTotal,
            deliveryFee,
            total: totalBeforeDelivery + deliveryFee
        };
    };

    const { subtotal, mixMatchSavings, dealSets, eligibleCount, bundleTotal, deliveryFee, total } = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (subtotal === 0) {
            alert("Please select at least one item.");
            return;
        }

        // Check address validity for delivery orders
        if (!isPickup && !addressValid) {
            alert("Please enter a valid address within our delivery area (Edmonton, St. Albert, or Sherwood Park).");
            return;
        }

        setStatus('submitting');

        // Generate Order Code
        const code = generateOrderCode(formData.name);
        setOrderCode(code);

        // Prepare order items
        const orderItems = [];

        Object.keys(quantities).forEach(key => {
            const count = quantities[key];
            if (count === 0) return;

            // Handle bundle item - create individual items for each component product
            if (key === 'full-collection-bundle_bundle') {
                // Add individual component items with proper names (for both display AND stock decrement)
                // These use the includedItems array which has SKU and name
                DEALS.collectionBundle.includedItems.forEach(item => {
                    orderItems.push({
                        sku: item.sku,
                        name: item.name,
                        quantity: count,
                        price: 10, // Each Large bag is $10
                        isBundle: true,
                        isBundleComponent: true,
                        bundleParent: DEALS.collectionBundle.sku
                    });
                });

                // Add a bundle indicator item at the end (for admin/display - not for stock)
                orderItems.push({
                    id: DEALS.collectionBundle.id,
                    sku: DEALS.collectionBundle.sku,
                    name: '📦 FULL COLLECTION BUNDLE',
                    size: 'Bundle',
                    weight: null,
                    price: DEALS.collectionBundle.salePrice,
                    quantity: count,
                    image: DEALS.collectionBundle.image,
                    isBundle: true,
                    isBundleDisplay: true // Flag for display purposes - not for stock
                });
                return;
            }

            const { product, size } = getProductAndSize(key);
            if (!product || !size) return;

            orderItems.push({
                id: product.id, // Original ID reference
                sku: size.sku,
                name: `${product.name} (${size.name})`, // Append size to name for clarity
                size: size.name,
                weight: size.weight,
                price: size.price,
                quantity: count,
                image: product.image
            });
        });

        // Filter items for different purposes
        const displayItems = orderItems.filter(item => !item.isBundleComponent);
        const stockItems = orderItems.filter(item => !item.isBundleDisplay);


        try {
            // 1. Place Order in Supabase (Transaction)
            const deliveryType = isPickup ? 'pickup' : 'delivery';
            const shippingAddress = isPickup ? null : formData.address;

            // Send ALL items to RPC - it will skip display items during stock decrement
            // but store them for admin/display purposes
            const { data, error: orderError } = await supabase.rpc('place_order', {
                order_items: orderItems, // All items including bundle display indicator
                customer_email: formData.email,
                customer_name: formData.name,
                customer_phone: formData.phone,
                payment_code: code,
                order_total: total,
                delivery_type: deliveryType,
                shipping_address: shippingAddress
            });

            if (orderError) throw orderError;

            // 2. Trigger "Placed" Email (Backend)
            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
            fetch(`${apiUrl}/api/emails/placed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    orderCode: code,
                    total,
                    subtotal,
                    deliveryFee,
                    deliveryType: isPickup ? 'pickup' : 'delivery',
                    items: displayItems // Use displayItems for customer-facing email (shows bundle, not components)
                })
            }).catch(err => console.error("Email trigger failed:", err));

            setStatus('success');
            window.scrollTo(0, 0);

        } catch (error) {
            console.error(error);
            if (error.message && error.message.includes('Insufficient stock')) {
                alert("Items out of stock! Please refresh.");
            } else {
                alert("Order failed: " + error.message);
            }
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen pt-32 pb-20 container mx-auto px-4 max-w-2xl text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[2rem] shadow-xl border border-gray-100"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Order Received!</h2>

                    {/* Payment Instructions */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-200 pb-2">Payment Instructions</h3>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                <span className="font-bold text-gray-900">TOTAL DUE:</span>
                                <span className="font-bold text-xl text-primary">${total}</span>
                            </div>

                            <p>
                                Please send an Interac e-Transfer to <span className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">candycruffs@gmail.com</span>
                            </p>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <p className="font-bold text-blue-900 mb-1">IMPORTANT:</p>
                                <p className="text-blue-800">
                                    You MUST include your Order Code <span className="font-mono font-bold text-lg bg-white px-2 py-0.5 rounded border border-blue-200 select-all">{orderCode}</span> in the e-Transfer message field.
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    Failure to do so may result in your order not being fulfilled.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-8 text-sm">
                        Thank you, {formData.name}! We've sent a confirmation email to <b>{formData.email}</b>.
                        We will process your order once payment is received.
                    </p>
                    <Button onClick={() => window.location.href = '/'}>Return Home</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        Order Request
                    </h1>
                    <p className="text-gray-600">Fill out the form below to request your treats.</p>
                </div>

                {/* Delivery/Pickup Toggle Banner */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isPickup ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isPickup ? <ShoppingBag size={24} /> : <Truck size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                    {isPickup ? 'Pickup Order' : 'Delivery Information'}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {isPickup
                                        ? 'Pickup in Millwoods, Edmonton. Exact location sent in confirmation email.'
                                        : 'Currently delivering to Edmonton, St. Albert & Sherwood Park within 3-7 business days.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setIsPickup(true)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pickup
                            </button>
                            <button
                                onClick={() => setIsPickup(false)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Delivery
                            </button>
                        </div>
                    </div>

                    {!isPickup && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <ul className="text-blue-600 text-sm space-y-1 list-disc list-inside">
                                <li>Free delivery on orders over $70</li>
                                <li>$15 delivery fee for orders under $70</li>
                                <li><strong>Delivery Area:</strong> Edmonton, St. Albert & Sherwood Park</li>
                                <li><strong>Estimated delivery:</strong> 3-7 business days</li>
                            </ul>
                            <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-100 p-3 rounded-lg">
                                <span className="text-lg">🌍</span>
                                <p className="text-sm text-purple-700">
                                    <strong>International Shipping Coming Soon!</strong> Canada & US nationwide delivery launching shortly.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* General Disclaimer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p><strong>Note:</strong> Orders are not confirmed until payment is received via e-Transfer.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Product Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Select Your Treats</h2>

                        {/* Bundle Card - Launch Week Deal */}
                        {DEALS.collectionBundle.active && (() => {
                            const bundleInStock = isBundleAvailable(stockMap, getStockLevel);

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 sm:p-6 rounded-2xl shadow-lg border-2 transition-all ${!bundleInStock
                                        ? 'border-gray-300 opacity-75'
                                        : quantities['full-collection-bundle_bundle'] > 0
                                            ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-100'
                                            : 'border-amber-200/70'
                                        }`}
                                >
                                    {/* Deal Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        {bundleInStock ? (
                                            <>
                                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                                    <Sparkles size={12} />
                                                    LAUNCH WEEK DEAL
                                                </span>
                                                <span className="text-amber-600 text-xs font-bold">Save ${DEALS.collectionBundle.savings}!</span>
                                            </>
                                        ) : (
                                            <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                                                <AlertCircle size={12} />
                                                SOLD OUT
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Image */}
                                        <div className={`w-full sm:w-40 h-56 sm:h-40 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer ${!bundleInStock && 'grayscale opacity-60'}`}>
                                            <img
                                                src={DEALS.collectionBundle.image}
                                                alt={DEALS.collectionBundle.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                            {/* Zoom Hint Overlay */}
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white/90 rounded-full p-1.5 shadow-sm text-gray-600 scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <ZoomIn size={16} />
                                                </div>
                                            </div>
                                            {/* Click Handler Overlay */}
                                            <div
                                                className="absolute inset-0 z-10"
                                                onClick={() => setSelectedImage(DEALS.collectionBundle.image)}
                                            />
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Package size={18} className={bundleInStock ? 'text-amber-500' : 'text-gray-400'} />
                                                        <h3 className="font-bold text-gray-900 text-lg">{DEALS.collectionBundle.name}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{DEALS.collectionBundle.tagline}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <span className="text-gray-400 line-through text-sm">${DEALS.collectionBundle.originalPrice}</span>
                                                        <span className={`font-bold text-2xl ${bundleInStock ? 'text-amber-600' : 'text-gray-500'}`}>${DEALS.collectionBundle.salePrice}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-500 mb-4">
                                                Includes: Shark Bite Crunch, Neon Worm Crisps, Crystal Bear Bites, Cola Fizz Crunch & Prism Pops
                                            </p>

                                            {/* Quantity Controls or Sold Out */}
                                            {bundleInStock ? (() => {
                                                const maxBundles = getMaxBundleQuantity(stockMap, getStockLevel);
                                                const currentBundleQty = quantities['full-collection-bundle_bundle'] || 0;
                                                const isAtMax = currentBundleQty >= maxBundles;

                                                return (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center bg-amber-50 rounded-lg border border-amber-200">
                                                                <button
                                                                    onClick={() => {
                                                                        const key = 'full-collection-bundle_bundle';
                                                                        setQuantities(prev => {
                                                                            const current = prev[key] || 0;
                                                                            const next = Math.max(0, current - 1);
                                                                            const newQuantities = { ...prev, [key]: next };
                                                                            if (next === 0) delete newQuantities[key];
                                                                            return newQuantities;
                                                                        });
                                                                    }}
                                                                    className="p-2 hover:bg-amber-100 text-amber-700 rounded-l-lg transition-colors"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="w-8 text-center font-bold text-gray-900">
                                                                    {currentBundleQty}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        const key = 'full-collection-bundle_bundle';
                                                                        setQuantities(prev => ({
                                                                            ...prev,
                                                                            [key]: (prev[key] || 0) + 1
                                                                        }));
                                                                    }}
                                                                    disabled={isAtMax}
                                                                    className={`p-2 rounded-r-lg transition-colors ${isAtMax ? 'text-amber-300 cursor-not-allowed' : 'hover:bg-amber-100 text-amber-700'}`}
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                            {currentBundleQty > 0 && (
                                                                <span className="text-sm text-amber-600 font-medium">
                                                                    Added to cart!
                                                                </span>
                                                            )}
                                                        </div>
                                                        {maxBundles > 0 && maxBundles <= 10 && (
                                                            <span className="text-[10px] uppercase tracking-wide text-orange-500 font-bold animate-pulse">
                                                                Only {maxBundles} bundle{maxBundles !== 1 ? 's' : ''} available!
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })() : (
                                                <div className="bg-gray-100 text-gray-500 text-sm font-bold px-4 py-2 rounded-lg inline-block">
                                                    Currently Unavailable
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })()}
                        {/* Mix & Match Info Banner */}
                        {DEALS.mixAndMatch.active && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                <div>
                                    <p className="text-emerald-800 font-medium text-sm">
                                        <span className="font-bold">3-for-$27 Deal:</span> Any 3 Large bags or Prism Pops ($10 items) — save $3 automatically!
                                    </p>
                                    <p className="text-emerald-600 text-xs">Stacks with multiple sets • {eligibleCount > 0 ? `${eligibleCount} eligible item(s) selected` : 'Add $10 bags below'}</p>
                                </div>
                            </div>
                        )}

                        {
                            products.map(product => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                    quantities={quantities}
                                    updateQuantity={updateQuantity}
                                    onImageClick={(img) => setSelectedImage(img)}
                                    stockMap={stockMap}
                                />
                            ))
                        }
                    </div>

                    {/* Right Column: Order Summary & Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                {Object.keys(quantities).map(key => {
                                    const count = quantities[key];
                                    if (count === 0) return null;

                                    // Handle bundle item separately
                                    if (key === 'full-collection-bundle_bundle') {
                                        return (
                                            <div key={key} className="flex justify-between text-sm items-start bg-amber-50/50 -mx-2 px-2 py-2 rounded-lg">
                                                <span className="text-amber-800">
                                                    <span className="flex items-center gap-1.5">
                                                        <Package size={14} className="text-amber-500" />
                                                        {DEALS.collectionBundle.name}
                                                    </span>
                                                    <span className="text-amber-600/70 ml-1 block text-xs">
                                                        ${DEALS.collectionBundle.salePrice} x {count}
                                                    </span>
                                                </span>
                                                <span className="font-medium text-amber-800">${DEALS.collectionBundle.salePrice * count}</span>
                                            </div>
                                        );
                                    }

                                    const { product, size } = getProductAndSize(key);
                                    if (!product || !size) return null;

                                    return (
                                        <div key={key} className="flex justify-between text-sm items-start">
                                            <span className="text-gray-600">
                                                {product.name} <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{size.name}</span>
                                                <span className="text-gray-400 ml-1 block text-xs">
                                                    ${size.price} x {count}
                                                </span>
                                            </span>
                                            <span className="font-medium text-gray-900">${size.price * count}</span>
                                        </div>
                                    );
                                })}
                                {subtotal === 0 && <p className="text-sm text-gray-400 italic">No items selected</p>}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">${subtotal}</span>
                                </div>
                                {mixMatchSavings > 0 && (
                                    <div className="flex justify-between text-sm items-center bg-green-50 -mx-2 px-2 py-1.5 rounded-lg">
                                        <span className="text-green-700 font-medium flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-green-500" />
                                            Launch Week Deal Applied
                                        </span>
                                        <span className="font-bold text-green-600">-${mixMatchSavings}</span>
                                    </div>
                                )}
                                {!isPickup && (
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-gray-600">Delivery Fee</span>
                                        <div className="text-right">
                                            {subtotal >= 70 ? (
                                                <>
                                                    <span className="text-gray-400 line-through mr-2 text-xs">$15</span>
                                                    <span className="font-bold text-green-500">FREE</span>
                                                </>
                                            ) : (
                                                <span className="font-medium text-gray-900">$15</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 mt-2">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary">${total}</span>
                                </div>

                                {/* Total Savings Display */}
                                {mixMatchSavings > 0 && (
                                    <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Sparkles size={16} className="text-green-500" />
                                            <span className="text-green-800 font-bold">
                                                You're saving ${mixMatchSavings}!
                                            </span>
                                            <Sparkles size={16} className="text-green-500" />
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">with Launch Week deals</p>
                                    </div>
                                )}

                                {/* Mobile Toggle for Pickup/Delivery */}
                                <div className="pt-4 border-t border-gray-100 lg:hidden">
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setIsPickup(true)}
                                            className={`px-4 py-2 w-1/2 rounded-lg text-sm font-bold transition-all ${isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Pickup
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPickup(false)}
                                            className={`px-4 py-2 w-1/2 rounded-lg text-sm font-bold transition-all ${!isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Delivery
                                        </button>
                                    </div>

                                    {/* Same info as top banner */}
                                    <div className="mt-3 flex items-center gap-3 text-xs">
                                        <div className={`p-2 rounded-full shrink-0 ${isPickup ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {isPickup ? <ShoppingBag size={16} /> : <Truck size={16} />}
                                        </div>
                                        <p className="text-gray-600">
                                            {isPickup
                                                ? 'Pickup in Millwoods, Edmonton. Exact location sent in confirmation email.'
                                                : 'Currently delivering to Edmonton, St. Albert & Sherwood Park within 3-7 business days.'}
                                        </p>
                                    </div>

                                    {!isPickup && (
                                        <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <ul className="text-blue-700 text-xs space-y-1 list-disc list-inside">
                                                <li>Free delivery on orders over $70</li>
                                                <li>$15 delivery fee for orders under $70</li>
                                                <li><strong>Delivery Area:</strong> Edmonton, St. Albert & Sherwood Park</li>
                                                <li><strong>Estimated delivery:</strong> 3-7 business days</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="First & Last Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="(555) 555-5555"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                {!isPickup && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                                        <AddressAutocomplete
                                            required={!isPickup}
                                            value={formData.address}
                                            onChange={(val) => setFormData({ ...formData, address: val })}
                                            onValidationChange={(isValid) => setAddressValid(isValid)}
                                        />
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Additional Notes (Optional)</label>
                                    <textarea
                                        rows="2"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                        placeholder="Any special requests or details?"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-2">
                                    By submitting, you agree to send an <strong>e-Transfer</strong> to complete your order. Unpaid orders are cancelled after 1 hour.
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    disabled={status === 'submitting'}
                                >
                                    {status === 'submitting' ? 'Submitting...' : 'Submit Order Request'}
                                </Button>

                                {status === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm"
                                    >
                                        <AlertCircle size={20} />
                                        <p>Something went wrong. Please try again or contact us directly.</p>
                                    </motion.div>
                                )}

                                {isPickup && (
                                    <p className="text-xs text-center text-gray-500 mt-4 font-medium">
                                        Pickup Window: <span className="text-gray-900 font-bold">9 AM - 8 PM</span> daily. Have your Order # ready!
                                    </p>
                                )}
                                {!isPickup && (
                                    <p className="text-xs text-center text-gray-500 mt-4">
                                        Delivery will be confirmed via email/text after payment.
                                    </p>
                                )}
                            </form>
                        </div>
                    </div >
                </div >

                {/* Parties & Weddings Section */}
                < div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-[2rem] border border-purple-100 mt-12 text-center relative overflow-hidden" >
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-500">
                            <PartyPopper size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Parties & Weddings</h3>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            Planning a special event? We offer custom bulk orders and party favors to make your celebration extra sweet.
                        </p>
                        <Button onClick={() => window.location.href = '/contact'} className="bg-white text-purple-600 hover:bg-purple-50 border border-purple-200">
                            Contact Us
                        </Button>
                    </div>
                </div >
            </div >

            <ProductImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                image={selectedImage}
            />
        </div >
    );
};

export default Order;
