# Pay0.Shop Payment Integration Guide

This guide explains how to set up and configure the Pay0.Shop payment integration for the YouthPargati website.

## 1. Configuration

### API Key Setup
1. Open the file `src/lib/payment.js`
2. Pay0.Shop API key e694ab0346cf984568f7e52caebbd07e
3. Replace `https://mywebsite.com/payment-success` with your actual success URL

### For Production (Recommended)
Instead of hardcoding the values, use environment variables:

1. Create a `.env` file in the root directory:
```
VITE_PAY0_SHOP_API_KEY=your_actual_api_key_here
VITE_PAYMENT_SUCCESS_URL=https://yourwebsite.com/payment-success
```

2. Update `src/lib/payment.js` to use environment variables:
```javascript
const PAY0_SHOP_API_KEY = import.meta.env.VITE_PAY0_SHOP_API_KEY
const REDIRECT_URL = import.meta.env.VITE_PAYMENT_SUCCESS_URL
```

## 2. How It Works

### Payment Flow
1. User clicks "Buy Now" on a package
2. If user is not logged in, they are prompted to log in
3. User details are fetched from the database
4. A payment order is created with Pay0.Shop
5. Order details are saved to the purchases table
6. User is redirected to the Pay0.Shop payment page
7. After payment, user is redirected to the success page

### Data Saved
- Order information is stored in the `purchases` table
- Commission is automatically calculated (10% of package price)
- Transaction ID is saved for reference

## 3. Button Behavior Changes

### Home Page
- "View Courses" button changed to "Buy Now"
- Clicking the button initiates the payment process
- Button shows "Processing..." during payment creation

### Package Courses Page
- "View Course" button changed to "Buy Package to Access" (disabled)
- Added "Buy This Package Now" button at the top
- Clicking the button initiates the payment process

## 4. Files Modified

1. `src/pages/Home.jsx` - Added payment integration to package cards
2. `src/pages/PackageCourses.jsx` - Added payment integration to package view
3. `src/lib/payment.js` - New file with payment functions
4. `src/pages/PaymentSuccess.jsx` - New success page
5. `src/App.jsx` - Added route for payment success page

## 5. Testing

1. Start the development server: `npm run dev`
2. Navigate to the home page
3. Click "Buy Now" on any package
4. If not logged in, log in with a test account
5. Complete the payment process on the Pay0.Shop page
6. Verify the purchase appears in the student dashboard

## 6. Troubleshooting

### Common Issues
1. **API Key Not Set**: Ensure you've replaced the placeholder API key
2. **Redirect URL Mismatch**: Make sure the redirect URL matches what's configured in Pay0.Shop
3. **CORS Errors**: Ensure your domain is whitelisted in Pay0.Shop settings

### Logs
Check the browser console and server logs for any error messages during payment processing.