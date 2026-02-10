import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/ui/Button';
import { Package, ShoppingBag, Plus, Minus, RefreshCw, Archive, CheckCircle, AlertTriangle, BarChart3, TrendingUp, DollarSign, Users, Truck, MapPin, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { products as productCatalog } from '../data/products';

// Helper to get product image from SKU
const getProductImage = (sku) => {
    for (const product of productCatalog) {
        if (product.sizes?.some(s => s.sku === sku)) {
            return product.image;
        }
    }
    return null;
};

// Helper to get product name from SKU (without size suffix)
const getProductBaseName = (sku) => {
    for (const product of productCatalog) {
        if (product.sizes?.some(s => s.sku === sku)) {
            return product.name;
        }
    }
    return null;
};

const Admin = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'fulfillment' | 'analytics'
    const [analyticsOrders, setAnalyticsOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [fulfillmentOrders, setFulfillmentOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState('');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (authorized) {
            refreshData();
        }
    }, [authorized, activeTab]);

    const refreshData = () => {
        if (activeTab === 'orders') fetchOrders();
        else if (activeTab === 'fulfillment') fetchFulfillment();
        else if (activeTab === 'analytics') fetchAnalytics();
        else fetchInventory();
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['paid', 'fulfilled'])
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching analytics:', error);
        else setAnalyticsOrders(data || []);
        setLoading(false);
    };

    // --- Analytics Computations ---
    const analytics = useMemo(() => {
        if (analyticsOrders.length === 0) return null;

        // Total Revenue
        const totalRevenue = analyticsOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const totalOrders = analyticsOrders.length;
        const avgOrderValue = totalRevenue / totalOrders;
        const totalItems = analyticsOrders.reduce((sum, o) =>
            sum + (o.items?.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0) || 0), 0);

        // Product Popularity
        const productCounts = {};
        analyticsOrders.forEach(order => {
            order.items?.forEach(item => {
                const name = item.name || item.sku;
                productCounts[name] = (productCounts[name] || 0) + (parseInt(item.quantity) || 0);
            });
        });
        const productData = Object.entries(productCounts)
            .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, fullName: name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Delivery vs Pickup
        const deliveryCount = analyticsOrders.filter(o => o.delivery_type === 'delivery').length;
        const pickupCount = analyticsOrders.filter(o => o.delivery_type === 'pickup').length;
        const deliveryData = [
            { name: 'Delivery', value: deliveryCount, color: '#3b82f6' },
            { name: 'Pickup', value: pickupCount, color: '#10b981' }
        ];

        // Orders Over Time (group by date)
        const ordersByDate = {};
        analyticsOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ordersByDate[date] = (ordersByDate[date] || 0) + 1;
        });
        const timeData = Object.entries(ordersByDate)
            .map(([date, orders]) => ({ date, orders }))
            .slice(-14); // Last 14 days

        // Revenue Over Time
        const revenueByDate = {};
        analyticsOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total || 0);
        });
        const revenueData = Object.entries(revenueByDate)
            .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
            .slice(-14);

        // Insights
        const bestSeller = productData[0]?.fullName || 'N/A';
        const preferredMethod = deliveryCount > pickupCount ? 'Delivery' : 'Pickup';
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        analyticsOrders.forEach(order => {
            const day = new Date(order.created_at).getDay();
            dayCounts[day]++;
        });
        const peakDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
        const peakDay = dayNames[peakDayIndex];

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            totalItems,
            productData,
            deliveryData,
            timeData,
            revenueData,
            bestSeller,
            preferredMethod,
            peakDay,
            deliveryPercent: Math.round((deliveryCount / totalOrders) * 100),
            pickupPercent: Math.round((pickupCount / totalOrders) * 100)
        };
    }, [analyticsOrders]);

    const fetchOrders = async () => {
        setLoading(true);
        // Fetch ALL orders that are NOT paid/fulfilled - admins need to see cancelled/expired to manually manage
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .not('status', 'in', '("paid","fulfilled")')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoading(false);
    };

    const fetchFulfillment = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['paid', 'fulfilled'])
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching fulfillment:', error);
        else setFulfillmentOrders(data || []);
        setLoading(false);
    };

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) console.error('Error fetching inventory:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        if (password === adminPassword) setAuthorized(true);
        else alert('Incorrect password');
    };

    // --- Order Actions ---

    const sendEmailTrigger = async (endpoint, payload) => {
        try {
            await fetch(`${apiUrl}/api/emails/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error('Email trigger failed:', e);
        }
    };

    const confirmPaid = async (order) => {
        const wasCancelledOrExpired = order.status === 'cancelled' || order.status === 'expired';

        let confirmMessage = `Mark order ${order.order_code} as PAID?`;
        if (wasCancelledOrExpired) {
            confirmMessage += `\n\nNote: This order was ${order.status}. Stock will be decremented again for the items.`;
        }

        if (!window.confirm(confirmMessage)) return;

        // If order was cancelled/expired, we need to re-decrement stock
        if (wasCancelledOrExpired && order.items) {
            for (const item of order.items) {
                // Skip bundle display items (they don't have real stock)
                if (item.isBundleDisplay) continue;

                const sku = item.sku;
                const qty = parseInt(item.quantity) || 0;

                if (sku && qty > 0) {
                    // Get current stock
                    const { data: product, error: fetchError } = await supabase
                        .from('products')
                        .select('stock_qty')
                        .eq('sku', sku)
                        .single();

                    if (fetchError) {
                        alert(`Error fetching stock for ${sku}: ${fetchError.message}`);
                        return;
                    }

                    const newQty = Math.max(0, (product?.stock_qty || 0) - qty);

                    const { error: updateError } = await supabase
                        .from('products')
                        .update({ stock_qty: newQty })
                        .eq('sku', sku);

                    if (updateError) {
                        alert(`Error updating stock for ${sku}: ${updateError.message}`);
                        return;
                    }
                }
            }
        }

        // Update status to paid
        const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);

        if (error) {
            alert('Error updating: ' + error.message);
        } else {
            // Send Email
            await sendEmailTrigger('paid', {
                email: order.customer_email,
                name: order.customer_name || 'Customer',
                orderCode: order.order_code,
                deliveryType: order.delivery_type
            });
            fetchOrders();
        }
    };

    const markFulfilled = async (order) => {
        if (!window.confirm(`Mark order ${order.order_code} as FULFILLED (picked up/shipped)?`)) return;

        const { error } = await supabase.from('orders').update({ status: 'fulfilled' }).eq('id', order.id);
        if (error) {
            alert('Error updating: ' + error.message);
        } else {
            // New: Send Email
            await sendEmailTrigger('fulfilled', {
                email: order.customer_email,
                name: order.customer_name || 'Customer',
                orderCode: order.order_code,
                deliveryType: order.delivery_type
            });
            fetchFulfillment();
        }
    };

    const releaseStock = async (order) => {
        if (!window.confirm(`CANCEL ${order.order_code} and release stock?`)) return;

        // 1. Call RPC
        const { error } = await supabase.rpc('admin_release_stock', { target_order_id: order.id });

        if (error) {
            alert('Error releasing stock: ' + error.message);
        } else {
            // 2. Send Cancellation Email
            await sendEmailTrigger('cancelled', {
                email: order.customer_email,
                name: order.customer_name || 'Customer',
                orderCode: order.order_code,
                reason: 'Payment not received.'
            });
            fetchOrders();
        }
    };

    const deleteOrder = async (orderId, onSuccess = fetchFulfillment) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this order? This cannot be undone.")) return;

        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            onSuccess();
        }
    };

    // Delete order from pending tab - sends cancellation email first
    const deleteOrderWithEmail = async (order) => {
        if (!window.confirm(`Delete order ${order.order_code} and notify customer? This cannot be undone.`)) return;

        // Send cancellation email first
        await sendEmailTrigger('cancelled', {
            email: order.customer_email,
            name: order.customer_name || 'Customer',
            orderCode: order.order_code,
            reason: 'Order has been removed from our system.'
        });

        // Then delete the order
        const { error } = await supabase.from('orders').delete().eq('id', order.id);
        if (error) {
            alert("Error deleting: " + error.message);
        } else {
            fetchOrders();
        }
    };

    // Prepare History Stats/Delete
    const renderHistory = () => {
        return fulfillmentOrders.filter(o => o.status === 'fulfilled').map(order => {
            const itemCount = order.items.reduce((acc, i) => acc + (parseInt(i.quantity) || 0), 0);
            return (
                <div key={order.id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-700">{order.order_code}</span>
                            <span className="text-gray-400 font-normal text-sm">- {order.customer_name || 'No Name'}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono mb-1">{order.customer_email}</div>
                        <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle size={12} /> Fulfilled
                        </div>
                        {/* Stats Summary */}
                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            <span className="font-bold">{itemCount} items</span> • Total: <span className="font-bold text-gray-900">${order.total}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 max-w-xs truncate">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 text-xs h-auto"
                            onClick={() => deleteOrder(order.id)}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            )
        });
    };

    // --- Inventory Actions ---

    const updateStock = async (sku, delta) => {
        // Find current stock from local state
        const currentProduct = products.find(p => p.sku === sku);
        if (!currentProduct) {
            alert('Product not found');
            return;
        }

        const newQty = Math.max(0, currentProduct.stock_qty + delta);

        // Optimistic UI update — immediately update local state
        setProducts(prev => prev.map(p =>
            p.sku === sku ? { ...p, stock_qty: newQty } : p
        ));

        // Persist to database
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_qty: newQty })
            .eq('sku', sku);

        if (updateError) {
            // Revert optimistic update on failure
            setProducts(prev => prev.map(p =>
                p.sku === sku ? { ...p, stock_qty: currentProduct.stock_qty } : p
            ));
            alert('Error updating stock');
        }
    };

    if (!authorized) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50 px-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Admin Access</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                    <Button type="submit" className="w-full">Unlock Dashboard</Button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50 px-4 sm:px-6">
            <div className="container mx-auto max-w-5xl">

                {/* Header & Tabs */}
                <div className="flex flex-col gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Dashboard</h1>

                    {/* Mobile-friendly scrollable tabs */}
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 min-w-max sm:min-w-0">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <ShoppingBag size={16} className="hidden sm:block" />
                                Pending
                            </button>
                            <button
                                onClick={() => setActiveTab('fulfillment')}
                                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'fulfillment' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <CheckCircle size={16} className="hidden sm:block" />
                                Fulfill
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Package size={16} className="hidden sm:block" />
                                Stock
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BarChart3 size={16} className="hidden sm:block" />
                                Stats
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {loading && <div className="text-center py-12 text-gray-400">Loading orders...</div>}

                        {!loading && orders.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <CheckCircle className="mx-auto h-12 w-12 text-green-100 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
                                <p className="text-gray-500">No pending orders to process.</p>
                            </div>
                        )}

                        {orders.map(order => {
                            const isCancelled = order.status === 'cancelled' || order.status === 'expired';
                            const statusColor = isCancelled ? 'bg-red-400' : 'bg-yellow-400';
                            const statusBadge = isCancelled
                                ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{order.status}</span>
                                : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Awaiting Payment</span>;

                            return (
                                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 relative overflow-hidden group">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${statusColor}`} />

                                    <div className="flex-grow">
                                        <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {order.customer_name || 'Customer'}
                                                </h3>
                                                <p className="text-sm text-gray-600 font-medium">{order.customer_phone}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-0.5">{order.customer_email}</p>
                                                <p className="text-xs text-gray-400 font-mono mt-1">ID: {order.id}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-700">
                                                        {order.order_code}
                                                    </span>
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold">
                                                        ${order.total}
                                                    </span>
                                                </div>
                                                {statusBadge}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                            {order.items && order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-700">{item.quantity}x</span>
                                                        <span>{item.name || item.sku}</span>
                                                    </div>
                                                    <span className="text-gray-400 text-xs font-mono">{item.sku}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3">
                                            Ordered: {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 min-w-[180px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                                        <button
                                            onClick={() => confirmPaid(order)}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Mark Paid
                                        </button>
                                        {/* Show Cancel for pending_payment (releases stock), Delete for already cancelled/expired */}
                                        {order.status === 'pending_payment' ? (
                                            <button
                                                onClick={() => releaseStock(order)}
                                                className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                            >
                                                <Archive size={16} /> Cancel Order
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => deleteOrderWithEmail(order)}
                                                className="flex-1 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'fulfillment' && (
                    <div className="space-y-8">
                        {loading && <div className="text-center py-12 text-gray-400">Loading fulfillment data...</div>}

                        {/* Active Paid Orders - Top Section */}
                        {!loading && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                                    Ready to Fulfill (Paid)
                                </h2>

                                {fulfillmentOrders.filter(o => o.status === 'paid').length === 0 && (
                                    <p className="text-gray-400 text-sm italic ml-4">No active paid orders waiting.</p>
                                )}

                                {fulfillmentOrders.filter(o => o.status === 'paid').map(order => (
                                    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />

                                        <div className="flex-grow">
                                            <div className="flex flex-wrap justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{order.customer_name}</h3>
                                                <span className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold font-mono">
                                                    {order.order_code}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 mb-1">{order.customer_email}</div>
                                            <div className="text-sm text-gray-600 mb-4">{order.customer_phone}</div>

                                            <div className="bg-gray-50 rounded-lg p-3 space-y-1 mb-2">
                                                {order.items && order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span><strong>{item.quantity}x</strong> {item.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">
                                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                                    {order.delivery_type === 'pickup' ? '📍 PICKUP' : '🚚 DELIVERY'}
                                                </span>
                                                <span className="bg-green-50 text-green-600 px-2 py-1 rounded">PAID</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <button
                                                onClick={() => markFulfilled(order)}
                                                className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                                            >
                                                <CheckCircle size={20} />
                                                Mark Fulfilled
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}

                {!loading && activeTab === 'orders' && (
                    <div className="space-y-4 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-bold text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
                            Completed History
                        </h2>

                        <div className="opacity-60 hover:opacity-100 transition-opacity space-y-2">
                            {renderHistory()}
                            {fulfillmentOrders.filter(o => o.status === 'fulfilled').length === 0 && (
                                <p className="text-gray-400 text-sm italic ml-4">No completed orders yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Stock Management</h2>
                                <p className="text-xs sm:text-sm text-gray-500">Update inventory levels</p>
                            </div>
                            <button
                                onClick={fetchInventory}
                                className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors border border-blue-100"
                            >
                                <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>

                        {loading && <div className="text-center py-12 text-gray-400">Loading inventory...</div>}

                        {!loading && products.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Package className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No Products</h3>
                                <p className="text-gray-500">No products found in inventory.</p>
                            </div>
                        )}

                        {!loading && products.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {products.map(product => {
                                    const productImage = getProductImage(product.sku);
                                    const baseName = getProductBaseName(product.sku);
                                    const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
                                    const isSoldOut = product.stock_qty <= 0;

                                    return (
                                        <div key={product.sku} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isSoldOut ? 'border-red-200 bg-red-50/30' : isLowStock ? 'border-orange-200' : 'border-gray-100'
                                            }`}>
                                            <div className="flex">
                                                {/* Product Thumbnail */}
                                                <div className="w-24 h-24 bg-gray-50 flex items-center justify-center shrink-0 border-r border-gray-100">
                                                    {productImage ? (
                                                        <img
                                                            src={productImage}
                                                            alt={product.name}
                                                            className="w-20 h-20 object-contain"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-grow p-4 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{product.name}</h3>
                                                                {baseName && baseName !== product.name && (
                                                                    <p className="text-[10px] text-gray-400 mt-0.5">{baseName}</p>
                                                                )}
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${isSoldOut ? 'bg-red-100 text-red-700' :
                                                                isLowStock ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {isSoldOut ? 'SOLD OUT' : isLowStock ? 'LOW' : 'IN STOCK'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-mono mt-1 truncate" title={product.sku}>
                                                            {product.sku}
                                                        </p>
                                                    </div>

                                                    {/* Stock Controls */}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => updateStock(product.sku, -1)}
                                                                disabled={product.stock_qty <= 0}
                                                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                                title="Remove 1"
                                                            >
                                                                <Minus size={14} />
                                                            </button>

                                                            <div className={`w-14 h-8 flex items-center justify-center rounded-lg font-bold text-lg ${isSoldOut ? 'bg-red-100 text-red-700' :
                                                                isLowStock ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-gray-100 text-gray-900'
                                                                }`}>
                                                                {product.stock_qty}
                                                            </div>

                                                            <button
                                                                onClick={() => updateStock(product.sku, 1)}
                                                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-green-100 hover:text-green-600 text-gray-500 rounded-lg transition-colors"
                                                                title="Add 1"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        {/* Quick Add Buttons */}
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => updateStock(product.sku, 5)}
                                                                className="px-2 py-1 text-[10px] font-bold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                                                            >
                                                                +5
                                                            </button>
                                                            <button
                                                                onClick={() => updateStock(product.sku, 10)}
                                                                className="px-2 py-1 text-[10px] font-bold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                                                            >
                                                                +10
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {loading && <div className="text-center py-12 text-gray-400">Loading analytics...</div>}

                        {!loading && !analytics && (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <BarChart3 className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No Data Yet</h3>
                                <p className="text-gray-500">Complete some orders to see analytics.</p>
                            </div>
                        )}

                        {!loading && analytics && (
                            <>
                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center">
                                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Revenue</span>
                                        </div>
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(0)}</div>
                                    </div>

                                    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center">
                                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Orders</span>
                                        </div>
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalOrders}</div>
                                    </div>

                                    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Avg Order</span>
                                        </div>
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">${analytics.avgOrderValue.toFixed(0)}</div>
                                    </div>

                                    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center">
                                                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Items</span>
                                        </div>
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{analytics.totalItems}</div>
                                    </div>
                                </div>

                                {/* Charts Row */}
                                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Product Popularity */}
                                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Popular Products
                                        </h3>
                                        <div className="h-48 sm:h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics.productData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} />
                                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#555' }} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        formatter={(value, name, props) => [value, props.payload.fullName]}
                                                    />
                                                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Delivery vs Pickup */}
                                    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            Delivery Breakdown
                                        </h3>
                                        <div className="h-48 sm:h-64 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analytics.deliveryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        labelLine={false}
                                                    >
                                                        {analytics.deliveryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex justify-center gap-6 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm text-gray-600">Delivery: <strong>{analytics.deliveryPercent}%</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-600">Pickup: <strong>{analytics.pickupPercent}%</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Chart - Orders Over Time */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        Order & Revenue Trends
                                    </h3>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={analytics.revenueData} margin={{ left: 10, right: 30 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
                                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} name="Revenue ($)" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Actionable Insights */}
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        💡 Actionable Insights
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="text-xs uppercase font-bold text-gray-400 mb-1">🏆 Best Seller</div>
                                            <div className="text-lg font-bold">{analytics.bestSeller}</div>
                                            <p className="text-xs text-gray-400 mt-1">Consider stocking more of this flavor</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="text-xs uppercase font-bold text-gray-400 mb-1">🚚 Preferred Method</div>
                                            <div className="text-lg font-bold">{analytics.preferredMethod}</div>
                                            <p className="text-xs text-gray-400 mt-1">{analytics.deliveryPercent > 60 ? 'Consider delivery promos' : analytics.pickupPercent > 60 ? 'Great for local engagement' : 'Nice balance!'}</p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                            <div className="text-xs uppercase font-bold text-gray-400 mb-1">📅 Peak Day</div>
                                            <div className="text-lg font-bold">{analytics.peakDay}</div>
                                            <p className="text-xs text-gray-400 mt-1">Plan restocking before this day</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
