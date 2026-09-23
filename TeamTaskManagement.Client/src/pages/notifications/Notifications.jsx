import { useEffect, useState } from 'react';
import {
    getNotifications,
    markAsRead
} from '../../services/notificationService';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to load notifications.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div>

            <div className="mb-4">
                <h2 className="mb-1">Notifications</h2>
                <p className="text-muted mb-0">
                    Stay updated with your task activities
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-body">

                    {notifications.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-bell-slash fs-1 text-muted"></i>

                            <h5 className="mt-3">
                                No notifications
                            </h5>

                            <p className="text-muted mb-0">
                                You're all caught up.
                            </p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">

                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border rounded p-3 ${!notification.isRead
                                            ? 'bg-light'
                                            : ''
                                        }`}
                                >

                                    <div className="d-flex justify-content-between align-items-start">

                                        <div className="d-flex gap-3">

                                            <div>
                                                <i
                                                    className={
                                                        notification.type === 'TaskAssigned'
                                                            ? 'bi bi-clipboard-check fs-4'
                                                            : 'bi bi-arrow-repeat fs-4'
                                                    }
                                                ></i>
                                            </div>

                                            <div>
                                                <div className="fw-semibold">
                                                    {notification.type === 'TaskAssigned'
                                                        ? 'Task Assigned'
                                                        : 'Task Status Updated'}
                                                </div>

                                                <div className="text-muted">
                                                    {notification.message}
                                                </div>

                                                <small className="text-muted">
                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString()}
                                                </small>
                                            </div>

                                        </div>

                                        {!notification.isRead && (
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                    handleMarkAsRead(notification.id)
                                                }
                                            >
                                                Mark as read
                                            </button>
                                        )}

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default Notifications;