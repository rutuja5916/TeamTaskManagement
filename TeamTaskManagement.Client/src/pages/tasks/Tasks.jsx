import { useEffect, useState } from 'react';
import {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
} from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { getTeams, getTeamMembers } from '../../services/teamService';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../utils/errorHandler';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        deadlineFrom: '',
        deadlineTo: ''
    });
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        teamId: '',
        assignedTo: '',
        priority: 'Medium',
        deadline: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { user } = useAuth();

    const [teams, setTeams] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [updating, setUpdating] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const loadTasks = async (currentFilters = filters) => {
        try {
            setLoading(true);
            setError('');

            const params = {};

            if (currentFilters.status) {
                params.status = currentFilters.status;
            }

            if (currentFilters.priority) {
                params.priority = currentFilters.priority;
            }

            if (currentFilters.deadlineFrom) {
                params.deadlineFrom = currentFilters.deadlineFrom;
            }

            if (currentFilters.deadlineTo) {
                params.deadlineTo = currentFilters.deadlineTo;
            }

            const data = await getTasks(params);
            setTasks(data);
        } catch (error) {
            setError(
                getApiErrorMessage(
                    error,
                    'Unable to load tasks.'
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();

        if (user?.role === 'Admin' || user?.role === 'Manager') {
            loadTeams();
        }
    }, [user]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleApplyFilters = () => {
        loadTasks(filters);
    };

    const handleClearFilters = () => {
        const emptyFilters = {
            status: '',
            priority: '',
            deadlineFrom: '',
            deadlineTo: ''
        };

        setFilters(emptyFilters);
        loadTasks(emptyFilters);
    };

    const getStatusBadge = (status) => {
        const normalizedStatus = normalizeStatus(status);

        switch (normalizedStatus) {
            case 'ToDo':
                return 'secondary';

            case 'InProgress':
                return 'warning';

            case 'Done':
                return 'success';

            default:
                return 'secondary';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Low':
                return 'success';

            case 'Medium':
                return 'warning';

            case 'High':
                return 'danger';

            default:
                return 'secondary';
        }
    };

    const handleNewTaskChange = (e) => {
        const { name, value } = e.target;

        setNewTask((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleEditClick = async (task) => {
        try {
            setError('');

            const teamId = task.teamId;

            const members = await getTeamMembers(teamId);

            setTeamMembers(members);

            setEditingTask({
                id: task.id,
                title: task.title,
                description: task.description || '',
                teamId: String(task.teamId),
                assignedTo: String(task.assignedTo),
                priority:
                    task.priority === 1 || task.priority === '1'
                        ? 'Low'
                        : task.priority === 2 || task.priority === '2'
                            ? 'Medium'
                            : 'High',
                deadline: task.deadline
                    ? task.deadline.substring(0, 16)
                    : ''
            });

            setShowEditModal(true);
        } catch (error) {
            console.error(error);

            setError(
                getApiErrorMessage(
                    error,
                    'Unable to load task for editing.'
                )
            );
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        try {
            setUpdating(true);
            setError('');

            await updateTask(editingTask.id, {
                title: editingTask.title,
                description: editingTask.description,
                assignedTo: Number(editingTask.assignedTo),
                priority:
                    editingTask.priority === 'Low'
                        ? 1
                        : editingTask.priority === 'Medium'
                            ? 2
                            : 3,
                deadline: editingTask.deadline
            });

            setShowEditModal(false);
            setEditingTask(null);

            await loadTasks();
        } catch (error) {
            console.error(error);

            setError(
                getApiErrorMessage(
                    error,
                    'Unable to update task.'
                )
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        try {
            setCreating(true);
            setError('');

            await createTask({
                title: newTask.title,
                description: newTask.description,
                teamId: Number(newTask.teamId),
                assignedTo: Number(newTask.assignedTo),
                priority: Number(
                    newTask.priority === 'Low'
                        ? 1
                        : newTask.priority === 'Medium'
                            ? 2
                            : 3
                ),
                deadline: newTask.deadline
            });

            setShowCreateModal(false);

            setNewTask({
                title: '',
                description: '',
                teamId: '',
                assignedTo: '',
                priority: 'Medium',
                deadline: ''
            });

            await loadTasks();
        } catch (error) {
            console.error('CREATE TASK ERROR:', error.response?.data);

            setError(
                getApiErrorMessage(
                    error,
                    'Unable to create task.'
                )
            );
        } finally {
            setCreating(false);
        }
    };

    const loadTeams = async () => {
        try {
            setLoadingTeams(true);

            const data = await getTeams();
            setTeams(data);
        } catch (error) {
            console.error(error);
            setError(getApiErrorMessage(
                error, 'Unable to load teams.'
            )
            );
        } finally {
            setLoadingTeams(false);
        }
    };

    const normalizeStatus = (status) => {
        if (status === 1 || status === '1' || status === 'ToDo') {
            return 'ToDo';
        }

        if (
            status === 2 ||
            status === '2' ||
            status === 'InProgress'
        ) {
            return 'InProgress';
        }

        if (status === 3 || status === '3' || status === 'Done') {
            return 'Done';
        }

        return 'ToDo';
    };

    const handleTeamChange = async (e) => {
        const teamId = e.target.value;

        setNewTask((previous) => ({
            ...previous,
            teamId,
            assignedTo: ''
        }));

        setTeamMembers([]);

        if (!teamId) {
            return;
        }

        try {
            const data = await getTeamMembers(teamId);
            setTeamMembers(data);
        } catch (error) {
            console.error(error);
            setError(getApiErrorMessage(
                error, 'Unable to load team members.'
            )
            );
        }
    };
    const handleStatusChange = async (taskId, status) => {
        try {
            setError('');

            const statusValue =
                status === 'ToDo'
                    ? 1
                    : status === 'InProgress'
                        ? 2
                        : 3;

            await updateTaskStatus(taskId, statusValue);

            await loadTasks();
        } catch (error) {
            console.error(error);

            setError(
                getApiErrorMessage(
                    error,
                'Unable to update task status.'
                )
            );
        }
    };

    const handleDeleteClick = (task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError('');

            await deleteTask(taskToDelete.id);

            setShowDeleteModal(false);
            setTaskToDelete(null);

            await loadTasks();
        } catch (error) {
            console.error(error);

            setError(
                getApiErrorMessage(
                    error,

                    'Unable to delete task.'
                )
            );
        } finally {
            setDeleting(false);
        }
    };
    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Tasks</h2>
                    <p className="text-muted mb-0">
                        Manage and track your tasks
                    </p>
                </div>
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <i className="bi bi-plus-lg me-2"></i>
                    Create Task
                    </button>
                )}
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <div className="row g-3">

                        <div className="col-md-3">
                            <label className="form-label">
                                Status
                            </label>

                            <select
                                name="status"
                                className="form-select"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Statuses</option>
                                <option value="ToDo">To Do</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">
                                Priority
                            </label>

                            <select
                                name="priority"
                                className="form-select"
                                value={filters.priority}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Deadline From
                            </label>

                            <input
                                type="date"
                                name="deadlineFrom"
                                className="form-control"
                                value={filters.deadlineFrom}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label">
                                Deadline To
                            </label>

                            <input
                                type="date"
                                name="deadlineTo"
                                className="form-control"
                                value={filters.deadlineTo}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="col-md-2 d-flex align-items-end gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleApplyFilters}
                            >
                                <i className="bi bi-funnel me-1"></i>
                                Filter
                            </button>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                            >
                                Clear
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card shadow-sm border-0">

                <div className="card-body">

                    {tasks.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-clipboard-x fs-1 text-muted"></i>
                            <h5 className="mt-3">
                                No tasks found
                            </h5>
                            <p className="text-muted">
                                There are currently no tasks available.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Team</th>
                                        <th>Assigned To</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Deadline</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {tasks.map((task) => (
                                        <tr key={task.id}>

                                            <td>
                                                <div className="fw-semibold">
                                                    {task.title}
                                                </div>

                                                {task.description && (
                                                    <small className="text-muted">
                                                        {task.description.length > 60
                                                            ? `${task.description.substring(0, 60)}...`
                                                            : task.description}
                                                    </small>
                                                )}
                                            </td>

                                            <td>
                                                {task.teamName}
                                            </td>

                                            <td>
                                                {task.assignedToName}
                                            </td>

                                            <td>
                                                <select
                                                    className={`form-select form-select-sm border-${getStatusBadge(
                                                        task.status
                                                    )}`}
                                                    value={normalizeStatus(task.status)}
                                                    onChange={(e) =>
                                                        handleStatusChange(task.id, e.target.value)
                                                    }
                                                    style={{ width: '130px' }}
                                                >
                                                    <option value="ToDo">To Do</option>
                                                    <option value="InProgress">In Progress</option>
                                                    <option value="Done">Done</option>
                                                </select>
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge text-bg-${getPriorityBadge(
                                                        task.priority
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>

                                            <td>
                                                {new Date(task.deadline).toLocaleDateString()}
                                            </td>

                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    title="View task"
                                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-secondary me-2"
                                                    title="Edit task"
                                                    onClick={() => handleEditClick(task)}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete task"
                                                    onClick={() => handleDeleteClick(task)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>

            {showCreateModal && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Create Task
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>

                            <form onSubmit={handleCreateTask}>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            value={newTask.title}
                                            onChange={handleNewTaskChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="4"
                                            value={newTask.description}
                                            onChange={handleNewTaskChange}
                                        ></textarea>
                                    </div>

                                    <div className="row">

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Team ID
                                            </label>

                                            <select
                                                name="teamId"
                                                className="form-select"
                                                value={newTask.teamId}
                                                onChange={handleTeamChange}
                                                required
                                            >
                                                <option value="">
                                                    {loadingTeams ? 'Loading teams...' : 'Select Team'}
                                                </option>

                                                {teams.map((team) => (
                                                    <option
                                                        key={team.id}
                                                        value={team.id}
                                                    >
                                                        {team.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Assigned User ID
                                            </label>

                                            <select
                                                name="assignedTo"
                                                className="form-select"
                                                value={newTask.assignedTo}
                                                onChange={handleNewTaskChange}
                                                required
                                                disabled={!newTask.teamId}
                                            >
                                                <option value="">
                                                    {!newTask.teamId
                                                        ? 'Select a team first'
                                                        : 'Select Team Member'}
                                                </option>

                                                {teamMembers.map((member) => (
                                                    <option
                                                        key={member.userId}
                                                        value={member.userId}
                                                    >
                                                        {member.fullName} ({member.role})
                                                    </option>
                                                ))}
                                            </select>required
                                           
                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Priority
                                            </label>

                                            <select
                                                name="priority"
                                                className="form-select"
                                                value={newTask.priority}
                                                onChange={handleNewTaskChange}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Deadline
                                            </label>

                                            <input
                                                type="datetime-local"
                                                name="deadline"
                                                className="form-control"
                                                value={newTask.deadline}
                                                onChange={handleNewTaskChange}
                                                required
                                            />
                                        </div>

                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={creating}
                                    >
                                        {creating ? 'Creating...' : 'Create Task'}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}


            {showEditModal && editingTask && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Edit Task
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingTask(null);
                                    }}
                                ></button>
                            </div>

                            <form onSubmit={handleUpdateTask}>

                                <div className="modal-body">

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editingTask.title}
                                            onChange={(e) =>
                                                setEditingTask((previous) => ({
                                                    ...previous,
                                                    title: e.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={editingTask.description}
                                            onChange={(e) =>
                                                setEditingTask((previous) => ({
                                                    ...previous,
                                                    description: e.target.value
                                                }))
                                            }
                                        ></textarea>
                                    </div>

                                    <div className="row">

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Assigned To
                                            </label>

                                            <select
                                                className="form-select"
                                                value={editingTask.assignedTo}
                                                onChange={(e) =>
                                                    setEditingTask((previous) => ({
                                                        ...previous,
                                                        assignedTo: e.target.value
                                                    }))
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select member
                                                </option>

                                                {teamMembers.map((member) => (
                                                    <option
                                                        key={member.userId}
                                                        value={member.userId}
                                                    >
                                                        {member.fullName} ({member.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Priority
                                            </label>

                                            <select
                                                className="form-select"
                                                value={editingTask.priority}
                                                onChange={(e) =>
                                                    setEditingTask((previous) => ({
                                                        ...previous,
                                                        priority: e.target.value
                                                    }))
                                                }
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">
                                            Deadline
                                        </label>

                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={editingTask.deadline}
                                            onChange={(e) =>
                                                setEditingTask((previous) => ({
                                                    ...previous,
                                                    deadline: e.target.value
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingTask(null);
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : 'Update Task'}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && taskToDelete && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Delete Task
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setTaskToDelete(null);
                                    }}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <p className="mb-2">
                                    Are you sure you want to delete this task?
                                </p>

                                <strong>
                                    {taskToDelete.title}
                                </strong>

                                <p className="text-muted mt-2 mb-0">
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setTaskToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteTask}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Delete Task'}
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;