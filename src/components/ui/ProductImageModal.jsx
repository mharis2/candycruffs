import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

const ProductImageModal = ({ isOpen, onClose, image, alt = "Product Image" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4"
                    >
                        <div className="relative bg-white rounded-3xl p-2 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex items-center justify-center">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Image Container */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden p-4 md:p-8">
                                <img
                                    src={image}
                                    alt={alt}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductImageModal;
