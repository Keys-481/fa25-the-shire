/**
 * File: frontend/src/components/DegreePlanComponents/CommentsComps/CommentsContainer.jsx
 * Container component for displaying and adding comments related to a degree plan.
 */

import { useEffect, useState } from 'react';
import { useApiClient } from '../../lib/apiClient';

/**
 * CommentItem component for displaying a single comment.
 * @param {*} param0 - Props containing the comment object.
 * @returns {JSX.Element} The rendered CommentItem component.
 */
function CommentItem({ comment }) {
    const authorHandle = `@${comment.first_name}_${comment.last_name}`;
    return (
        <li className="comment-item">
            <span className="comment-author">{authorHandle}:</span>
            <span className="comment-text">{comment.comment_text}</span>
            {comment.created_at && (
                <span className="comment-timestamp">
                    {new Date(comment.created_at).toLocaleString()}
                </span>
            )}
        </li>
    );
}

/**
 * CommentForm component for displaying a form to add a new comment.
 * @param {*} param0 - Props containing studentSchoolId, programId, and onCommentPosted callback.
 * @returns {JSX.Element} The rendered CommentForm component.
 */
function CommentForm({ studentSchoolId, programId, onCommentPosted }) {
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

/**
 * CommentsContainer component for displaying and adding comments.
 * @param {*} param0 - Props containing studentSchoolId and programId.
 * @returns {JSX.Element} The rendered CommentsContainer component.
 */
export default function CommentsContainer({ studentSchoolId, programId }) {
    const api = useApiClient();
    const [ comments, setComments ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState('');

    console.log("CommentsContainer props:", { studentSchoolId, programId });


    // fetch comments when studentSchoolId or programId changes
    useEffect(() => {
        if (!studentSchoolId || !programId) return;

        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await api.get(`/api/comments?programId=${encodeURIComponent(programId)}&studentSchoolId=${encodeURIComponent(studentSchoolId)}`);
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        })();
    }, [studentSchoolId, programId, api]);

    // handle posting a new comment
    const handleCommentAdded = (newComment) => {
        setComments((prevComments) => [newComment, ...prevComments]);
    }

    if (!studentSchoolId || !programId) {
        return <p className="error-message">Select a student and a program to view comments.</p>;
    }

    if (loading) return <p>Loading comments...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="comments-container">
            <h4>Comments</h4>
            <div className="comment-form-wrapper">
                <CommentForm
                    studentSchoolId={studentSchoolId}
                    programId={programId}
                    onCommentPosted={handleCommentAdded}
                />
            </div>
            <ul className="comments-list">
                {comments.length === 0 ? (
                    <li className="no-comments">No comments yet.</li>
                ) : (
                    comments.map((comment) => (
                        <CommentItem key={comment.comment_id} comment={comment} />
                    ))
                )}
            </ul>
        </div>
    )
}