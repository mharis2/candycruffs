import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import { Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, PartyPopper, Info, ZoomIn } from 'lucide-react';
import AddressAutocomplete from '../components/AddressAutocomplete';
import ProductImageModal from '../components/ui/ProductImageModal';
import { fetchStockData, getStockLevel, subscribeToStockUpdates } from '../utils/inventoryService';
import { supabase } from '../utils/supabaseClient';
import { generateOrderCode } from '../utils/orderUtils';

// Helper: Get product and size from a unique key "productId_sizeId"
const getProductAndSize = (key) => {
    const [productId, sizeId] = key.split('_');
    const product = products.find(p => p.id === productId);
    const size = product?.sizes?.find(s => s.id === sizeId);
    return { product, size };
};

const ProductItem = ({ product, quantities, updateQuantity, onImageClick, stockMap }) => {
    // Determine the first available size, or default to first if all OOS
    const [activeSizeId, setActiveSizeId] = useState(() => {
        const availableSize = product.sizes?.find(s => {
            // If no SKU (e.g. data error), assume in stock? Or if no map loaded yet.
            // Best logic: if map is loaded and qty <= 0, skip.
            if (!s.sku) return true;
            // If stockMap is empty/loading, perhaps assume in stock? 
            // Let's assume stockMap is passed. If empty, maybe everything is effectively available or unavailable.
            // Requirement: "default to Out of Stock depending on safety".
            // Let's check specific SKU.
            return getStockLevel(stockMap, s.sku) > 0;
        });
        return availableSize ? availableSize.id : (product.sizes?.[0]?.id || 'reg');
    });

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
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
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

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 1 && (
                        <div className="flex bg-gray-100 p-1 rounded-lg w-max mb-4">
                            {product.sizes.map(size => {
                                const stock = size.sku ? getStockLevel(stockMap, size.sku) : 0;
                                const isOOS = stock <= 0;

                                return (
                                    <button
                                        key={size.id}
                                        onClick={() => !isOOS && handleSizeChange(size.id)}
                                        disabled={isOOS}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 
                                        ${activeSizeId === size.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                                        ${isOOS ? 'opacity-50 cursor-not-allowed bg-gray-200/50' : ''}
                                    `}
                                    >
                                        {size.name}
                                        {isOOS ? (
                                            <span className="text-[9px] uppercase tracking-wide text-red-500 font-extrabold">(Sold Out)</span>
                                        ) : (
                                            stock > 0 && stock <= 15 && (
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
    const [isPickup, setIsPickup] = useState(false);
    const [status, setStatus] = useState('idle');
    const [selectedImage, setSelectedImage] = useState(null);
    const [orderCode, setOrderCode] = useState(null);

    useEffect(() => {
        if (initialProductId) {
            const product = products.find(p => p.id === initialProductId);
            if (product && product.sizes?.length > 0) {
                // Select first size by default
                const defaultSizeId = product.sizes[0].id;
                setQuantities(prev => ({ ...prev, [`${initialProductId}_${defaultSizeId}`]: 1 }));
            }
        }
        window.scrollTo(0, 0);
    }, [initialProductId]);

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
        Object.keys(quantities).forEach(key => {
            const count = quantities[key];
            const { size } = getProductAndSize(key);
            if (size) {
                subtotal += size.price * count;
            }
        });

        let deliveryFee = 15;
        if (isPickup || subtotal >= 70) {
            deliveryFee = 0;
        }

        return { subtotal, deliveryFee, total: subtotal + deliveryFee };
    };

    const { subtotal, deliveryFee, total } = calculateTotal();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (subtotal === 0) {
            alert("Please select at least one item.");
            return;
        }

        setStatus('submitting');

        // Generate Order Code
        const code = generateOrderCode(formData.name);
        setOrderCode(code);

        // Prepare order items
        const orderItems = Object.keys(quantities).map(key => {
            const { product, size } = getProductAndSize(key);
            const count = quantities[key];
            if (!product || !size || count === 0) return null;

            return {
                id: product.id, // Original ID reference
                sku: size.sku,
                name: `${product.name} (${size.name})`, // Append size to name for clarity
                size: size.name,
                weight: size.weight,
                price: size.price,
                quantity: count,
                image: product.image
            };
        }).filter(Boolean);

        try {
            // 1. Place Order in Supabase (Transaction)
            const { data, error: orderError } = await supabase.rpc('place_order', {
                order_items: orderItems,
                customer_email: formData.email,
                payment_code: code,
                order_total: total
            });

            if (orderError) throw orderError;

            // 2. Trigger "Placed" Email (Backend)
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            fetch(`${apiUrl}/api/emails/placed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    orderCode: code,
                    total,
                    items: orderItems
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
                                        ? 'Pickup in Millwoods, Edmonton. Exact location sent after order.'
                                        : 'Currently delivering to Edmonton, AB only.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setIsPickup(false)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setIsPickup(true)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isPickup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pickup
                            </button>
                        </div>
                    </div>

                    {!isPickup && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <ul className="text-blue-600 text-sm space-y-1 list-disc list-inside">
                                <li>Free delivery on orders over $70</li>
                                <li>$15 delivery fee for orders under $70</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Product Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Select Your Treats</h2>

                        {products.map(product => (
                            <ProductItem
                                key={product.id}
                                product={product}
                                quantities={quantities}
                                updateQuantity={updateQuantity}
                                onImageClick={(img) => setSelectedImage(img)}
                                stockMap={stockMap}
                            />
                        ))}
                    </div>

                    {/* Right Column: Order Summary & Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                {Object.keys(quantities).map(key => {
                                    const count = quantities[key];
                                    if (count === 0) return null;
                                    const { product, size } = getProductAndSize(key);
                                    if (!product || !size) return null;

                                    return (
                                        <div key={key} className="flex justify-between text-sm items-start">
                                            <span className="text-gray-600">
                                                {product.name} <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">{size.name}</span>
                                                <span className="text-gray-400 ml-1">x{count}</span>
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
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <div className="text-right">
                                        {isPickup ? (
                                            <span className="font-bold text-green-500">FREE</span>
                                        ) : subtotal >= 70 ? (
                                            <>
                                                <span className="text-gray-400 line-through mr-2 text-xs">$15</span>
                                                <span className="font-bold text-green-500">FREE</span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-gray-900">$15</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100 mt-2">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary">${total}</span>
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Payment & {isPickup ? 'pickup' : 'delivery'} will be confirmed via email/text after submission.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Parties & Weddings Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-[2rem] border border-purple-100 mt-12 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-purple-500">
                            <PartyPopper size={24} />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Parties & Weddings</h3>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            Planning a special event? We offer custom bulk orders and party favors to make your celebration extra sweet.
                        </p>
                        <span className="inline-block bg-white px-4 py-2 rounded-full text-xs font-bold tracking-wider text-purple-600 shadow-sm border border-purple-100">
                            COMING SOON
                        </span>
                    </div>
                </div>
            </div>

            <ProductImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                image={selectedImage}
            />
        </div>
    );
};

export default Order;
