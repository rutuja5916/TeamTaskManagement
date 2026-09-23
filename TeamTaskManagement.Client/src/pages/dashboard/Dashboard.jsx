import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/dashboardService';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const data = await getDashboard();
                setDashboard(data);
            } catch (error) {
                console.error(error);
                setError('Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Dashboard</h2>
                    <p className="text-muted mb-0">
                        Overview of your task management system
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="row g-4 mb-4">

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">Total Tasks</div>
                            <h2 className="mt-2">
                                {dashboard.totalTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">Pending Tasks</div>
                            <h2 className="mt-2">
                                {dashboard.pendingTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">Completed Tasks</div>
                            <h2 className="mt-2">
                                {dashboard.completedTasks}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <div className="text-muted">Teams</div>
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
                                    {dashboard.statusSummary?.toDo ?? 0}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <div className="text-muted">
                                    In Progress
                                </div>

                                <h3 className="mb-0">
                                    {dashboard.statusSummary?.inProgress ?? 0}
                                </h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <div className="text-muted">
                                    Done
                                </div>

                                <h3 className="mb-0">
                                    {dashboard.statusSummary?.done ?? 0}
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