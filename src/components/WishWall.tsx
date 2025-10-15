import { useEffect, useState } from 'react';
import { ThumbsUp, Sparkles } from 'lucide-react';
import { fetchPosts, upvotePost, subscribeToPostChanges } from '../services/posts';
import { Post } from '../lib/supabase';

export function WishWall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  const loadPosts = async () => {
    const { data, error: fetchError } = await fetchPosts();

    if (fetchError) {
      setError('Failed to load wishes. Please refresh the page.');
      setLoading(false);
      return;
    }

    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();

    const unsubscribe = subscribeToPostChanges(() => {
      loadPosts();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpvote = async (post: Post) => {
    if (upvotingIds.has(post.id)) return;

    setUpvotingIds(prev => new Set(prev).add(post.id));

    const { error: upvoteError } = await upvotePost(post.id, post.upvotes);

    setUpvotingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(post.id);
      return newSet;
    });

    if (upvoteError) {
      console.error('Failed to upvote:', upvoteError);
      return;
    }

    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id ? { ...p, upvotes: p.upvotes + 1 } : p
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600 text-lg">No wishes yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
        >
          <p className="text-gray-800 text-lg leading-relaxed mb-4">
            {post.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {formatDate(post.created_at)}
            </span>
            <button
              onClick={() => handleUpvote(post)}
              disabled={upvotingIds.has(post.id)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Upvote this wish (${post.upvotes} upvotes)`}
            >
              <ThumbsUp size={18} />
              <span className="font-semibold">{post.upvotes}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
