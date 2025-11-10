/**
 * File: frontend/src/components/CommentsComps/CommentsContainer.jsx
 * Container component for displaying and adding comments related to a degree plan.
 */

import { useEffect, useState } from 'react';
import { useApiClient } from '../lib/apiClient.js';
import CommentForm from './CommentForm.jsx';
import CommentItem from './CommentItem.jsx';

/**
 * CommentsContainer component for displaying and adding comments.
 * @param {*} param0 - Props containing studentSchoolId and programId.
 * @returns {JSX.Element} The rendered CommentsContainer component.
 */
export default function CommentsContainer({ student, studentSchoolId, programId, userIsStudent=false }) {
    const api = useApiClient();
    const [ comments, setComments ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState('');
    const [ openMenuId, setOpenMenuId ] = useState(null);

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
                        <CommentItem
                            key={comment.comment_id}
                            comment={comment}
                            userIsStudent={userIsStudent}
                            setComments={setComments}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                        />
                    ))
                )}
            </ul>
        </div>
    )
}