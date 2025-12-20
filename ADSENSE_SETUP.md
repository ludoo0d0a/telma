# Google AdSense Setup Guide

This app has been configured with Google AdSense integration using environment variables. Follow these steps to start earning revenue:

## Step 1: Get Your AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign up for an account (if you don't have one)
3. Get your **Publisher ID** (format: `ca-pub-1234567890123456`)

## Step 2: Configure Your Publisher ID

1. Copy `.env.example` to `.env` (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and set your Publisher ID:
   ```env
   VITE_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXX
   ```
3. Replace `ca-pub-XXXXXXXXXXXXXXX` with your actual Publisher ID
4. **Important**: The `.env` file is already in `.gitignore` - never commit your actual AdSense ID to version control

## Step 3: Submit Your Site for Review

1. Add your site to your AdSense account
2. Wait for Google's approval (usually 1-2 weeks)
3. Once approved, ads will automatically start showing

## Step 4: (Optional) Create Ad Units

For better control and optimization, you can create specific ad units in AdSense:

1. Go to AdSense → Ads → By ad unit
2. Create new ad units (e.g., "Home Page Banner", "Train Page Rectangle")
3. Get the ad unit slot IDs
4. Update the `Ad` component usage to include `adSlot` prop:
   ```tsx
   <Ad adSlot="1234567890" format="rectangle" />
   ```

## Ad Placement

Ads have been strategically placed on:
- **Home page**: Top, middle, and bottom sections
- **Train page**: Search area, header, and results sections
- **Places page**: Search area and results sections
- **Trajet (Itinerary) page**: Search area and results sections

## Ad Formats

The app uses responsive ads that automatically adjust to screen size:
- `auto`: Fully responsive, adapts to container
- `horizontal`: Banner-style ads
- `rectangle`: 300x250 style ads
- `responsive`: Automatically sizes based on viewport

## Environment Variables

The app uses Vite environment variables. Important notes:
- Variables must be prefixed with `VITE_` to be exposed to the client
- The `.env` file is in `.gitignore` (never commit your actual AdSense ID)
- Use `.env.example` to document required variables
- **Restart your dev server** after changing `.env` file (Vite needs a restart to pick up new env vars)

## Testing

Before going live:
- Test on different screen sizes (mobile, tablet, desktop)
- Verify ads don't interfere with user experience
- Check that placeholder ads show when AdSense ID is not configured
- Make sure to restart your dev server after setting up `.env`

## Revenue Optimization Tips

1. **Placement**: Ads are already placed in high-visibility areas
2. **Content**: More content = more ad impressions
3. **Traffic**: Focus on SEO and user engagement to increase traffic
4. **Ad Balance**: Don't add too many ads - it can hurt user experience

## Troubleshooting

- **Ads not showing?**: Make sure your site is approved by AdSense and `.env` file has correct ID
- **Placeholder showing?**: 
  - Check that `VITE_GOOGLE_ADSENSE_ID` is set in `.env` file
  - Make sure you restarted your dev server after creating/updating `.env`
  - Verify the variable name is exactly `VITE_GOOGLE_ADSENSE_ID` (with `VITE_` prefix)
- **Low revenue?**: Focus on increasing traffic and user engagement
- **Environment variable not working?**: Remember that Vite requires the `VITE_` prefix and a server restart

## Support

For AdSense-specific issues, visit [AdSense Help Center](https://support.google.com/adsense)

