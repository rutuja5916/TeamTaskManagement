import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTaskById } from '../../services/taskService';
import {
    getComments,
    createComment,
    deleteComment
} from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';

const TaskDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [taskData, commentsData] = await Promise.all([
                getTaskById(id),
                getComments(id)
            ]);

            setTask(taskData);
            setComments(commentsData);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to load task details.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            return;
        }

        try {
            setCommentLoading(true);

            await createComment(id, {
                content: comment.trim()
            });

            setComment('');

            const updatedComments = await getComments(id);
            setComments(updatedComments);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to add comment.'
            );
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);

            setComments((previous) =>
                previous.filter((item) => item.id !== commentId)
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to delete comment.'
            );
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading task...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="alert alert-danger">
                Task not found.
            </div>
        );
    }

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button
                        className="btn btn-outline-secondary mb-3"
                        onClick={() => navigate('/tasks')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Tasks
                    </button>

                    <h2>{task.title}</h2>
                    <p className="text-muted mb-0">
                        Task details and discussion
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Task Details */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <h5 className="mb-4">Task Information</h5>

                    <div className="row g-4">

                        <div className="col-md-8">
                            <label className="text-muted small">
                                Description
                            </label>

                            <p className="mt-1">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        <div className="col-md-4">
                            <label className="text-muted small">
                                Team
                            </label>

                            <p className="fw-semibold">
                                {task.teamName}
                            </p>
                        </div>

                        <div className="col-md-4">
                            <label className="text-muted small">
                                Assigned To
                            </label>

                            <p className="fw-semibold">
                                {task.assignedToName}
                            </p>
                        </div>

                        <div className="col-md-4">
                            <label className="text-muted small">
                                Assigned By
                            </label>

                            <p className="fw-semibold">
                                {task.assignedByName}
                            </p>
                        </div>

                        <div className="col-md-4">
                            <label className="text-muted small">
                                Deadline
                            </label>

                            <p className="fw-semibold">
                                {new Date(task.deadline).toLocaleString()}
                            </p>
                        </div>

                    </div>

                </div>
            </div>

            {/* Comments */}
            <div className="card shadow-sm border-0">

                <div className="card-body">

                    <h5 className="mb-4">
                        Comments
                    </h5>

                    <form onSubmit={handleAddComment} className="mb-4">

                        <div className="input-group">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={commentLoading}
                            >
                                {commentLoading
                                    ? 'Adding...'
                                    : 'Add Comment'}
                            </button>

                        </div>

                    </form>

                    {comments.length === 0 ? (
                        <p className="text-muted">
                            No comments yet.
                        </p>
                    ) : (
                        <div className="d-flex flex-column gap-3">

                            {comments.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded p-3"
                                >

                                    <div className="d-flex justify-content-between">

                                        <div>
                                            <strong>{item.userName}</strong>

                                            <div className="text-muted small">
                                                {new Date(
                                                    item.createdAt
                                                ).toLocaleString()}
                                            </div>
                                        </div>

                                        {item.userId === user?.userId && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDeleteComment(item.id)
                                                }
                                                title="Delete comment"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        )}

                                    </div>

                                    <p className="mb-0 mt-2">
                                        {item.content}
                                    </p>

                                </div>
                            ))}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default TaskDetails;