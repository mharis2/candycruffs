import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import Layout from './components/Layout';
import Hero from './components/Hero';
import About from './components/About';
import Flavors from './components/Flavors';
import Testimonials from './components/Testimonials';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Order from './pages/Order';
import Contact from './pages/Contact';

function Home() {
    return (
        <>
            <Hero />
            <div id="about"><About /></div>
            <div id="flavors"><Flavors /></div>
            <Testimonials />
            <HowItWorks />
            <FAQ />
        </>
    );
}

import ScrollToTop from './components/ScrollToTop';

function App() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <Router>
            <ScrollToTop />
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
