import React, { useState } from 'react';

export const AuthScreen = ({ onSignUp, onLogin, error }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(email, password);
        } else {
            onSignUp(email, password);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl p-8 border-t-4 border-lime-500">
                <h1 className="text-4xl font-extrabold text-lime-400 text-center mb-2">
                     <span className="text-2xl text-yellow-300">Math Mosaics</span>
                </h1>
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                    {isLogin ? 'Player Login' : 'Create Account'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded-lg text-white border-2 border-gray-600 focus:border-lime-500 focus:ring-lime-500 transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded-lg text-white border-2 border-gray-600 focus:border-lime-500 focus:ring-lime-500 transition"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full py-3 px-4 bg-lime-600 hover:bg-lime-700 rounded-lg text-white font-bold text-lg transition-transform transform hover:scale-105">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-cyan-400 hover:text-cyan-300">
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};
