import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { getApiErrorMessage } from '../utils/errorHandler';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await register(formData);

            setSuccess('Registration successful. Redirecting to login...');

            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    'Registration failed. Please try again.'
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm border-0" style={{ width: '430px' }}>
                <div className="card-body p-4">

                    <div className="text-center mb-4">
                        <h3 className="fw-bold">Create Account</h3>
                        <p className="text-muted mb-0">
                            Register for Team Task Management
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>

                    </form>

                    <div className="text-center mt-3">
                        <span className="text-muted">
                            Already have an account?{' '}
                        </span>

                        <Link to="/login">
                            Login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Register;