# Candy Cruffs Deployment Guide

This guide will walk you through deploying the Candy Cruffs website to **candycruffs.ca** with frontend on Netlify and backend on Fly.io.

## Prerequisites Checklist

- [x] Netlify account created
- [x] Fly.io account created
- [x] Gmail app password set up
- [x] GoDaddy domain: candycruffs.ca
- [ ] Fly.io CLI installed
- [ ] Git repository initialized (optional but recommended)

---

## Part 1: Deploy Backend to Fly.io

### Step 1: Install Fly.io CLI

```powershell
# Run this in PowerShell
irm https://fly.io/install.ps1 | iex
```

After installation, close and reopen your terminal, then verify:
```powershell
fly version
```

### Step 2: Login to Fly.io

```powershell
fly auth login
```

This will open a browser window for authentication.

### Step 3: Deploy Backend

Navigate to your project directory and run:

```powershell
cd c:\Users\MuhammadHaris\.gemini\antigravity\scratch\freeze-dry-website

# Launch the app (this will create and deploy it)
fly launch --no-deploy
```

When prompted:
- **App Name**: Enter `candy-cruffs-api` (or your preferred name)
- **Region**: Choose the closest to your users (e.g., `sea` for Seattle if targeting North America)
- **PostgreSQL**: No
- **Redis**: No

### Step 4: Set Environment Variables

```powershell
fly secrets set EMAIL_USER=harismuhammad455@gmail.com
fly secrets set EMAIL_PASS=your-app-password-here
```

**IMPORTANT**: Replace `your-app-password-here` with your actual Gmail app password!

### Step 5: Deploy

```powershell
fly deploy
```

### Step 6: Verify Backend

After deployment completes, test the health endpoint:

```powershell
fly open /health
```

You should see: `{"status":"ok","timestamp":"..."}`

### Step 7: Get Your Backend URL

```powershell
fly status
```

Your backend URL will be something like: `https://candy-cruffs-api.fly.dev`

---

## Part 2: Deploy Frontend to Netlify

### Option A: Deploy via Netlify UI (Recommended for First Time)

1. **Build the production version locally:**

```powershell
npm run build
```

2. **Go to Netlify:**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Deploy manually"
   - Drag and drop the `dist` folder

3. **Configure Environment Variable:**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://candy-cruffs-api.fly.dev` (use your actual Fly.io URL)

4. **Trigger Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

### Option B: Deploy via Git (Recommended for Future Updates)

1. **Initialize Git (if not already):**

```powershell
git init
git add .
git commit -m "Initial commit"
```

2. **Push to GitHub:**
   - Create a repository on GitHub
   - Follow GitHub's instructions to push

3. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add environment variable: `VITE_API_URL` = `https://candy-cruffs-api.fly.dev`

---

## Part 3: Configure Custom Domain on Netlify

1. **In Netlify Dashboard:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `candycruffs.ca`
   - Click "Verify"

2. **Netlify will show you DNS records to add**

You'll typically need to add a CNAME or A records. Netlify will show something like:
- **Type**: A
- **Name**: @ (or leave blank)
- **Value**: `75.2.60.5` (example, use the IP Netlify provides)

And for www:
- **Type**: CNAME
- **Name**: www
- **Value**: `your-site-name.netlify.app`

---

## Part 4: Configure Custom Subdomain for Backend (api.candycruffs.ca)

### Step 1: Add Custom Domain to Fly.io

```powershell
fly certs add api.candycruffs.ca
```

Fly.io will provide you with DNS records to add.

### Step 2: Add DNS Records in GoDaddy

1. **Login to GoDaddy:**
   - Go to https://dcc.godaddy.com/domains
   - Click on `candycruffs.ca`
   - Go to DNS settings

2. **Add Backend DNS Record:**

Fly.io will tell you what to add, but it's typically:
- **Type**: CNAME
- **Name**: api
- **Value**: `candy-cruffs-api.fly.dev` (or the CNAME Fly.io provides)
- **TTL**: 3600 (default)

3. **Add Frontend DNS Records (from Part 3):**

Follow the DNS records Netlify provided in Part 3.

### Step 3: Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours. You can check status with:

```powershell
nslookup candycruffs.ca
nslookup api.candycruffs.ca
```

### Step 4: Verify SSL Certificates

Fly.io will automatically provision SSL certificates. Check status:

```powershell
fly certs check api.candycruffs.ca
```

---

## Part 5: Update Frontend API URL

Once your backend is live at `api.candycruffs.ca`:

1. **Update `.env.production`:**

```
VITE_API_URL=https://api.candycruffs.ca
```

2. **Update Netlify Environment Variable:**
   - Go to Netlify Site settings → Environment variables
   - Edit `VITE_API_URL` to: `https://api.candycruffs.ca`

3. **Redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

---

## Part 6: Testing & Verification

### Test Checklist

1. **Frontend Loads:**
   - Visit `https://candycruffs.ca`
   - All pages should load correctly
   - Check mobile responsiveness

2. **Backend Health Check:**
   ```powershell
   curl https://api.candycruffs.ca/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Order Form Submission:**
   - Go to `https://candycruffs.ca/order`
   - Add items to cart
   - Fill out the form
   - Submit
   - Check your email (harismuhammad455@gmail.com) for the order notification

4. **HTTPS Everywhere:**
   - Ensure both `candycruffs.ca` and `api.candycruffs.ca` use HTTPS
   - No mixed content warnings

5. **www Redirect:**
   - Verify `www.candycruffs.ca` redirects to `candycruffs.ca`

---

## Troubleshooting

### Backend not receiving orders:
```powershell
# Check backend logs
fly logs
```

### Email not sending:
- Verify Gmail app password is correct
- Check Fly.io secrets:
  ```powershell
  fly secrets list
  ```

### Frontend can't reach backend:
- Check browser console for CORS errors
- Verify `VITE_API_URL` environment variable in Netlify
- Test backend health endpoint directly

### DNS not resolving:
- Wait longer (up to 48 hours)
- Use `nslookup` or https://dnschecker.org to verify propagation

---

## Useful Commands Reference

```powershell
# Backend (Fly.io)
fly logs                          # View logs
fly status                        # Check app status
fly scale count 1                 # Scale to 1 instance (if auto-scaling is off)
fly secrets list                  # List environment variables
fly deploy                        # Redeploy after changes

# Frontend (Netlify)
npm run build                     # Build locally before manual deploy
```

---

## Maintenance & Updates

### Updating Backend:
1. Make changes to server code
2. Run `fly deploy` from project directory
3. Fly.io will build and deploy automatically

### Updating Frontend:
- **If using Git**: Just push to GitHub, Netlify auto-deploys
- **If manual**: Run `npm run build` and drag `dist` folder to Netlify

---

## Cost Breakdown

- **Domain (GoDaddy)**: You've already purchased
- **Netlify**: Free tier (100GB bandwidth, unlimited sites)
- **Fly.io**: Free tier includes:
  - 3 shared-cpu-1x VMs with 256MB RAM
  - 3GB persistent volume storage
  - 160GB outbound data transfer

For a small to medium traffic site, both should stay within free tiers! 🎉

---

## Next Steps After Deployment

1. **Test thoroughly** - Click through all pages and features
2. **Monitor backend logs** - `fly logs` to watch for errors
3. **Set up monitoring** - Consider adding Sentry or LogRocket for error tracking
4. **SEO optimization** - Submit sitemap to Google Search Console
5. **Social media** - Share your live site!

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Fly.io Docs**: https://fly.io/docs
- **GoDaddy DNS Help**: https://www.godaddy.com/help/dns-management-680

---

**You're all set!** 🚀 Follow this guide step by step and your Candy Cruffs website will be live!
