import React, { useState } from 'react';

interface CommentFormProps {
  postId: number;
  onCommentAdded: () => void;
  createComment: (postId: number, content: string) => Promise<void>;
}

export default function CommentForm({ postId, onCommentAdded, createComment }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter a comment.');
      return;
    }
    setError(null);
    try {
      await createComment(postId, content.trim());
      setContent('');
      onCommentAdded();
    } catch {
      setError('Failed to add comment. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="px-3 py-2 border border-gray-300 rounded-md resize-none text-sm"
        rows={3}
        maxLength={400}
      />
      <div className="flex items-center justify-between">
        {error ? <p className="text-sm text-red-600">{error}</p> : <div />}
        <button
          type="submit"
          className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
