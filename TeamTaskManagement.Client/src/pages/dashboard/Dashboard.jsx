import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/dashboardService';
import { getTasks } from '../../services/taskService';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [tasks, setTasks] = useState([]);

    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [deadlineFrom, setDeadlineFrom] = useState('');
    const [deadlineTo, setDeadlineTo] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [dashboardData, taskData] = await Promise.all([
                    getDashboard(),
                    getTasks()
                ]);

                setDashboard(dashboardData);
                setTasks(taskData || []);
            } catch (error) {
                console.error(error);
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

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

        return '';
    };

    const normalizePriority = (priority) => {
        if (priority === 1 || priority === '1' || priority === 'Low') {
            return 'Low';
        }

        if (
            priority === 2 ||
            priority === '2' ||
            priority === 'Medium'
        ) {
            return 'Medium';
        }

        if (priority === 3 || priority === '3' || priority === 'High') {
            return 'High';
        }

        return '';
    };

    const filteredTasks = tasks.filter((task) => {
        const taskStatus = normalizeStatus(task.status);
        const taskPriority = normalizePriority(task.priority);

        if (statusFilter && taskStatus !== statusFilter) {
            return false;
        }

        if (priorityFilter && taskPriority !== priorityFilter) {
            return false;
        }

        if (deadlineFrom) {
            if (!task.dueDate) {
                return false;
            }

            const taskDate = new Date(task.dueDate);
            const fromDate = new Date(deadlineFrom);

            if (taskDate < fromDate) {
                return false;
            }
        }

        if (deadlineTo) {
            if (!task.dueDate) {
                return false;
            }

            const taskDate = new Date(task.dueDate);
            const toDate = new Date(deadlineTo);

            toDate.setHours(23, 59, 59, 999);

            if (taskDate > toDate) {
                return false;
            }
        }

        return true;
    });

    const totalTasks = filteredTasks.length;

    const completedTasks = filteredTasks.filter(
        (task) => normalizeStatus(task.status) === 'Done'
    ).length;

    const pendingTasks = filteredTasks.filter(
        (task) => normalizeStatus(task.status) !== 'Done'
    ).length;

    const statusSummary = {
        toDo: filteredTasks.filter(
            (task) => normalizeStatus(task.status) === 'ToDo'
        ).length,

        inProgress: filteredTasks.filter(
            (task) => normalizeStatus(task.status) === 'InProgress'
        ).length,

        done: filteredTasks.filter(
            (task) => normalizeStatus(task.status) === 'Done'
        ).length
    };

    const clearFilters = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setDeadlineFrom('');
        setDeadlineTo('');
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border"></div>
                <p className="mt-2">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    return (
        <div>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Dashboard</h2>
                    <p className="text-muted mb-0">
                        Overview of your task management system
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Task Filters
                        </h5>

                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="row g-3">

                        {/* Status */}
                        <div className="col-md-6 col-lg-3">
                            <label className="form-label">
                                Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="">All Statuses</option>
                                <option value="ToDo">To Do</option>
                                <option value="InProgress">
                                    In Progress
                                </option>
                                <option value="Done">Done</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="col-md-6 col-lg-3">
                            <label className="form-label">
                                Priority
                            </label>

                            <select
                                className="form-select"
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                            >
                                <option value="">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {/* From Date */}
                        <div className="col-md-6 col-lg-3">
                            <label className="form-label">
                                Deadline From
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={deadlineFrom}
                                onChange={(e) =>
                                    setDeadlineFrom(e.target.value)
                                }
                            />
                        </div>

                        {/* To Date */}
                        <div className="col-md-6 col-lg-3">
                            <label className="form-label">
                                Deadline To
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={deadlineTo}
                                onChange={(e) =>
                                    setDeadlineTo(e.target.value)
                                }
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="row g-4 mb-4">

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">
                                Total Tasks
                            </div>

                            <h2 className="mt-2">
                                {totalTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">
                                Pending Tasks
                            </div>

                            <h2 className="mt-2">
                                {pendingTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">
                                Completed Tasks
                            </div>

                            <h2 className="mt-2">
                                {completedTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">
                                Teams
                            </div>

                            <h2 className="mt-2">
                                {dashboard.totalTeams}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            {/* Status Summary */}
            <div className="card shadow-sm border-0">
                <div className="card-body">

                    <h5 className="mb-4">
                        Task Status
                    </h5>

                    <div className="row g-3">

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <div className="text-muted">
                                    To Do
                                </div>

                                <h3 className="mb-0">
                                    {statusSummary.toDo}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <div className="text-muted">
                                    In Progress
                                </div>

                                <h3 className="mb-0">
                                    {statusSummary.inProgress}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <div className="text-muted">
                                    Done
                                </div>

                                <h3 className="mb-0">
                                    {statusSummary.done}
                                </h3>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
};

export default Dashboard;