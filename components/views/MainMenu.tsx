import React from 'react';

export const MainMenu = ({ user, onStartGame, onOpenBuilds, onLogout }) => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl p-8 border-t-4 border-lime-500 text-center animate-fade-in">
            <h1 className="text-5xl font-extrabold text-lime-400 mb-2">
                <span className="text-3xl text-yellow-300">Math Mosaics</span>
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
                Welcome back, <span className="font-bold text-teal-400">{user ? user.email : 'Offline Player'}</span>!
            </p>
            
            <div className="space-y-4">
                <button 
                    onClick={onStartGame} 
                    className="w-full py-4 px-4 bg-lime-600 hover:bg-lime-700 rounded-lg text-white font-bold text-xl transition-transform transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                    <span>▶️</span>
                    <span>Start Adventure</span>
                </button>
                <button 
                    onClick={onOpenBuilds} 
                    className="w-full py-4 px-4 bg-cyan-700 hover:bg-cyan-800 rounded-lg text-white font-bold text-xl transition-transform transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                    <span>🏗️</span>
                    <span>My Builds</span>
                </button>
                {user && (
                    <button 
                        onClick={onLogout} 
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold text-lg transition-transform transform hover:scale-105 mt-8"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    </div>
);
