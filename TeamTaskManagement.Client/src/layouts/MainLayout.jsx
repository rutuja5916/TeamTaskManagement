import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="d-flex min-vh-100">

            {/* Sidebar */}
            <aside className="sidebar bg-dark text-white p-3">
                <h4 className="mb-4">
                    Team Tasks
                </h4>

                <div className="nav flex-column gap-2">

                    <NavLink
                        to="/dashboard"
                        className="text-white text-decoration-none p-2 rounded"
                    >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/tasks"
                        className="text-white text-decoration-none p-2 rounded"
                    >
                        <i className="bi bi-check2-square me-2"></i>
                        Tasks
                    </NavLink>

                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                        <NavLink
                            to="/teams"
                            className="text-white text-decoration-none p-2 rounded"
                        >
                            <i className="bi bi-people me-2"></i>
                            Teams
                        </NavLink>
                    )}

                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                        <NavLink
                            to="/users"
                            className="text-white text-decoration-none p-2 rounded"
                        >
                            <i className="bi bi-person-lines-fill me-2"></i>
                            Users
                        </NavLink>
                    )}

                    <NavLink
                        to="/notifications"
                        className="text-white text-decoration-none p-2 rounded"
                    >
                        <i className="bi bi-bell me-2"></i>
                        Notifications
                    </NavLink>

                </div>

                <hr />

                <button
                    className="btn btn-outline-light w-100"
                    onClick={logout}
                >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content flex-grow-1">

                {/* Topbar */}
                <nav className="navbar bg-white border-bottom px-4">
                    <div>
                        <span className="fw-semibold">
                            Welcome, {user?.firstName}
                        </span>
                    </div>

                    <div className="text-muted">
                        {user?.role}
                    </div>
                </nav>

                {/* Page Content */}
                <div className="p-4">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default MainLayout;