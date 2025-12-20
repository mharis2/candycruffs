export const products = [
    {
        id: 'prism-pops',
        name: 'Prism Pops',
        // price removed, moved to sizes
        tagline: 'Classic rainbow, remade in crunch.',
        description: 'Your favorite rainbow candies, puffed up and freeze dried for an intense, crunchy bite.',
        image: '/assets/prism-pops.webp',
        sizeComparisonImage: '/assets/prism-pop-size.webp', // User to provide
        badges: ['GELATIN-FREE', 'SWEET', 'RAINBOW'],
        sizes: [
            { id: 'std', name: 'Bag', price: 10, sku: 'PRISM-POPS' }
        ]
    },
    {
        id: 'crystal-bear-bites',
        name: 'Crystal Bear Bites',
        tagline: 'Gummy bears, reborn as crackly gems.',
        description: 'Soft gummy bears transformed into airy, jewel-like bites with a light, shattery crunch in every color.',
        image: '/assets/crystal-bear-bites.webp',
        sizeComparisonImage: '/assets/crystal-bear-bites-sizes.webp',
        badges: ['HALAL', 'FRUITY', 'CRUNCHY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8, sku: 'CRYSTAL-BEAR-BITES-REG' },
            { id: 'lrg', name: 'Large', weight: '120g', price: 10, sku: 'CRYSTAL-BEAR-BITES-LRG' }
        ]
    },
    {
        id: 'neon-worm-crisps',
        name: 'Neon Worm Crisps',
        tagline: 'Twisted neon worms with an electric sour crunch.',
        description: 'Bright neon sour gummy worms freeze dried into ultra-light, crackly coils that hit with a tangy crunch.',
        image: '/assets/neon-worm-crunch.webp',
        sizeComparisonImage: '/assets/neon-worm-crisps-sizes.webp',
        badges: ['HALAL', 'SOUR', 'NEON'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8, sku: 'NEON-WORM-CRISPS-REG' },
            { id: 'lrg', name: 'Large', weight: '120g', price: 10, sku: 'NEON-WORM-CRISPS-LRG' }
        ]
    },
    {
        id: 'shark-bite-crunch',
        name: 'Shark Bite Crunch',
        tagline: 'Shark gummies with a fierce, foamy crunch.',
        description: 'Ocean-themed shark gummies puffed up and freeze dried into bold, bite-sized chunks with a powerful crunch.',
        image: '/assets/shark-bite-crunch.webp',
        sizeComparisonImage: '/assets/shark-bite-crunch-sizes.webp',
        badges: ['HALAL', 'FRUITY', 'CRUNCHY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8, sku: 'SHARK-BITE-CRUNCH-REG' },
            { id: 'lrg', name: 'Large', weight: '120g', price: 10, sku: 'SHARK-BITE-CRUNCH-LRG' }
        ]
    },
    {
        id: 'cola-fizz-crunch',
        name: 'Cola Fizz Crunch',
        tagline: 'Classic cola bottles with a fizzy crackle.',
        description: 'Cola bottle gummies transformed into light, crispy bites with a nostalgic soda-shop cola flavor and crackly crunch.',
        image: '/assets/cola-fizz-crunch.webp',
        sizeComparisonImage: '/assets/cola-fizz-crunch-sizes.webp',
        badges: ['HALAL', 'COLA', 'FIZZY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8, sku: 'COLA-FIZZ-CRUNCH-REG' },
            { id: 'lrg', name: 'Large', weight: '120g', price: 10, sku: 'COLA-FIZZ-CRUNCH-LRG' }
        ]
    }
];
