import { useState } from 'react';
import { Send } from 'lucide-react';
import { createPost } from '../services/posts';

export function PostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter your wish');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await createPost(content.trim(), recipient.trim() || null);

    if (submitError) {
      setError('Failed to post your wish. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setContent('');
    setIsSubmitting(false);
    onPostCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label htmlFor="wish-input" className="block text-lg font-semibold text-gray-800 mb-3">
          Share Your Wish Anonymously
        </label>
        <textarea
          id="wish-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you wish for? Your wish will be shared anonymously..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
        />
        <div className="mt-3">
          <input
            id="recipient-input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="(Optional) Send anonymously to a name e.g. 'Amina'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            maxLength={80}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-400 mt-1">If you provide a name, your wish will be visible when someone checks messages for that name.</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {content.length}/500 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
            {isSubmitting ? 'Posting...' : 'Post Wish'}
          </button>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
