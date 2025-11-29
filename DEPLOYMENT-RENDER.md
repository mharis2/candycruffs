# Candy Cruffs Deployment Guide - Render + Netlify

Quick and easy deployment using Render (backend) and Netlify (frontend).

## Part 1: Deploy Backend to Render (5 minutes)

### Step 1: Push Code to GitHub (if not already)

```powershell
# Initialize git if needed
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

> **Don't have Git setup?** You can also deploy by uploading a ZIP file in Render's UI.

### Step 2: Deploy on Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Sign in or create account

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (or use "Deploy an existing image/public repo")
   - Select your `freeze-dry-website` repository

3. **Configure Service:**
   - **Name**: `candy-cruffs-api`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: Free

4. **Add Environment Variables:**
   
   Click "Advanced" → Add environment variables:
   
   | Key | Value |
   |-----|-------|
   | `EMAIL_USER` | `harismuhammad455@gmail.com` |
   | `EMAIL_PASS` | Your Gmail App Password |
   | `PORT` | `3001` |

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your backend will be live at: `https://candy-cruffs-api.onrender.com`

### Step 3: Verify Backend

Once deployed, test the health endpoint:

Visit: `https://candy-cruffs-api.onrender.com/health`

You should see: `{"status":"ok","timestamp":"..."}`

---

## Part 2: Deploy Frontend to Netlify (5 minutes)

### Option A: Manual Deploy (Fastest)

1. **Build Production Version:**
   ```powershell
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Deploy manually"
   - Drag the `dist` folder

3. **Add Environment Variable:**
   - Site settings → Environment variables → Add variable
   - Key: `VITE_API_URL`
   - Value: `https://candy-cruffs-api.onrender.com`

4. **Redeploy:**
   - Deploys tab → "Trigger deploy" → "Deploy site"

### Option B: Git Deploy (Better for Updates)

1. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   
2. **Build Settings:**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Environment variables**: 
     - Key: `VITE_API_URL`
     - Value: `https://candy-cruffs-api.onrender.com`

3. **Deploy:**
   - Click "Deploy site"
   - Wait 2-3 minutes

---

## Part 3: Configure Custom Domain (candycruffs.ca)

### A. Frontend Domain (candycruffs.ca)

1. **In Netlify:**
   - Site settings → Domain management → Add custom domain
   - Enter: `candycruffs.ca`
   - Netlify will show DNS records

2. **In GoDaddy:**
   - Go to https://dcc.godaddy.com/domains
   - Click `candycruffs.ca` → DNS settings
   - Add the DNS records Netlify provided

   **Typical records:**
   - Type: `A` | Name: `@` | Value: `75.2.60.5` (use IP Netlify gives you)
   - Type: `CNAME` | Name: `www` | Value: `your-site.netlify.app`

### B. Backend Subdomain (api.candycruffs.ca)

1. **In Render:**
   - Go to your `candy-cruffs-api` service
   - Settings → Custom Domains
   - Click "Add Custom Domain"
   - Enter: `api.candycruffs.ca`
   - Render will show you a CNAME record

2. **In GoDaddy:**
   - DNS settings → Add Record
   - Type: `CNAME`
   - Name: `api`
   - Value: (the CNAME Render provided, usually `candy-cruffs-api.onrender.com`)
   - TTL: `3600`

3. **Wait for DNS Propagation:**
   - Can take 5 minutes to 48 hours
   - Check: `nslookup api.candycruffs.ca`

4. **Update Frontend API URL:**
   - In Netlify: Environment variables → Edit `VITE_API_URL`
   - New value: `https://api.candycruffs.ca`
   - Trigger deploy → "Clear cache and deploy site"

---

## Part 4: Testing

### Test Checklist

✅ **Backend Health:**
```powershell
curl https://api.candycruffs.ca/health
```

✅ **Frontend Loads:**
- Visit `https://candycruffs.ca`
- Check all pages

✅ **Order Form:**
- Go to `/order`
- Add items
- Submit order
- Check email: harismuhammad455@gmail.com

✅ **HTTPS:**
- Both domains use HTTPS automatically
- No mixed content warnings

---

## Important Notes

> **Render Free Tier Limitation:**
> Free tier services spin down after 15 minutes of inactivity. The first request after inactivity may take 30-60 seconds to respond. This is normal!

> **Environment Variables:**
> Make sure your Gmail App Password is added correctly in Render's environment variables.

> **Automatic Deploys:**
> If you connected via Git, both Render and Netlify will auto-deploy on new commits to `main` branch.

---

## Troubleshooting

**Backend not responding:**
- Check Render logs: Dashboard → Your service → Logs tab
- Verify environment variables are set

**Email not sending:**
- Verify `EMAIL_PASS` is your Gmail App Password (not regular password)
- Check Render logs for errors

**Frontend can't reach backend:**
- Verify `VITE_API_URL` environment variable in Netlify
- Check browser console for CORS errors
- Make sure backend is running (visit health endpoint)

**DNS not resolving:**
- Wait longer (up to 48 hours)
- Use https://dnschecker.org to check propagation
- Verify CNAME/A records are correct in GoDaddy

---

## Useful Commands

```powershell
# Check DNS
nslookup candycruffs.ca
nslookup api.candycruffs.ca

# Test backend
curl https://api.candycruffs.ca/health

# Rebuild frontend
npm run build
```

---

## Cost Summary

- **Netlify**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month, auto-sleep after 15min inactivity)
- **Domain**: Already purchased from GoDaddy

Both stay free for small to medium traffic! 🎉

---

## Next Steps After Deployment

1. ✅ Test order form thoroughly
2. ✅ Monitor backend logs in Render
3. ✅ Submit sitemap to Google Search Console
4. ✅ Share your live site!

**You're all set!** 🚀
