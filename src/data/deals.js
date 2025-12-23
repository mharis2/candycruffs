// Launch Week Deals Configuration
// Active from Launch Week onwards

export const DEALS = {
    // "The Taste the Crunch Collection" Bundle
    collectionBundle: {
        id: 'full-collection-bundle',
        sku: 'FULL-COLLECTION-BUNDLE',
        name: 'The Full Collection',
        tagline: 'Taste the Crunch - All 5 Signature Flavors',
        description: 'Get one of every flavor: Shark Bite Crunch, Neon Worm Crisps, Crystal Bear Bites, Cola Fizz Crunch, and Prism Pops. The ultimate freeze-dried candy experience.',
        originalPrice: 50,
        salePrice: 45,
        savings: 5,
        image: '/assets/collection-bundle.png',
        includedProducts: [
            'shark-bite-crunch',
            'neon-worm-crisps',
            'crystal-bear-bites',
            'cola-fizz-crunch',
            'prism-pops'
        ],
        // SKUs that get decremented when bundle is purchased (Large bags for most, Bag for Prism Pops)
        includedSKUs: [
            'SHARK-BITE-CRUNCH-LRG',
            'NEON-WORM-CRISPS-LRG',
            'CRYSTAL-BEAR-BITES-LRG',
            'COLA-FIZZ-CRUNCH-LRG',
            'PRISM-POPS'
        ],
        // SKU to display name mapping for admin/display purposes
        includedItems: [
            { sku: 'SHARK-BITE-CRUNCH-LRG', name: 'Shark Bite Crunch (Large)' },
            { sku: 'NEON-WORM-CRISPS-LRG', name: 'Neon Worm Crisps (Large)' },
            { sku: 'CRYSTAL-BEAR-BITES-LRG', name: 'Crystal Bear Bites (Large)' },
            { sku: 'COLA-FIZZ-CRUNCH-LRG', name: 'Cola Fizz Crunch (Large)' },
            { sku: 'PRISM-POPS', name: 'Prism Pops' }
        ],
        // Bundle gets its own inventory - does NOT use individual product Large SKUs
        // No free delivery on this bundle
        freeDeliveryEligible: false,
        active: true
    },

    // "3-for-$27 Mix & Match" Deal
    mixAndMatch: {
        id: 'mix-match-3-for-27',
        name: 'Stock Up & Save',
        tagline: '3 Large Bags for $27',
        description: 'Any 3 Large size bags for just $27. Discount applies automatically at checkout.',
        regularPricePerItem: 10,
        dealPriceFor3: 27,
        savingsPerSet: 3,
        requiredQuantity: 3,
        // Eligible criteria: size.name === 'Large' OR size.price === 10
        eligibleSizeName: 'Large',
        eligiblePrice: 10,
        active: true
    }
};

/**
 * Calculate Mix & Match discount for Large bags
 * @param {Object} quantities - Cart quantities object { productId_sizeId: count }
 * @param {Function} getProductAndSize - Helper to get product/size from key
 * @returns {Object} { savings, dealSets, eligibleCount }
 */
export const calculateMixMatchDiscount = (quantities, getProductAndSize) => {
    const deal = DEALS.mixAndMatch;
    if (!deal.active) return { savings: 0, dealSets: 0, eligibleCount: 0 };

    let eligibleCount = 0;

    // Count items where size is 'Large' or price is $10 (excluding bundle)
    Object.keys(quantities).forEach(key => {
        // Skip bundle items
        if (key.startsWith('full-collection-bundle')) return;

        const { size } = getProductAndSize(key);
        if (size && (size.name === deal.eligibleSizeName || size.price === deal.eligiblePrice)) {
            eligibleCount += quantities[key];
        }
    });

    const dealSets = Math.floor(eligibleCount / deal.requiredQuantity);
    const remainder = eligibleCount % deal.requiredQuantity;

    // Normal price: eligibleCount * 10
    // Deal price: (dealSets * 27) + (remainder * 10)
    const normalPrice = eligibleCount * deal.regularPricePerItem;
    const dealPrice = (dealSets * deal.dealPriceFor3) + (remainder * deal.regularPricePerItem);
    const savings = normalPrice - dealPrice;

    return { savings, dealSets, eligibleCount };
};

/**
 * Check if a product size is eligible for Mix & Match deal
 * @param {Object} size - Product size object
 * @returns {boolean}
 */
export const isEligibleForMixMatch = (size) => {
    const deal = DEALS.mixAndMatch;
    if (!deal.active || !size) return false;
    return size.name === deal.eligibleSizeName || size.price === deal.eligiblePrice;
};

/**
 * Check if the Collection Bundle is available (all included products in stock)
 * @param {Map} stockMap - Map of SKU to stock quantity
 * @param {Function} getStockLevel - Helper function to get stock from map
 * @returns {boolean}
 */
export const isBundleAvailable = (stockMap, getStockLevel) => {
    const bundle = DEALS.collectionBundle;
    if (!bundle.active) return false;

    // Check each SKU in the bundle
    for (const sku of bundle.includedSKUs) {
        const stock = getStockLevel(stockMap, sku);
        if (stock <= 0) return false;
    }
    return true;
};

/**
 * Get bundle items for order submission (individual SKUs that need stock decremented)
 * @param {number} bundleQuantity - Number of bundles ordered
 * @returns {Array} Array of items with SKU and quantity for stock decrement
 */
export const getBundleOrderItems = (bundleQuantity) => {
    const bundle = DEALS.collectionBundle;
    return bundle.includedSKUs.map(sku => ({
        sku,
        quantity: bundleQuantity
    }));
};

/**
 * Get the maximum quantity of bundles that can be ordered based on component stock
 * @param {Map} stockMap - Map of SKU to stock quantity
 * @param {Function} getStockLevel - Helper function to get stock from map
 * @returns {number} Maximum number of bundles available
 */
export const getMaxBundleQuantity = (stockMap, getStockLevel) => {
    const bundle = DEALS.collectionBundle;
    if (!bundle.active || !stockMap || stockMap.size === 0) return 0;

    // Find minimum stock across all component SKUs
    let minStock = Infinity;
    for (const sku of bundle.includedSKUs) {
        const stock = getStockLevel(stockMap, sku);
        if (stock < minStock) {
            minStock = stock;
        }
    }
    return minStock === Infinity ? 0 : Math.max(0, minStock);
};
