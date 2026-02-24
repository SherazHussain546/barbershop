# Barber shop | Premium Barbering

A high-end barbershop platform featuring AI style recommendations, online booking, and a managed blog system.

## Deployment Guide

### GitHub Setup
Follow these steps to push your code to GitHub:

1. **Initialize and Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Branch and Remote**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SherazHussain546/barbershop.git
   ```

3. **Push**:
   ```bash
   git push -u origin main
   ```

*Note: The `.env` and `src/firebase/config.ts` files are ignored via `.gitignore` for security. You will need to manually configure these on your hosting provider.*

### Netlify Deployment
1. Connect your repository to Netlify.
2. The `netlify.toml` file will automatically configure the build settings.
3. **Important**: You must manually add your environment variables in the Netlify dashboard:
   - Go to **Site Settings** > **Build & deploy** > **Environment variables**.
   - Add the variables found in your `.env` file (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).

## Features
- **AI Style Concierge**: Uses Google Gemini to suggest the perfect look.
- **Artisan Management**: Roster control for master barbers.
- **Guild Journal**: AI-assisted blog generation for SEO.
- **Manual Booking**: Admin capability to enlist clients directly into the schedule.
