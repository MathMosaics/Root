import React from 'react';
import { BlockIcon } from '../ui';

// FIX: Define the Obstacle type to include the optional 'requiredGrade' property, resolving a TypeScript error where the filter function was accessing a non-existent property.
type Obstacle = {
    name: string;
    theme: string;
    icon: string;
    color: string;
    requiredGrade?: number[];
};

export const MapExplorationView = ({ currentGradeLevel, onStartChallenge, onStartBuild, inventory, getRewardPreviewText, loadedImages, monsterBattleIsPending }) => {
    
    // Define all obstacle types statically so they are always available
    const allObstacles: Obstacle[] = [
        { name: 'Diggin\' It', theme: 'Mining', icon: '🪣', color: 'bg-yellow-800 hover:bg-yellow-700' },
        { name: 'Pick-els!', theme: 'Mining', icon: '⛏️', color: 'bg-stone-500 hover:bg-stone-400' },
        { name: 'Block-o-Rama!', theme: 'Creative', icon: '🌈', color: 'bg-purple-600 hover:bg-purple-500' },
        { name: 'Chop Chop!', theme: 'Chopping', icon: '🌳', color: 'bg-green-700 hover:bg-green-600' },
        { name: "It's ALIVE!", theme: 'Creation', icon: '🧬', color: 'bg-pink-500 hover:bg-pink-400' },
        { name: 'A-La-Built!', theme: 'Building', icon: '🏠', color: 'bg-amber-600 hover:bg-amber-500' },
    ];

    const availableObstacles = allObstacles.filter(o => !o.requiredGrade || o.requiredGrade.includes(currentGradeLevel.id));


    const totalBlocks = React.useMemo(() => {
        return Object.values(inventory ?? {}).reduce<number>((sum, count) => {
            const numericCount = Number(count);
            return sum + (Number.isFinite(numericCount) ? numericCount : 0);
        }, 0)
    }, [inventory]);


    return (
        <div className="w-full max-w-4xl p-6 bg-gray-700 rounded-xl shadow-2xl border-b-8 border-gray-600">
            <h2 className="text-3xl font-bold mb-4 text-center text-yellow-300 border-b pb-3 border-gray-600">The Overworld Map</h2>

            {/* Monster Battle Pending Button */}
            {monsterBattleIsPending && (
                <div className="mb-6 animate-pulse">
                     <button
                        onClick={() => onStartChallenge('Monster Battle')}
                        className="w-full p-6 rounded-xl shadow-2xl text-white font-extrabold text-2xl flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-100 bg-gradient-to-br from-red-600 to-purple-800 ring-4 ring-yellow-400"
                    >
                        <span className="text-6xl mr-4">👾</span>
                        <div>
                            <span>A Mighty Challenge Awaits!</span>
                            <span className="block text-lg font-normal">Click to Start the Monster Battle!</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Obstacles / Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {availableObstacles.map((o, index) => {
                    const rewardText = getRewardPreviewText(o.name);
                    
                    return (
                        <button
                            key={index}
                            onClick={() => onStartChallenge(o.name)}
                            className={`p-6 rounded-xl shadow-xl text-white font-bold text-lg flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-100 ${o.color}`}
                        >
                            <span className="text-5xl mb-2">{o.icon}</span>
                            <span className="text-2xl">{o.name}</span>
                            <span className="text-sm font-light mt-1 opacity-80">Reward: {rewardText}</span>
                        </button>
                    );
                })}
            </div>

            {/* Inventory Display */}
            <div className="mb-6 p-4 bg-gray-600 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <span className="mr-2">🎒</span> Inventory ({totalBlocks} Blocks)
                </h3>
                <div className="flex flex-wrap gap-4 max-h-40 overflow-y-auto pr-2">
                    {inventory && Object.entries(inventory).map(([block, count]) => {
                        const numericCount = Number(count);
                        if (numericCount > 0 && isFinite(numericCount)) {
                            return <BlockIcon key={block} block={block} count={numericCount} size="h-10 w-10" images={loadedImages} />;
                        }
                        return null;
                    })}
                    {totalBlocks === 0 && <p className="text-gray-400 italic">Inventory is empty. Solve challenges to earn blocks!</p>}
                </div>
            </div>
            
            {/* Building Access */}
            <div className="text-center pt-4 border-t border-gray-600">
                <button
                    onClick={onStartBuild}
                    className="px-8 py-3 bg-lime-500 text-gray-900 text-xl font-bold rounded-full shadow-2xl hover:bg-lime-400 transition-all transform hover:translate-y-[-2px] active:translate-y-0"
                >
                    Start Building! <span className="ml-2">🏗️</span>
                </button>
            </div>
        </div>
    );
};