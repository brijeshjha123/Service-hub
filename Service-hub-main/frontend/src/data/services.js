export const categories = [
    {
        id: 'cleaning',
        name: 'Home & Cleaning',
        icon: '✨',
        image: '/services/cleaning.png',
        services: [
            {
                id: 'clean-bath',
                name: 'Bathroom Deep Cleaning',
                description: 'Intense cleaning of tiles, commode, washbasin, and mirrors using specialized chemicals.',
                rating: 4.8,
                reviews: 1240,
                price: 499,
                image: '/services/bathroom.png'
            },
            {
                id: 'clean-kitchen',
                name: 'Kitchen Deep Cleaning',
                description: 'Oil and grease removal from slab, chimney, sink, and floor.',
                rating: 4.7,
                reviews: 850,
                price: 699,
                image: '/services/purifier.png'
            },
            {
                id: 'clean-home',
                name: 'Full Home Cleaning',
                description: 'Complete home deep cleaning including floor, furniture, windows, and washrooms.',
                rating: 4.9,
                reviews: 2100,
                price: 2499,
                image: '/services/cleaning.png'
            }
        ]
    },
    {
        id: 'salon',
        name: 'Salon & Wellness',
        icon: '💄',
        image: '/services/salon.png',
        services: [
            {
                id: 'salon-men',
                name: 'Men\'s Haircut & Grooming',
                description: 'Professional haircut, beard styling, and face massage at home.',
                rating: 4.6,
                reviews: 3200,
                price: 299,
                image: '/services/salon.png'
            },
            {
                id: 'salon-spa',
                name: 'Spa & Massage',
                description: 'Relaxing deep tissue and swedish massage therapy.',
                rating: 4.9,
                reviews: 540,
                price: 1499,
                image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop'
            }
        ]
    },
    {
        id: 'repairs',
        name: 'Repairs & Maintenance',
        icon: '🛠️',
        image: '/services/repairs.png',
        services: [
            {
                id: 'repair-ac',
                name: 'AC Service & Repair',
                description: 'Filter cleaning, gas checking, and cooling coil cleaning.',
                rating: 4.7,
                reviews: 5600,
                price: 599,
                image: '/services/repairs.png'
            },
            {
                id: 'repair-electric',
                name: 'Electrician',
                description: 'Switch replacement, wiring check, fan installation.',
                rating: 4.5,
                reviews: 4100,
                price: 199,
                image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=600&auto=format&fit=crop'
            }
        ]
    },
    {
        id: 'smart-home',
        name: 'Smart Home & Products',
        icon: '🤖',
        image: '/services/smart_home.png',
        services: [
            {
                id: 'smart-purifier',
                name: 'Water Purifier Service',
                description: 'Filter change, membrane cleaning, and purity check.',
                rating: 4.8,
                reviews: 900,
                price: 499,
                image: '/services/water_purifier_final.png'
            },
            {
                id: 'smart-lock',
                name: 'Smart Lock Installation',
                description: 'Installation and configuration of digital door locks.',
                rating: 4.9,
                reviews: 120,
                price: 999,
                image: '/services/lock.png'
            }
        ]
    }
];
