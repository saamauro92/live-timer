# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your Live Timer application.

## Prerequisites

- Google Cloud Console account
- Access to your project's environment variables

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Choose **Web application** as the application type
6. Configure the OAuth consent screen if prompted:
   - Add your app name, user support email, and developer contact information
   - Add authorized domains (your production domain)
   - Add scopes: `email` and `profile`

## Step 2: Configure OAuth Client

1. **Name**: Give your OAuth client a descriptive name (e.g., "Live Timer Web Client")
2. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `http://localhost:3001` (for backend development)
   - Your production domain (e.g., `https://yourdomain.com`)
3. **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourdomain.com`)

## Step 3: Get Your Credentials

After creating the OAuth client, you'll receive:

- **Client ID**: A long string starting with something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: A shorter string (keep this secure!)

## Step 4: Configure Environment Variables

### Backend Environment Variables

Add these to your `.env` file in the root directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

### Frontend Environment Variables

Add these to your `.env` file in the `live-timer-frontend` directory:

```env
# Google OAuth Configuration
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 5: Test the Integration

1. Start your backend server:

   ```bash
   npm run dev
   ```

2. Start your frontend server:

   ```bash
   cd live-timer-frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click the "Sign in with Google" button
5. Complete the Google OAuth flow
6. You should be redirected to the rooms page upon successful authentication

## Step 6: Production Deployment

### Backend Production Environment

Update your production environment variables:

```env
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
```

### Frontend Production Environment

Update your production environment variables:

```env
NUXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
```

### Google Cloud Console Production Setup

1. Update your OAuth client in Google Cloud Console:
   - Add your production domain to **Authorized JavaScript origins**
   - Add your production domain to **Authorized redirect URIs**
2. Update your OAuth consent screen with production information
3. Submit for verification if you plan to make your app public

## Security Considerations

1. **Never expose your Client Secret** in frontend code
2. **Use HTTPS in production** for all OAuth flows
3. **Validate tokens on the backend** before trusting them
4. **Implement proper error handling** for OAuth failures
5. **Use environment variables** for all sensitive configuration

## Troubleshooting

### Common Issues

1. **"Invalid client" error**:

   - Check that your Client ID is correct
   - Ensure the domain is added to Authorized JavaScript origins

2. **"Redirect URI mismatch" error**:

   - Verify the redirect URI in Google Cloud Console matches your application URL

3. **"Access blocked" error**:

   - Check your OAuth consent screen configuration
   - Ensure your app is not in testing mode if you need external users

4. **CORS errors**:
   - Verify your backend CORS configuration includes your frontend domain
   - Check that the API base URL is correctly configured

### Debug Mode

To enable debug logging, add this to your frontend environment:

```env
NUXT_PUBLIC_DEBUG=true
```

This will log additional information about the OAuth flow in the browser console.

## Features Implemented

✅ **Backend Integration**:

- Google OAuth token verification
- User creation/linking with Google accounts
- JWT token generation for authenticated users
- Account linking for existing users

✅ **Frontend Integration**:

- Google Sign-In button on login and register pages
- Automatic token handling and user state management
- Error handling and user feedback
- Responsive design with dark mode support

✅ **Security Features**:

- Server-side token verification
- Secure cookie handling
- CORS protection
- Rate limiting on OAuth endpoints

## Next Steps

1. **Email Verification**: Google OAuth users are automatically verified
2. **Profile Management**: Users can update their profile information
3. **Account Linking**: Existing users can link their Google account
4. **Social Features**: Consider adding other OAuth providers (GitHub, Microsoft, etc.)

## Support

If you encounter issues with the Google OAuth setup:

1. Check the browser console for JavaScript errors
2. Verify your environment variables are correctly set
3. Ensure your Google Cloud Console configuration matches your application URLs
4. Test with a fresh browser session to avoid cached authentication states
