import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const Reveal = ({ children, width = "fit-content", className = "" }) => {
    return (
        <div style={{ position: "relative", width }} className={className}>
            {children}
        </div>
    );
};

export default Reveal;
