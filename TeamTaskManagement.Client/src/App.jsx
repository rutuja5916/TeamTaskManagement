import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Tasks from './pages/tasks/Tasks';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import TaskDetails from './pages/tasks/TaskDetails';
import Notifications from './pages/notifications/Notifications';
import Teams from './pages/teams/Teams';
import Users from './pages/users/Users';
import Register from './pages/Register';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/tasks"
                            element={<Tasks />}
                        />

                        <Route
                            path="/tasks/:id"
                            element={<TaskDetails />}
                        />

                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />

                        <Route
                            path="/teams"
                            element={<Teams />}
                        />

                        <Route
                            path="/users"
                            element={<Users />}
                        />

                        <Route path="/register"
                            element={<Register />}
                        />
                    </Route>
                </Route>

                <Route path="*" element={<Login />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;