// Exclusive Limited Time Deals Configuration
import { products as productCatalog } from './products';

export const DEALS = {
    // "The Crunch Jackpot" Bundle — Pick any 6 Large bags (Prism Pops included), save $10 (1 bag FREE!)
    collectionBundle: {
        id: 'full-collection-bundle',
        sku: 'FULL-COLLECTION-BUNDLE',
        name: 'The Crunch Jackpot',
        tagline: 'Any 6 Large Bags — 1 Bag FREE!',
        description: 'Pick any 6 Large bags — Prism Pops included! That\'s 1 bag completely FREE!',
        originalPrice: 60,
        salePrice: 50,
        savings: 10,
        maxItems: 6,
        image: '/assets/collection-bundle.webp',
        // All eligible products for the customizable bundle
        eligibleProducts: [
            { productId: 'shark-bite-crunch', sku: 'SHARK-BITE-CRUNCH-LRG', name: 'Shark Bite Crunch', sizeName: 'Large' },
            { productId: 'neon-worm-crisps', sku: 'NEON-WORM-CRISPS-LRG', name: 'Neon Worm Crisps', sizeName: 'Large' },
            { productId: 'crystal-bear-bites', sku: 'CRYSTAL-BEAR-BITES-LRG', name: 'Crystal Bear Bites', sizeName: 'Large' },
            { productId: 'cola-fizz-crunch', sku: 'COLA-FIZZ-CRUNCH-LRG', name: 'Cola Fizz Crunch', sizeName: 'Large' },
            { productId: 'prism-pops', sku: 'PRISM-POPS', name: 'Prism Pops', sizeName: 'Bag' },
            { productId: 'strawberry-sparkle-crunch', sku: 'STRAWBERRY-SPARKLE-CRUNCH-LRG', name: 'Strawberry Sparkle Crunch', sizeName: 'Large' },
            { productId: 'caramelts', sku: 'CARAMELTS-LRG', name: 'Caramelts', sizeName: 'Large' },
            { productId: 'sour-prism-pops', sku: 'SOUR-PRISM-POPS', name: 'Sour Prism Pops', sizeName: 'Bag' }
        ],
        freeDeliveryEligible: false,
        active: true
    },

    // "3-for-$27 Mix & Match" Deal (Large bags / $10 items)
    mixAndMatch: {
        id: 'mix-match-3-for-27',
        name: 'Stock Up & Save',
        tagline: '3 for $27',
        description: 'Select any 3 Large bags or Prism Pops ($10 items) and save $3 automatically!',
        regularPricePerItem: 10,
        dealPriceFor3: 27,
        savingsPerSet: 3,
        requiredQuantity: 3,
        eligibleSizeName: 'Large',
        eligiblePrice: 10,
        active: true
    },

    // "2 Regulars for $15" Deal
    regularDeal: {
        id: 'regular-2-for-15',
        name: 'Double Up',
        tagline: '2 for $15',
        description: 'Grab any 2 Regular bags and save $1 automatically!',
        regularPricePerItem: 8,
        dealPriceFor2: 15,
        savingsPerSet: 1,
        requiredQuantity: 2,
        eligibleSizeName: 'Regular',
        eligiblePrice: 8,
        active: true
    }
};

/**
 * Get eligible product SKUs (derived from eligibleProducts)
 */
export const getEligibleSKUs = () => {
    return DEALS.collectionBundle.eligibleProducts.map(p => p.sku);
};

/**
 * Get product image from product catalog by product ID
 */
export const getBundleProductImage = (productId) => {
    const product = productCatalog.find(p => p.id === productId);
    return product?.image || null;
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

    const normalPrice = eligibleCount * deal.regularPricePerItem;
    const dealPrice = (dealSets * deal.dealPriceFor3) + (remainder * deal.regularPricePerItem);
    const savings = normalPrice - dealPrice;

    return { savings, dealSets, eligibleCount };
};

/**
 * Calculate Regular Deal discount for Regular bags (2 for $15)
 * @param {Object} quantities - Cart quantities object { productId_sizeId: count }
 * @param {Function} getProductAndSize - Helper to get product/size from key
 * @returns {Object} { savings, dealSets, eligibleCount }
 */
export const calculateRegularDiscount = (quantities, getProductAndSize) => {
    const deal = DEALS.regularDeal;
    if (!deal.active) return { savings: 0, dealSets: 0, eligibleCount: 0 };

    let eligibleCount = 0;

    // Count items where size is 'Regular' or price is $8 (excluding bundle)
    Object.keys(quantities).forEach(key => {
        if (key.startsWith('full-collection-bundle')) return;

        const { size } = getProductAndSize(key);
        if (size && (size.name === deal.eligibleSizeName || size.price === deal.eligiblePrice)) {
            eligibleCount += quantities[key];
        }
    });

    const dealSets = Math.floor(eligibleCount / deal.requiredQuantity);
    const remainder = eligibleCount % deal.requiredQuantity;

    const normalPrice = eligibleCount * deal.regularPricePerItem;
    const dealPrice = (dealSets * deal.dealPriceFor2) + (remainder * deal.regularPricePerItem);
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
 * Check if a product size is eligible for Regular deal
 * @param {Object} size - Product size object
 * @returns {boolean}
 */
export const isEligibleForRegularDeal = (size) => {
    const deal = DEALS.regularDeal;
    if (!deal.active || !size) return false;
    return size.name === deal.eligibleSizeName || size.price === deal.eligiblePrice;
};

/**
 * Check if the customizable bundle is available (at least 6 total stock across eligible products)
 * @param {Map} stockMap - Map of SKU to stock quantity
 * @param {Function} getStockLevel - Helper function to get stock from map
 * @returns {boolean}
 */
export const isBundleAvailable = (stockMap, getStockLevel) => {
    const bundle = DEALS.collectionBundle;
    if (!bundle.active) return false;

    // For customizable bundle: available if total stock across all eligible products >= maxItems
    let totalStock = 0;
    for (const product of bundle.eligibleProducts) {
        const stock = getStockLevel(stockMap, product.sku);
        totalStock += Math.max(0, stock);
    }
    return totalStock >= bundle.maxItems;
};

/**
 * Get stock for each eligible product in the bundle
 * @param {Map} stockMap - Map of SKU to stock quantity
 * @param {Function} getStockLevel - Helper function to get stock from map
 * @returns {Object} Map of SKU to stock quantity for bundle-eligible products
 */
export const getBundleStock = (stockMap, getStockLevel) => {
    const bundle = DEALS.collectionBundle;
    const stockByProduct = {};
    for (const product of bundle.eligibleProducts) {
        stockByProduct[product.sku] = Math.max(0, getStockLevel(stockMap, product.sku));
    }
    return stockByProduct;
};

/**
 * Get bundle items for order submission from custom selections
 * @param {Object} bundleSelections - { [sku]: quantity } for custom bundle
 * @returns {Array} Array of items with SKU, name, and quantity for stock decrement + display
 */
export const getBundleOrderItems = (bundleSelections) => {
    const bundle = DEALS.collectionBundle;
    const items = [];
    for (const product of bundle.eligibleProducts) {
        const qty = bundleSelections[product.sku] || 0;
        if (qty > 0) {
            items.push({
                sku: product.sku,
                name: `${product.name} (${product.sizeName})`,
                quantity: qty,
                price: 10,
                isBundle: true,
                isBundleComponent: true,
                bundleParent: bundle.sku
            });
        }
    }
    return items;
};

/**
 * Get total selected items in a bundle selection
 * @param {Object} bundleSelections - { [sku]: quantity }
 * @returns {number}
 */
export const getBundleSelectionTotal = (bundleSelections) => {
    return Object.values(bundleSelections).reduce((sum, qty) => sum + qty, 0);
};

/**
 * Get the maximum quantity of bundles that can be ordered (for custom bundles, always 1)
 * @returns {number} Maximum number of bundles available
 */
export const getMaxBundleQuantity = () => {
    return 1; // Custom bundles are always 1 at a time
};
