import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Button from '../components/ui/Button';
import { Package, ShoppingBag, Plus, Minus, RefreshCw, Archive, CheckCircle, AlertTriangle } from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
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
        else fetchInventory();
    };

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending_payment')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
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
        if (password === 'admin123') setAuthorized(true);
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
        if (!window.confirm(`Mark order ${order.order_code} as PAID?`)) return;

        // 1. Update status
        const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id);

        if (error) {
            alert('Error updating: ' + error.message);
        } else {
            // 2. Send Email
            await sendEmailTrigger('paid', {
                email: order.customer_email,
                name: order.customer_name || 'Customer', // Fallback if name not saved in future
                orderCode: order.order_code
            });
            fetchOrders();
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

    // --- Inventory Actions ---

    const updateStock = async (sku, delta) => {
        // Optimistic UI update could be done here, but we'll wait for server for safety
        const { data: current, error: fetchError } = await supabase
            .from('products')
            .select('stock_qty')
            .eq('sku', sku)
            .single();

        if (fetchError) {
            alert('Error fetching current stock');
            return;
        }

        const newQty = Math.max(0, current.stock_qty + delta);

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_qty: newQty })
            .eq('sku', sku);

        if (updateError) {
            alert('Error updating stock');
        } else {
            fetchInventory();
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
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Dashboard</h1>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ShoppingBag size={18} />
                            Pending Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Package size={18} />
                            Inventory
                        </button>
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

                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />

                                <div className="flex-grow">
                                    <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {order.customer_email}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">ID: {order.id}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-700">
                                                {order.order_code}
                                            </span>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold">
                                                ${order.total}
                                            </span>
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
                                    <button
                                        onClick={() => releaseStock(order)}
                                        className="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <Archive size={16} /> Cancel Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={fetchInventory}
                                className="text-sm font-bold text-primary flex items-center gap-2 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.sku} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${product.stock_qty > 10 ? 'bg-green-100 text-green-700' : product.stock_qty > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stock_qty > 0 ? 'In Stock' : 'Sold Out'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono mb-6 truncate" title={product.sku}>{product.sku}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">Current Stock</span>
                                            <span className="text-2xl font-bold text-gray-900">{product.stock_qty}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Quick Actions */}
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => updateStock(product.sku, 5)}
                                                    className="bg-white border border-green-200 text-green-600 hover:bg-green-50 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> 5
                                                </button>
                                                <button
                                                    onClick={() => updateStock(product.sku, 1)}
                                                    className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1"
                                                >
                                                    <Plus size={10} /> 1
                                                </button>
                                            </div>

                                            <div className="w-px h-8 bg-gray-200 mx-1"></div>

                                            <button
                                                onClick={() => updateStock(product.sku, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg transition-colors"
                                                title="Remove 1"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
