import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import { Plus, Minus, ShoppingBag, Truck, CheckCircle, AlertCircle, PartyPopper } from 'lucide-react';

const Order = () => {
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('product');

    const [quantities, setQuantities] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [isPickup, setIsPickup] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    useEffect(() => {
        // Initialize quantities if product ID passed in URL
        if (initialProductId) {
            setQuantities(prev => ({ ...prev, [initialProductId]: 1 }));
        }
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, [initialProductId]);

    const updateQuantity = (id, delta) => {
        setQuantities(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [id]: next };
        });
    };

    const calculateTotal = () => {
        const subtotal = products.reduce((sum, product) => {
            return sum + (product.price * (quantities[product.id] || 0));
        }, 0);

        let deliveryFee = 10;
        if (isPickup || subtotal >= 50) {
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

        const orderItems = products
            .filter(p => quantities[p.id] > 0)
            .map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: quantities[p.id]
            }));

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    items: orderItems,
                    subtotal,
                    deliveryFee,
                    total,
                    isPickup
                })
            });

            if (response.ok) {
                setStatus('success');
                window.scrollTo(0, 0);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
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
                    <p className="text-gray-600 mb-8">
                        Thank you, {formData.name}! We've received your order request.
                        We will contact you shortly via email/text to confirm {isPickup ? 'pickup' : 'delivery'} details and arrange payment.
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
                                <li>Free delivery on orders over $50</li>
                                <li>$10 delivery fee for orders under $50</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Product Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Select Your Treats</h2>

                        {products.map(product => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border transition-all ${quantities[product.id] > 0 ? 'border-primary ring-1 ring-primary shadow-md' : 'border-gray-100'}`}
                            >
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400">Img</span>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                                            <span className="font-bold text-primary">${product.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">{product.tagline}</p>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                <button
                                                    onClick={() => updateQuantity(product.id, -1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-gray-900">{quantities[product.id] || 0}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

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

                    {/* Right Column: Order Summary & Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

                            <div className="space-y-3 mb-6">
                                {products.map(product => {
                                    const qty = quantities[product.id] || 0;
                                    if (qty === 0) return null;
                                    return (
                                        <div key={product.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{product.name} x{qty}</span>
                                            <span className="font-medium text-gray-900">${product.price * qty}</span>
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
                                        ) : subtotal >= 50 ? (
                                            <>
                                                <span className="text-gray-400 line-through mr-2 text-xs">$10</span>
                                                <span className="font-bold text-green-500">FREE</span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-gray-900">$10</span>
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
                                        <textarea
                                            required={!isPickup}
                                            rows="3"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
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

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Payment & {isPickup ? 'pickup' : 'delivery'} will be confirmed via email/text after submission.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Order;
