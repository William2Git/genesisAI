# Google Maps on Vercel

## 1. Add environment variables in Vercel

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`  
     **Value:** (your Google Maps API key)  
     **Environment:** Production (and Preview if you use it)
   - **Name:** `VITE_GOOGLE_MAP_ID`  
     **Value:** (your Map ID)  
     **Environment:** Production (and Preview if you use it)
3. **Redeploy** the project (Deployments → ⋮ → Redeploy, or push a new commit).

## 2. Allow your Vercel domain in Google Cloud

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your **API key** (the one used for this app)
3. Under **Application restrictions** → **HTTP referrers (websites)** add:
   - `https://*.vercel.app/*`
   - If you use a custom domain: `https://yourdomain.com/*`
4. Under **API restrictions** ensure **Maps JavaScript API** (and **Places API**, **Directions API** if used) are allowed
5. Save

Then redeploy on Vercel. Maps should work on your live URL.
