import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const Reveal = ({ children, width = "fit-content" }) => {
    return (
        <div style={{ position: "relative", width }}>
            {children}
        </div>
    );
};

export default Reveal;
