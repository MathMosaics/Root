import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// FIX: Correctly typed the Sparkle component using React.FC to handle the 'key' prop, which is reserved by React and should not be part of the component's props type. This resolves an excess property error from TypeScript.
const Sparkle: React.FC<{ id: number }> = ({ id }) => {
    const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 1 + 0.5}s`,
        animationDelay: `${Math.random() * 0.5}s`,
    };
    return <div className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle" style={style} />;
};


// A simple Web Audio API sound generator
const playUnlockSound = () => {
    try {
        // Fix: Cast window to `any` to allow access to vendor-prefixed webkitAudioContext for Safari compatibility.
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        
        // A simple arpeggio
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1); // C#5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.3); // A5

        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
    } catch (e) {
        console.error("Web Audio API not supported or failed:", e);
    }
}


export const MonsterBattleUnlockModal = ({ isOpen, onStart, onLater }) => {
    
    useEffect(() => {
        if (isOpen) {
            playUnlockSound();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in">
             {/* Sparkle container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => <Sparkle key={i} id={i} />)}
            </div>

            <div
                className="relative bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center border-4 border-yellow-400 animate-monster-slam"
            >
                <div className="text-8xl mb-4">👾</div>
                <h2 className="text-4xl font-extrabold text-red-500 mb-2 uppercase tracking-wider">Monster Battle Unlocked!</h2>
                <p className="text-gray-300 text-lg mb-8">
                    Your math skills are legendary! A new, mighty challenge awaits!
                    <span className="block text-yellow-400 font-bold mt-2">
                        Warning: This battle will be at a higher difficulty!
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onStart}
                        className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-100 flex-1"
                    >
                        Start Battle!
                    </button>
                    <button
                        onClick={onLater}
                        className="px-6 py-3 bg-gray-600 text-white text-lg font-semibold rounded-xl hover:bg-gray-700 transition-colors flex-1"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes sparkle {
                    0% { transform: scale(0); opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-sparkle {
                    animation: sparkle ease-out forwards;
                }
                @keyframes monster-slam {
                    from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
                    to { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                .animate-monster-slam {
                    animation: monster-slam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>,
        document.body
    );
};