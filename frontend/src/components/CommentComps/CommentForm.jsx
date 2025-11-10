/**
 * File: frontend/src/components/CommentComps/CommentsForm.jsx
 * CommentForm component for adding new comments.
 */
import { useState } from 'react';
import { useApiClient } from '../../lib/apiClient.js';

/**
 * CommentForm component for displaying a form to add a new comment.
 * @param {*} param0 - Props containing studentSchoolId, programId, and onCommentPosted callback.
 * @returns {JSX.Element} The rendered CommentForm component.
 */
export default function CommentForm({ studentSchoolId, programId, onCommentPosted }) {
    const api = useApiClient();
    const [ commentText, setCommentText ] = useState('');
    const [ posting, setPosting ] = useState(false);
    const [ error, setError ] = useState('');

    const handlePostComment = async () => {

        if (!commentText.trim()) {
            setError('Comment text cannot be empty');
            return;
        }

        setPosting(true);
        setError('');
        try {
            const newComment = await api.post('/api/comments', {
                programId,
                studentSchoolId,
                commentText: commentText.trim(),
            });
            setCommentText('');
            onCommentPosted(newComment);
        } catch (error) {
            console.error('Error posting comment:', error);
            setError('Failed to post comment');
            alert('Error posting comment: ' + (error?.message || 'Unknown error'));
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="comment-form">
            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                disabled={posting}
            />
            <button onClick={handlePostComment} disabled={posting}>
                {posting ? 'Posting...' : 'Post Comment'}
            </button>
        </div>
    );
}

