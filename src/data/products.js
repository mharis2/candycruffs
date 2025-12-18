export const products = [
    {
        id: 'prism-pops',
        name: 'Prism Pops',
        // price removed, moved to sizes
        tagline: 'Classic rainbow, remade in crunch.',
        description: 'Your favorite rainbow candies, puffed up and freeze dried for an intense, crunchy bite.',
        image: '/assets/prism-pops.png',
        sizeComparisonImage: '/assets/logo.png', // User to provide
        badges: ['GELATIN-FREE', 'SWEET', 'RAINBOW'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8 },
            { id: 'lrg', name: 'Large', weight: '120g', price: 15 }
        ]
    },
    {
        id: 'crystal-bear-bites',
        name: 'Crystal Bear Bites',
        tagline: 'Gummy bears, reborn as crackly gems.',
        description: 'Soft gummy bears transformed into airy, jewel-like bites with a light, shattery crunch in every color.',
        image: '/assets/crystal-bear-bites.png',
        sizeComparisonImage: '/assets/crystal-bear-bites-sizes.png',
        badges: ['HALAL', 'FRUITY', 'CRUNCHY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8 },
            { id: 'lrg', name: 'Large', weight: '120g', price: 15 }
        ]
    },
    {
        id: 'neon-worm-crisps',
        name: 'Neon Worm Crisps',
        tagline: 'Twisted neon worms with an electric sour crunch.',
        description: 'Bright neon sour gummy worms freeze dried into ultra-light, crackly coils that hit with a tangy crunch.',
        image: '/assets/neon-worm-crunch.png',
        sizeComparisonImage: '/assets/neon-worm-crisps-sizes.png',
        badges: ['HALAL', 'SOUR', 'NEON'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8 },
            { id: 'lrg', name: 'Large', weight: '120g', price: 15 }
        ]
    },
    {
        id: 'shark-bite-crunch',
        name: 'Shark Bite Crunch',
        tagline: 'Shark gummies with a fierce, foamy crunch.',
        description: 'Ocean-themed shark gummies puffed up and freeze dried into bold, bite-sized chunks with a powerful crunch.',
        image: '/assets/shark-bite-crunch.png',
        sizeComparisonImage: '/assets/shark-bite-crunch-sizes.png',
        badges: ['HALAL', 'FRUITY', 'CRUNCHY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8 },
            { id: 'lrg', name: 'Large', weight: '120g', price: 15 }
        ]
    },
    {
        id: 'cola-fizz-crunch',
        name: 'Cola Fizz Crunch',
        tagline: 'Classic cola bottles with a fizzy crackle.',
        description: 'Cola bottle gummies transformed into light, crispy bites with a nostalgic soda-shop cola flavor and crackly crunch.',
        image: '/assets/cola-fizz-crunch.png',
        sizeComparisonImage: '/assets/cola-fizz-crunch-sizes.png',
        badges: ['HALAL', 'COLA', 'FIZZY'],
        sizes: [
            { id: 'reg', name: 'Regular', weight: '50g', price: 8 },
            { id: 'lrg', name: 'Large', weight: '120g', price: 15 }
        ]
    }
];
