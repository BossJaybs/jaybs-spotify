# Spotify App Credentials Setup

To integrate Spotify Web API and Playback SDK, you need to set up a Spotify application and obtain credentials.

## Step 1: Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one if you don't have it)
3. Accept the terms and conditions

## Step 2: Create a New App

1. Click "Create an App"
2. Fill in the app details:
   - **App name**: Your app name (e.g., "Spotify Clone")
   - **App description**: Brief description of your app
   - **Redirect URI**: Add `http://localhost:3000/api/auth/callback/spotify` (for local development)
   - **Website**: Your website URL (optional)

## Step 3: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: A unique identifier for your app
- **Client Secret**: A secret key for server-side authentication

## Step 4: Enable Web Playback SDK

1. In your app dashboard, go to "Settings"
2. Under "Web Playback SDK", toggle it ON
3. Note: Your app must be in "Development" mode to use the Web Playback SDK

## Step 5: Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Replace `your_client_id_here` and `your_client_secret_here` with the actual values from your Spotify app.

For `NEXTAUTH_SECRET`, generate a random string (you can use `openssl rand -base64 32` in terminal).

## Step 6: Update Redirect URIs (Production)

When deploying to production, update the Redirect URI in your Spotify app settings to match your production domain.

## Important Notes

- Keep your Client Secret secure and never expose it in client-side code
- The Web Playback SDK only works with Spotify Premium accounts
- For development, ensure your app is in Development mode
- Rate limits apply to the Spotify API (typically 25 requests per 30 seconds for most endpoints)