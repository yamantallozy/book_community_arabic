import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.msg || 'Registration failed';
            setError(msg);
            alert('Register Error: ' + msg); // POPUP DEBUGGING
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-slate-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-500">Join our community of book lovers</p>
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-1"
                    >
                        Sign Up
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account? <Link to="/login" className="font-medium text-primary hover:text-indigo-500">Sign in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
