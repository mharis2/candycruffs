
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Testing connection to Supabase...');
    console.log(`📡 URL: ${supabaseUrl}`);

    const start = Date.now();
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Connection Failed:', error.message);
    } else {
        const duration = Date.now() - start;
        console.log(`✅ Connection Successful! (${duration}ms)`);
        console.log('------------------------------------------------');

        // Try to fetch actual data to be sure
        const { data: products, error: prodError } = await supabase.from('products').select('*').limit(3);
        if (prodError) {
            console.error('⚠️ Could not fetch products (Check Table Permissions?):', prodError.message);
        } else {
            console.log(`📦 Found ${products.length} products in the database.`);
            if (products.length > 0) {
                console.log('   Sample:', products[0].name, `(Stock: ${products[0].stock_qty})`);
            } else {
                console.log('   (Table is empty. Did you run the seed script?)');
            }
        }
    }
}

testConnection();
