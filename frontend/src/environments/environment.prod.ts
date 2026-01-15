export const environment = {
  production: true,
  // Use Vercel environment variable if available, otherwise fallback
  // Set NG_APP_API_URL in Vercel dashboard: https://your-backend.onrender.com/api
  apiUrl: (typeof process !== 'undefined' && process.env && process.env['NG_APP_API_URL']) 
    ? process.env['NG_APP_API_URL'] 
    : 'https://your-backend-url.onrender.com/api'
};
