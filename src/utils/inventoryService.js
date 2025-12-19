
import { supabase } from './supabaseClient';

/**
 * Fetches inventory data from Supabase.
 * Returns a Map where keys are SKUs and values are stock quantities.
 */
export const fetchStockData = async () => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('sku, stock_qty');

        if (error) {
            console.error('Error fetching inventory:', error);
            return new Map();
        }

        const stockMap = new Map();
        data.forEach(item => {
            if (item.sku) {
                stockMap.set(item.sku, item.stock_qty);
            }
        });
        return stockMap;
    } catch (error) {
        console.error('Inventory Service Error:', error);
        return new Map();
    }
};

/**
 * Helper to check stock for a specific SKU from the provided stock map.
 * Returns the quantity available (0 if not found).
 */
export const getStockLevel = (stockMap, sku) => {
    return stockMap.get(sku) || 0;
};

/**
 * Subscribes to realtime updates for the products table.
 * @param {function} onUpdate - Callback function that receives the new stockMap
 * @returns {object} - Subscription object with unsubscribe method
 */
export const subscribeToStockUpdates = (onUpdate) => {
    const channel = supabase
        .channel('public:products')
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'products' },
            (payload) => {
                // When any product updates, we could either just update that one SKU in a local map
                // or re-fetch all. For simplicity and consistency (and since products list is small),
                // we'll re-fetch the whole map to ensure we have the latest state.
                // Optimisation: update just the map entry.
                // Let's implement the refined update to avoid full refetch spam if possible,
                // but given the signature `onUpdate(newMap)`, the consumer expects a map.
                // I'll re-fetch for now to be safe and simple as requested "updates instantly".
                fetchStockData().then(map => onUpdate(map));
            }
        )
        .subscribe();

    return {
        unsubscribe: () => {
            supabase.removeChannel(channel);
        }
    };
};
