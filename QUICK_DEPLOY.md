# ⚡ FlexHub - Quick Deployment Steps

## What I Changed:
✅ Updated `.env.example` with proper structure  
✅ Enhanced `vercel.json` configuration  
✅ Created `.vercelignore` to exclude unnecessary files  
✅ Created `DEPLOYMENT_GUIDE.md` with detailed instructions  
✅ Created `setup-local.sh` for local setup  

---

## 5-STEP DEPLOYMENT CHECKLIST

### Step 1: MongoDB Atlas Setup (15 mins)
```
Go to: https://www.mongodb.com/cloud/atlas
1. Sign up / Log in
2. Create FREE cluster (M0 Sandbox)
3. Create database user (flexhub_user)
4. Get connection string with credentials
   Format: mongodb+srv://user:password@cluster.xxxxx.net/flexhub
✅ SAVE THIS STRING
```

### Step 2: Generate Strong JWT Secret
```bash
# Run this in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output - you'll need it
```

### Step 3: Push Code to GitHub
```bash
# Code is already committed, just verify:
git log --oneline | head -5

# If you need to push to GitHub:
git push origin master
```

### Step 4: Deploy to Vercel
```
Go to: https://vercel.com
1. Click "New Project"
2. Import your GitHub repository
3. Add Environment Variables (5 total):
   - MONGODB_URI: [Your MongoDB connection string from Step 1]
   - JWT_SECRET: [From Step 2]
   - RAZORPAY_KEY_ID: [Your test key]
   - RAZORPAY_KEY_SECRET: [Your test secret]
   - BASE_URL: [Will update after deploy]
4. Click "Deploy"
5. Wait for "Ready" status (2-3 minutes)
6. Note your domain: https://flexhub-xxxxx.vercel.app
```

### Step 5: Update BASE_URL & Whitelist IP
```
In Vercel Dashboard:
1. Settings → Environment Variables
2. Edit BASE_URL = https://flexhub-xxxxx.vercel.app
3. Redeploy

In MongoDB Atlas:
1. Network Access
2. Add IP Address
3. Select "Allow access from anywhere" (for testing)
4. Save
```

---

## Testing After Deployment

✅ Visit: https://flexhub-xxxxx.vercel.app  
✅ Test login/register  
✅ Create an event  
✅ Check browser console (F12) for errors  

---

## Files You Need:

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `DEPLOYMENT_GUIDE.md` | Full detailed guide (read if stuck) |
| `vercel.json` | Vercel configuration |
| `.vercelignore` | Files to skip deployment |

---

## Common Issues & Fixes:

| Problem | Solution |
|---------|----------|
| "MongoDB connection failed" | Check connection string in MONGODB_URI |
| "Cannot find module" | Run `npm install` locally |
| "500 error" | Check Vercel Function logs |
| "API not working" | Verify BASE_URL is set correctly |

---

## Support Links:

- 📖 Full Guide: Read `DEPLOYMENT_GUIDE.md`
- 🔧 Vercel Docs: https://vercel.com/docs
- 🗄️ MongoDB Atlas: https://docs.atlas.mongodb.com
- 💳 Razorpay: https://razorpay.com/docs

---

**That's it! You're ready to deploy! 🚀**
