# Barber shop | Premium Barbering

A high-end barbershop platform featuring AI style recommendations, online booking, and a managed blog system.

## Deployment Guide

### GitHub Setup
1. Create a new repository on GitHub.
2. Initialize git: `git init`.
3. Add and commit files: `git add .` and `git commit -m "Initial commit"`.
4. Push to your repository. Note that `.env` and `src/firebase/config.ts` are ignored for security.

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
