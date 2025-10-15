# Crowd Wish Wall - Deployment Guide

## Overview

Crowd Wish Wall is a fully functional anonymous wish-sharing application built with React and Supabase. Users can post wishes anonymously, view all wishes in reverse chronological order, and upvote wishes they support.

## Architecture

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Real-time**: Supabase Realtime for live updates
- **Deployment**: Static hosting (Vercel, Netlify, or similar)

## Features

✅ Anonymous posting - no login required
✅ Real-time updates when new wishes are posted
✅ Upvoting system with optimistic UI updates
✅ Reverse chronological sorting
✅ Responsive design for mobile and desktop
✅ Character limit (500 chars per wish)
✅ Relative timestamps (e.g., "5m ago", "2h ago")

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account (database already configured)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables**:
   The `.env` file is already configured with your Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Database setup**:
   The database migration has already been applied with the following schema:

   - Table: `posts`
     - `id` (uuid, primary key)
     - `content` (text, max 500 chars)
     - `upvotes` (integer, defaults to 0)
     - `created_at` (timestamp)

   - Row Level Security (RLS) is enabled with public access policies:
     - Anyone can read posts
     - Anyone can create posts
     - Anyone can upvote posts

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   ```

## Deployment Instructions

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

   Follow the prompts:
   - Link to existing project or create new one
   - Vercel will detect Vite automatically
   - Environment variables are already in `.env` and will be used

3. **Set environment variables in Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy
   ```

   - Choose "Create & configure a new site"
   - Select your team
   - Site name: choose a unique name
   - Publish directory: `dist`

4. **Set environment variables**:
   ```bash
   netlify env:set VITE_SUPABASE_URL "your-supabase-url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
   ```

5. **Deploy to production**:
   ```bash
   netlify deploy --prod
   ```

### Deploy to Other Platforms

The app is a standard Vite/React application. To deploy to any static hosting:

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to your hosting provider

3. Ensure environment variables are set in your hosting platform's dashboard

## Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── PostForm.tsx        # Anonymous post submission form
│   │   └── WishWall.tsx        # Display all wishes with upvoting
│   ├── services/
│   │   └── posts.ts            # API service layer for posts
│   ├── lib/
│   │   └── supabase.ts         # Supabase client configuration
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── supabase/
│   └── migrations/             # Database migrations
├── .env                        # Environment variables
├── package.json                # Dependencies and scripts
└── vite.config.ts             # Vite configuration
```

## API Documentation

### Database Schema

**posts table**:
```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  upvotes integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

### Service Functions

**createPost(content: string)**
- Creates a new anonymous post
- Returns: `{ data: Post | null, error: Error | null }`

**fetchPosts()**
- Retrieves all posts in reverse chronological order
- Returns: `{ data: Post[] | null, error: Error | null }`

**upvotePost(postId: string, currentUpvotes: number)**
- Increments upvote count for a specific post
- Returns: `{ data: Post | null, error: Error | null }`

**subscribeToPostChanges(callback: () => void)**
- Subscribes to real-time changes in the posts table
- Returns: Cleanup function to unsubscribe

## Testing

To test the application:

1. **Submit a wish**: Enter text and click "Post Wish"
2. **View wishes**: All wishes appear in newest-first order
3. **Upvote**: Click the upvote button on any wish
4. **Real-time**: Open the app in two browser windows and see updates propagate

## Troubleshooting

**Issue**: Posts don't appear after submission
- Check browser console for errors
- Verify Supabase environment variables are correct
- Check Supabase dashboard to confirm RLS policies are active

**Issue**: Upvotes don't work
- Check network tab for failed requests
- Verify RLS policies allow UPDATE operations

**Issue**: Build fails
- Run `npm run typecheck` to check for TypeScript errors
- Ensure all dependencies are installed: `npm install`

## Security Notes

- All posts are publicly accessible (by design)
- No authentication required (anonymous by design)
- RLS policies prevent unauthorized database modifications
- Supabase anon key is safe to expose in frontend code
- Consider adding rate limiting for production use

## Future Enhancements

Potential features to add:
- Reporting/moderation system
- Categories or tags for wishes
- Search and filter functionality
- Sharing wishes on social media
- Daily/weekly trending wishes
- Anonymous comments on wishes

## License

MIT License - feel free to use this code for your own projects!
