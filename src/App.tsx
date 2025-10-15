import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PostForm } from './components/PostForm';
import { WishWall } from './components/WishWall';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="text-blue-600" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Crowd Wish Wall
            </h1>
            <Sparkles className="text-purple-600" size={40} />
          </div>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Share your wishes anonymously and support others by upvoting their dreams
          </p>
        </header>

        <div className="mb-12">
          <PostForm onPostCreated={handlePostCreated} />
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>Recent Wishes</span>
            <span className="text-sm font-normal text-gray-500">
              (newest first)
            </span>
          </h2>
          <WishWall key={refreshKey} />
        </div>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>All wishes are anonymous and public. Upvote to show support!</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
