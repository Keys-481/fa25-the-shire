/**
 * File: frontend/src/components/CommentComps/CommentItem.jsx
 * CommentItem component for displaying a single comment and handleing its menu actions.
 */

import { Ellipsis } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { useApiClient } from '../lib/apiClient.js';

/**
 * CommentItem component for displaying a single comment.
 * @param {*} param0 - Props containing the comment object.
 * @returns {JSX.Element} The rendered CommentItem component.
 */
function CommentItem({ comment, userIsStudent=false, setComments, openMenuId, setOpenMenuId }) {
    if (!comment || !comment.comment_id || !setComments || !openMenuId || !setOpenMenuId) return null;
    
    const api = useApiClient();
    const { user } = useAuth();
    
    const authorHandle = `@${comment.first_name}_${comment.last_name}`;
    const canModify = !userIsStudent || userIsStudent && String(comment.author_id) === String(user?.id);
    const canDelete = canModify;
    const canEdit = canModify;

    // handle menu toggle
    const toggleMenu = () => {
        setOpenMenuId(openMenuId === comment.comment_id ? null : comment.comment_id);
    };

    const isMenuOpen = openMenuId === comment.comment_id;

    // close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.comment-menu-btn')) {
                if (!event.target.closest(`#comment-menu-btn-${comment.comment_id}`)) {
                    setOpenMenuId(null);
                }
            };
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [comment.comment_id, setOpenMenuId]);

    // handle delete comment
    const handleDelete = (deletedCommentId) => {
        const confirm = window.confirm('Are you sure you want to delete this comment?');
        if (!confirm) return;

        (async () => {
            try {
                await api.del(`/api/comments/${deletedCommentId}`);
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('Error deleting comment: ' + (error?.message || 'Unknown error'));
            }
        })();
        setComments((prevComments) => prevComments.filter(comment => comment.comment_id !== deletedCommentId));
    };

    const handleEdit = () => {
        alert('Not implemented yet');
    }

    return (
        <li className="comment-item">
            <div className="comment-header">
                <span className="comment-author">{authorHandle}</span>
                <button className="comment-menu-btn" id={`comment-menu-btn-${comment.comment_id}`} onClick={toggleMenu}>
                    <Ellipsis />
                </button>
            </div>

            <span className="comment-text">{comment.comment_text}</span>
            <br />
            {comment.created_at && (
                <span className="comment-timestamp">
                    {new Date(comment.created_at).toLocaleString()}
                </span>
            )}

            {isMenuOpen && (
                <ul className="comment-menu">
                    <li>
                        <button onClick={handleEdit} id={`comment-menu-${comment.comment_id}`} disabled={!canEdit}>Edit</button>
                    </li>
                    <li>
                        <button onClick={() => handleDelete(comment.comment_id)} id={`comment-menu-${comment.comment_id}`} disabled={!canDelete}>Delete</button>
                    </li>
                </ul>
            )}
        </li>
    );
}