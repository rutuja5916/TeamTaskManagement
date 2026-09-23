import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getUsers,
    updateUserStatus,
    updateUserRole
} from '../../services/userService';

const Users = () => {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to load users.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleStatusChange = async (userId, isActive) => {
        try {
            await updateUserStatus(userId, isActive);

            setUsers((previous) =>
                previous.map((item) =>
                    item.id === userId
                        ? { ...item, isActive }
                        : item
                )
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to update user status.'
            );
        }
    };

    const handleRoleChange = async (userId, roleId) => {
        try {
            await updateUserRole(userId, Number(roleId));

            await loadUsers();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                'Unable to update user role.'
            );
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading users...</p>
            </div>
        );
    }

    return (
        <div>

            <div className="mb-4">
                <h2 className="mb-1">Users</h2>
                <p className="text-muted mb-0">
                    Manage users, roles and account status
                </p>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card shadow-sm border-0">

                <div className="card-body">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>

                            <tbody>

                                {users.map((item) => (
                                    <tr key={item.id}>

                                        <td>
                                            <div className="fw-semibold">
                                                {item.firstName} {item.lastName}
                                            </div>
                                        </td>

                                        <td>
                                            {item.email}
                                        </td>

                                        <td>
                                            {user?.role === 'Admin' ? (
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={item.roleId}
                                                    onChange={(e) =>
                                                        handleRoleChange(
                                                            item.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ width: '130px' }}
                                                >
                                                    <option value="1">
                                                        Admin
                                                    </option>

                                                    <option value="2">
                                                        Manager
                                                    </option>

                                                    <option value="3">
                                                        User
                                                    </option>
                                                </select>
                                            ) : (
                                                <span className="badge text-bg-secondary">
                                                    {item.role}
                                                </span>
                                            )}
                                        </td>

                                        <td>

                                            <div className="form-check form-switch">

                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={item.isActive}
                                                    disabled={
                                                        user?.role !== 'Admin' ||
                                                        item.id === user?.userId
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            item.id,
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <label className="form-check-label">
                                                    {item.isActive
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </label>

                                            </div>

                                        </td>

                                        <td>
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Users;