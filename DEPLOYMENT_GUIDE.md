# FlexHub - Vercel Deployment Guide

## Prerequisites
- GitHub account (to push code)
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

---

## STEP 1: Set Up MongoDB Atlas (Cloud Database)

This is required because Vercel serverless functions cannot access localhost databases.

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up for Free"
3. Complete registration and create organization

### 1.2 Create a Cluster
1. Click "Create a Deployment"
2. Select "FREE" (M0 Sandbox)
3. Choose your region (closest to your users)
4. Click "Create Deployment"
5. Wait for cluster to be created (5-10 minutes)

### 1.3 Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Enter username: `flexhub_user`
4. Password: Click "Autogenerate Secure Password" (save this!)
5. Click "Add User"

### 1.4 Get Connection String
1. Click "Databases" in left sidebar
2. Click "Connect" button on your cluster
3. Select "Drivers" tab
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user credentials
6. Replace `myFirstDatabase` with `flexhub`

**Example format:**
```
mongodb+srv://flexhub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flexhub?retryWrites=true&w=majority
```

**Save this string - you'll need it in Step 3!**

---

## STEP 2: Prepare Your Code for Deployment

### 2.1 Update Your .env File (Local Development Only)
Create a `.env` file in your project root with:
```
MONGODB_URI=mongodb+srv://flexhub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flexhub?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
BASE_URL=http://localhost:3000
PORT=3000
```

**⚠️ IMPORTANT: Never commit .env to git - it's in .gitignore**

### 2.2 Commit Changes to Git
```bash
git add .env.example vercel.json .vercelignore
git commit -m "Setup Vercel deployment configuration"
git push origin master
```

---

## STEP 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Click "Import Git Repository"
4. Search for your repository (FlexHub)
5. Click "Import"

### 3.2 Configure Environment Variables
1. On the setup page, click "Environment Variables"
2. Add each variable one by one:

| Variable Name | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1.4 |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RAZORPAY_KEY_ID` | Your Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay test secret |
| `BASE_URL` | Will be your Vercel domain (get after deploy) |

3. Click "Deploy"

### 3.3 Monitor Deployment
1. Vercel will build and deploy automatically
2. Wait for "Ready" status (should take 2-3 minutes)
3. You'll get a deployment URL like: `https://flexhub-xxxxx.vercel.app`

---

## STEP 4: Update BASE_URL Environment Variable

After deployment gets your domain:

1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Find `BASE_URL` variable
4. Change value to: `https://flexhub-xxxxx.vercel.app` (your actual domain)
5. Redeploy: Click "Deployments" → Latest → Menu → "Redeploy"

---

## STEP 5: Test Your Deployment

1. Visit: `https://flexhub-xxxxx.vercel.app`
2. Test these features:
   - ✅ Home page loads
   - ✅ Login page works
   - ✅ Register new user
   - ✅ Create an event
   - ✅ Browse events
   - ✅ Make a payment (test mode)

---

## Troubleshooting

### "MongoDB connection failed"
- Check MONGODB_URI is correct
- Ensure IP whitelist allows Vercel (in MongoDB Atlas → Network Access → Allow All)

### "Cannot find module"
- Check all dependencies in package.json are installed
- Run `npm install` locally and commit package-lock.json

### "500 Internal Server Error"
- Check Vercel Function logs: Dashboard → Deployments → Latest → Function Logs
- Check environment variables are set correctly

### "API calls not working"
- Ensure API_BASE_URL in client/js/api.js is correct
- Open browser console and check for CORS errors

---

## Important Security Notes

- ✅ `.env` is in `.gitignore` - never commit it
- ✅ Store secrets in Vercel Environment Variables only
- ✅ Use test Razorpay keys for staging, production keys in production
- ✅ Change JWT_SECRET to a strong random value
- ✅ MongoDB Atlas firewall should allow Vercel IPs

---

## Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://account.mongodb.com/account/login
- Razorpay Dashboard: https://dashboard.razorpay.com/

---

## Next Steps After Deployment

1. Set up custom domain (if you have one)
2. Enable automatic deployments on git push
3. Set up monitoring/logging in Vercel dashboard
4. Consider upgrading MongoDB Atlas if needed
