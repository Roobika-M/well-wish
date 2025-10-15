# 🌟 Crowd Wish Wall

A beautiful, anonymous wish-sharing platform where people can post their wishes and support others through upvotes. No login required, fully anonymous, and real-time.

## ✨ Features

- **Anonymous Posting**: Share your wishes without creating an account
- **Public Wish Wall**: Browse all wishes in reverse chronological order
- **Upvoting System**: Show support by upvoting wishes you resonate with
- **Real-time Updates**: See new wishes and upvotes appear instantly
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Character Limit**: 500 characters per wish to keep posts concise
- **Timestamps**: See when wishes were posted with relative timestamps

## 🚀 Quick Start

### Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies

## 📦 Project Structure

```
src/
├── components/
│   ├── PostForm.tsx    # Form to submit new wishes
│   └── WishWall.tsx    # Display and upvote wishes
├── services/
│   └── posts.ts        # API layer for database operations
├── lib/
│   └── supabase.ts     # Supabase client setup
└── App.tsx             # Main application component
```

## 🗄️ Database Schema

```sql
posts
├── id (uuid)           # Unique identifier
├── content (text)      # The wish content
├── upvotes (integer)   # Number of upvotes
└── created_at (timestamp) # When the wish was posted
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Public read access (anyone can view wishes)
- Public write access (anyone can post and upvote)
- No authentication required by design
- Supabase handles all security at the database level

## 📖 Usage

1. **Post a Wish**: Type your wish (up to 500 characters) and click "Post Wish"
2. **Browse Wishes**: Scroll through the wish wall to see what others have shared
3. **Upvote**: Click the upvote button to support wishes you like
4. **Real-time**: Watch as new wishes appear automatically

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (recommended)
- Netlify
- Other static hosting platforms

## 🧪 Testing

Open the app in multiple browser windows to test real-time functionality:

1. Post a wish in one window
2. See it appear instantly in other windows
3. Upvote in one window
4. Watch the count update in other windows

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

## 🤝 Contributing

This is a complete MVP application. Feel free to fork and extend it with:
- Moderation features
- Categories/tags
- Search functionality
- Social sharing
- Analytics

## 📄 License

MIT License - free to use for personal or commercial projects
