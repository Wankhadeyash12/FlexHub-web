# FlexHub Deployment Checklist

## Backend on Render
1. Push repo to GitHub.
2. Create a Render Web Service.
3. Use build command: npm install
4. Use start command: npm start
5. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - BASE_URL
   - PORT
6. Deploy.
7. Verify: https://your-render-url/api/health

## Frontend on Vercel
1. Deploy the static frontend files or a frontend repo.
2. Add this script before the API script in pages:
   <script>
     window.__API_BASE_URL__ = 'https://your-render-url/api';
   </script>
3. Redeploy.
4. Verify login and registration.

## Database
- Use MongoDB Atlas for deployment.
- Update MONGODB_URI to the Atlas connection string.

## Notes
- The app is ready to run as a split deployment: Render backend + Vercel frontend.
- This is the easiest deployment approach for the current project structure.
