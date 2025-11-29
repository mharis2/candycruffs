/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF6B9C', // Reverted to original pink
                secondary: '#FBCFE8', // Soft Pink
                accent: '#06B6D4', // Cyan/Teal
                background: '#FAFAFA', // Very light gray/white
                surface: '#FFFFFF',
                text: '#1F2937',
                'text-muted': '#6B7280',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            }
        },
    },
    plugins: [],
}
