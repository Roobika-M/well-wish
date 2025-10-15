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
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Add a comment..." />
      {error && <p style={{color: 'red'}}>{error}</p>}
      <button type="submit">Submit Comment</button>
    </form>
  );
}
