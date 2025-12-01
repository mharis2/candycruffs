# Google Maps API Setup Instructions

## For Local Development

1. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select an existing one)
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - **Places API**
     - **Geocoding API** (optional, for future use)
   
2. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

3. **Add to .env file:**
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

## For Production (Netlify)

1. **Restrict your API key** (important for security):
   - In Google Cloud Console, click on your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add these referrers:
     ```
     https://candycruffs.ca/*
     https://www.candycruffs.ca/*
     https://*.netlify.app/*
     ```

2. **Add to Netlify:**
   - Go to your Netlify site settings
   - Navigate to "Environment variables"
   - Add: `VITE_GOOGLE_MAPS_API_KEY` = your_api_key

3. **Redeploy** your site

## Free Tier Limits

- **$200/month** in free credits
- **Autocomplete requests**: ~28,000 per month free
- More than enough for your needs!

## Testing

Try searching for: `5509 35 ave NW edmonton, alberta`
It should now appear in the autocomplete suggestions! 🎉
