import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Send, MessageSquarePlus, PenTool, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import { testimonials } from '../data/testimonials';

const ReviewForm = () => {
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        const messageData = {
            name: formData.name,
            email: 'noreply@candycruffs.review',
            message: `New Testimonial/Review:\n\nRating: ${rating} Star(s)\nReview: ${formData.message}`
        };

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', message: '' });
                setRating(5);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl border border-green-100 text-center max-w-lg mx-auto"
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks for the Love!</h3>
                <p className="text-gray-600 mb-6">We've received your review. You're awesome!</p>
                <Button onClick={() => setStatus('idle')} className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                    Write Another
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <PenTool size={100} />
            </div>

            <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                    <MessageSquarePlus size={14} />
                    Feedback
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Leave a Review</h3>
                <p className="text-gray-500 text-sm mt-2">Love our treats? Tell us about it!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {/* Star Rating */}
                <div className="text-center mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Your Rating</label>
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    size={28}
                                    fill={(hoverRating || rating) >= star ? '#facc15' : 'transparent'}
                                    className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Your Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Candy Lover"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Your Experience</label>
                    <textarea
                        required
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                        placeholder="What did you try? How was the crunch?"
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={status === 'submitting'}
                >
                    {status === 'submitting' ? 'Sending...' : <>Submit Review <Send size={16} /></>}
                </Button>
                {status === 'error' && (
                    <p className="text-red-500 text-xs text-center mt-2">Something went wrong. Try again.</p>
                )}
            </form>
        </div>
    );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }) => (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-pink-100/50 border border-white ring-1 ring-black/5 flex flex-col h-full max-w-2xl mx-auto">
        <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1 text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                ))}
            </div>
            {testimonial.verified && (
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <CheckCircle size={12} /> Verified
                </div>
            )}
        </div>

        <p className="text-gray-600 text-lg md:text-xl mb-8 italic leading-relaxed flex-grow text-center">
            "{testimonial.quote}"
        </p>

        <div className="flex items-center justify-center gap-3 mt-auto">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary/30">
                {testimonial.name[0]}
            </div>
            <p className="font-bold text-gray-900 text-lg">{testimonial.name}</p>
        </div>
    </div>
);

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, []);

    // Auto-play (pauses on user interaction)
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, isPaused]);

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <section className="py-24 bg-gradient-to-b from-pink-50/50 via-purple-50/50 to-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.div>
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
                            Sweet Words
                        </h2>
                        <div className="w-24 h-1.5 bg-primary rounded-full mx-auto mt-6 opacity-30" />
                    </motion.div>
                </div>

                {/* Carousel Container */}
                <div
                    className="relative max-w-3xl mx-auto"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all border border-gray-100"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all border border-gray-100"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Carousel Slide */}
                    <div className="overflow-hidden px-4 py-4">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <TestimonialCard testimonial={testimonials[currentIndex]} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-primary w-8'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <ReviewForm />
            </div>
        </section>
    );
};

export default Testimonials;

