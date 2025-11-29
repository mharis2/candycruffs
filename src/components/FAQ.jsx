import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "What exactly is freeze-dried candy?",
        answer: "It's candy that has been frozen and then dried in a vacuum. This removes moisture, intensifying the flavor and creating a unique, airy, crunchy texture."
    },
    {
        question: "How long does it last?",
        answer: "Because the moisture is removed, freeze-dried candy has a very long shelf life! Keep it sealed in a cool, dry place and it stays crunchy for months (if you don't eat it all first)."
    },
    {
        question: "Is it safe for kids?",
        answer: "Absolutely! It's just regular candy with a different texture. However, it can be fragile, so handle with care."
    },
    {
        question: "Do you ship?",
        answer: "Currently we only offer shipping/delivery within Edmonton, Alberta. We're keeping it local for now!"
    },
    {
        question: "Can I pick up my order?",
        answer: "Yes! You can choose the pickup option at checkout to save on delivery fees. We'll coordinate a time and place with you."
    }
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
            >
                <span className="text-lg font-bold text-gray-900">{question}</span>
                <span className="ml-4 text-primary">
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-600 leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQ = () => {
    return (
        <section className="py-20 bg-gradient-to-b from-white to-pink-50" id="faq">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <FAQItem {...faq} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
