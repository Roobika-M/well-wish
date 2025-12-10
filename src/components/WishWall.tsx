import { useEffect, useMemo, useState } from 'react';
import { ThumbsUp, Sparkles } from 'lucide-react';
import { fetchPosts, upvotePost, subscribeToPostChanges } from '../services/posts';
import { fetchComments, createComment, upvoteComment, Comment } from '../services/comments'; // Add comment services
import { Post } from '../lib/supabase';
import CommentForm from './CommentForm'; // Your comment form component

export function WishWall() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [commentingIds, setCommentingIds] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<'newest' | 'top' | 'comments'>('newest');
  const [nameFilter, setNameFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadPosts = async () => {
    const { data, error: fetchError } = await fetchPosts();
    if (fetchError) {
      setError('Failed to load wishes. Please refresh the page.');
      setLoading(false);
      return;
    }
    setPosts(data || []);
    setLoading(false);

    // Fetch comments for all posts
    const newCommentsMap: Record<string, Comment[]> = {};
    for (const post of data || []) {
      try {
        const comments = await fetchComments(post.id);
        newCommentsMap[post.id] = comments;
      } catch(_) {
        newCommentsMap[post.id] = [];
      }
    }
    setCommentsMap(newCommentsMap);
  };

  useEffect(() => {
    loadPosts();
    const unsubscribe = subscribeToPostChanges(loadPosts);
    return () => unsubscribe();
  }, []);

  const handleUpvote = async (post: Post) => {
    if (upvotingIds.has(post.id)) return;
    setUpvotingIds(prev => new Set(prev).add(post.id));
    const { error: upvoteError } = await upvotePost(String(post.id), Number(post.upvotes));
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

  const handleCommentAdded = async (postId: string) => {
    setCommentingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
    // Refresh comments for this post
    try {
      const comments = await fetchComments(postId);
      setCommentsMap(prev => ({ ...prev, [postId]: comments }));
    } catch {
      // ignore errors
    }
  };

  const handleCommentUpvote = async (postId: string, comment: Comment) => {
    if (commentingIds.has(comment.id)) return;
    setCommentingIds(prev => new Set(prev).add(comment.id));
    const { error } = await upvoteComment(comment.id, comment.upvotes);
    setCommentingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(comment.id);
      return newSet;
    });
    if (error) {
      console.error('Failed to upvote comment:', error);
      return;
    }
    setCommentsMap(prev => {
      const updatedComments = prev[postId].map(c =>
        c.id === comment.id ? { ...c, upvotes: c.upvotes + 1 } : c
      );
      return { ...prev, [postId]: updatedComments };
    });
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

  if (loading) return <p>Loading wishes...</p>;
  if (error) return <p>{error}</p>;
  if (posts.length === 0) return <p>No wishes yet. Be the first to share!</p>;

  const displayedPosts = useMemo(() => {
    const copy = [...posts];
    if (sortMode === 'newest') {
      return copy.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    if (sortMode === 'top') {
      return copy.sort((a, b) => (b.upvotes - a.upvotes));
    }
    // most commented
    return copy.sort((a, b) => {
      const aCount = (commentsMap[a.id] || []).length;
      const bCount = (commentsMap[b.id] || []).length;
      return bCount - aCount;
    });
  }, [posts, sortMode, commentsMap]);

  return (
    <div className="app-container">
      <div className="app-header">
        <Sparkles className="text-indigo-500" />
        <h2 className="app-title">Wish Wall</h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          <div className="inline-flex rounded-md overflow-hidden border bg-white">
            <button
              onClick={() => setSortMode('newest')}
              className={`px-3 py-1 text-sm ${sortMode === 'newest' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortMode('top')}
              className={`px-3 py-1 text-sm ${sortMode === 'top' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
            >
              Top
            </button>
            <button
              onClick={() => setSortMode('comments')}
              className={`px-3 py-1 text-sm ${sortMode === 'comments' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
            >
              Most commented
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
          placeholder="Check messages for a name (e.g. Amina)"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <button
          onClick={() => setActiveFilter(nameFilter.trim() || null)}
          className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
        >
          Check
        </button>
        <button
          onClick={() => { setNameFilter(''); setActiveFilter(null); }}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm"
        >
          Clear
        </button>
        {activeFilter && <div className="ml-auto text-sm text-gray-600">Showing messages for: <strong>{activeFilter}</strong></div>}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPosts
          .filter(p => {
            if (!activeFilter) return true;
            const recip = (p.recipient || '').toLowerCase();
            return recip === activeFilter.toLowerCase();
          })
          .map(post => (
          <article key={post.id} className="post-card">
            <p className="text-gray-800 mb-3">{post.content}</p>
            <div className="flex items-center justify-between gap-3">
              <small className="text-sm text-gray-500">{formatDate(post.created_at)}</small>
              <button
                onClick={() => handleUpvote(post)}
                disabled={upvotingIds.has(post.id)}
                aria-label={`Upvote this wish (${post.upvotes} upvotes)`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-md"
              >
                <ThumbsUp /> <span className="text-sm">{post.upvotes}</span>
              </button>
            </div>

            {/* Comments section */}
            <div className="comments-section">
              <h4>Comments</h4>
              <div className="flex flex-col gap-3 mt-2">
                {(commentsMap[post.id] || []).map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-800">{comment.content}</p>
                        <small className="text-xs text-gray-400">{formatDate(comment.created_at)}</small>
                      </div>
                      <div>
                        <button
                          onClick={() => handleCommentUpvote(post.id, comment)}
                          disabled={commentingIds.has(comment.id)}
                          aria-label={`Upvote this comment (${comment.upvotes} upvotes)`}
                          className="inline-flex items-center gap-2 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-md"
                        >
                          <ThumbsUp size={14} /> <span className="text-sm">{comment.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment form */}
              <div className="mt-3">
                <CommentForm
                  postId={post.id}
                  createComment={createComment}
                  onCommentAdded={() => handleCommentAdded(post.id)}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
