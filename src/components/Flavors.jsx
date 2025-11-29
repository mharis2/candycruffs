import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { products } from '../data/products';
import { ShoppingBag } from 'lucide-react';

const FlavorCard = ({ product, index }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500"
        >
            <div className="flex flex-col h-full">
                {/* Image Area */}
                <div className="relative h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 w-48 h-48 flex items-center justify-center"
                    >
                        {/* Placeholder for product image if not found */}
                        <div className="w-40 h-40 bg-white rounded-full shadow-inner flex items-center justify-center text-gray-300 font-bold text-lg border-4 border-white">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain rounded-full" onError={(e) => e.target.style.display = 'none'} />
                            ) : 'No Image'}
                            {!product.image && <span>Img</span>}
                        </div>
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                        {product.badges?.map(badge => (
                            <span key={badge} className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-gray-800 shadow-sm border border-gray-100 uppercase">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-grow bg-white relative z-20">
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-display font-bold text-gray-900 leading-tight">{product.name}</h3>
                            <span className="text-xl font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">${product.price}</span>
                        </div>
                        <p className="text-sm font-medium text-secondary mb-3">{product.tagline}</p>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{product.description}</p>
                    </div>

                    <div className="mt-auto pt-6">
                        <Link to={`/order?product=${product.id}`}>
                            <Button className="w-full group-hover:bg-primary group-hover:text-white shadow-md shadow-primary/10 group-hover:shadow-primary/30 transition-all duration-300">
                                Order Now
                                <ShoppingBag size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Flavors = () => {
    return (
        <section className="py-24 lg:py-32 bg-gray-50 relative overflow-hidden" id="flavors">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-40" />
                <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl opacity-40" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Reveal>
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-4 block">
                            Our Menu
                        </span>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
                            Weekly Rotations & <br />
                            <span className="text-primary">Fan Favorites.</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.4}>
                        <p className="text-lg text-gray-600">
                            Freshly freeze-dried in small batches. Get them while they're crunchy!
                        </p>
                    </Reveal>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto perspective-1000">
                    {products.map((product, index) => (
                        <FlavorCard key={product.id} product={product} index={index} />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link to="/order">
                        <Button variant="outline" size="lg" className="px-12">
                            View Full Menu
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Flavors;
