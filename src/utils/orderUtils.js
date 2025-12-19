/**
 * Generates a unique order code based on the customer's name.
 * Format: XXX-000 (First 3 letters of name + 3 random digits)
 * Example: HAR-492
 * @param {string} name - Customer's full name
 * @returns {string} - The generated order code
 */
export const generateOrderCode = (name) => {
    const cleanName = name ? name.trim().replace(/[^a-zA-Z]/g, '') : '';
    const prefix = (cleanName.length >= 3 ? cleanName.substring(0, 3) : 'CUST').toUpperCase();
    const randomDigits = Math.floor(100 + Math.random() * 900); // Guarantees 3 digits
    return `${prefix}-${randomDigits}`;
};
