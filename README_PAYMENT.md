# Payment Integration Setup

## Environment Variables

To properly configure the Pay0.Shop payment integration, you need to set up the following environment variables:

### For Local Development (.env file):
```
VITE_PAY0_SHOP_API_KEY=your_actual_api_key_here
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success
```

### For Production (Netlify Environment Variables):
Set these in your Netlify project settings:
- `PAY0_SHOP_API_KEY` (server-side, for Netlify functions)
- `VITE_PAY0_SHOP_API_KEY` (client-side, for frontend)
- `VITE_PAYMENT_SUCCESS_URL` (client-side, for frontend)

## Troubleshooting

### Common Issues:

1. **500 Error from Netlify Function**
   - Check that `PAY0_SHOP_API_KEY` is set in Netlify environment variables
   - Verify the API key is correct and active

2. **Payment URL Not Found**
   - Check the Pay0.Shop API response format
   - Verify the API key has proper permissions

3. **CORS Errors**
   - Ensure the domain is whitelisted in Pay0.Shop settings
   - Check that Netlify function has proper CORS headers

### Debugging Steps:

1. Check browser console for detailed error messages
2. Check Netlify function logs for server-side errors
3. Verify environment variables are correctly set
4. Test the Pay0.Shop API directly with curl or Postman

### Testing:

1. Start the development server: `npm run dev`
2. Navigate to a package and click "Buy Now"
3. Complete the payment flow
4. Verify the purchase appears in the database