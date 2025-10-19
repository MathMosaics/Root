import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { db, auth, firebaseInitialized } from './firebase/config';
import { LoadingSpinner } from './components/ui';

import { gradeLevels, useGradeData } from './useGradeLogic';
import { loadImagesAsBase64, imagePaths } from './imageLoader';

import { AuthScreen } from './components/views/AuthScreen';
import { MainMenu } from './components/views/MainMenu';
import { MapExplorationView } from './components/views/MapExplorationView';
import { ChallengeModal } from './components/modals/ChallengeModal';
import { BuildsModal } from './components/modals/BuildsModal';
import { MonsterBattleUnlockModal } from './components/modals/MonsterBattleUnlockModal';
import { BuildingCanvas } from './components/views/BuildingCanvas';
import { useAuth } from './hooks/useAuth';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { useGameState } from './hooks/useGameState';


declare const __app_id: string;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
    const { user, userId, isAuthReady, authError, handleSignUp, handleLogin, handleLogout } = useAuth();
    const { profile, setProfile, savedBuilds, handleGradeChange, handleDeleteMultipleBuilds } = usePlayerProfile(isAuthReady, userId, firebaseInitialized, appId);
    
    const isFirebaseEnabled = firebaseInitialized;
    
    const { currentGradeLevel, getRewardForObstacle, generateNewProblemSet, getRewardPreviewText, generateSingleProblem } = useGradeData(profile.gradeId);

    const {
        gameState,
        setGameState,
        challengeState,
        setChallengeState,
        buildState,
        setBuildState,
        buildsModalOpen,
        setBuildsModalOpen,
        showMonsterUnlockModal,
        setShowMonsterUnlockModal,
        startChallenge,
        submitAnswer,
        handleRequestInstruction,
        handleAcknowledgeInstruction,
        startNewBuild,
        loadBuildForEditing,
        handleSaveBuild,
        handlePlayPendingBattle,
        handleDeferMonsterBattle,
    } = useGameState({ userId, profile, setProfile, isFirebaseEnabled, appId, getRewardForObstacle, generateNewProblemSet, savedBuilds, generateSingleProblem });

    const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
    const [imagesLoading, setImagesLoading] = useState(true);

    useEffect(() => {
        if (isAuthReady && !user) {
            setGameState('main-menu');
        }
    }, [isAuthReady, user, setGameState]);


    useEffect(() => {
        const fetchImages = async () => {
            try {
                const images = await loadImagesAsBase64(imagePaths);
                setLoadedImages(images);
            } catch (error) {
                console.error("Failed to load game assets:", error);
            } finally {
                setImagesLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (!isAuthReady || imagesLoading) {
        return <LoadingSpinner text={imagesLoading ? "Loading assets..." : "Connecting..."} />;
    }
    
    if (!user && isFirebaseEnabled) {
        return <AuthScreen onSignUp={handleSignUp} onLogin={handleLogin} error={authError} />;
    }

    if (!profile.isInitialized) {
        return <LoadingSpinner text="Loading player data..." />;
    }

    return (
        <div className="min-h-screen bg-gray-800 text-white font-inter flex flex-col">
            {gameState !== 'main-menu' && gameState !== 'build' && (
                <header className="bg-gray-900 p-3 shadow-lg flex justify-between items-center sticky top-0 z-10">
                    <h1 className="text-3xl font-extrabold text-lime-400">
                        <span className="text-xl text-yellow-300">Math Mosaics</span>
                    </h1>
                    <div className="flex space-x-4 items-center">
                        <div className="text-sm bg-gray-700 p-2 rounded-lg px-4 font-mono shadow-inner border border-gray-600 flex items-center space-x-3">
                            {isFirebaseEnabled && user ? (
                                <button
                                    onClick={() => setGameState('main-menu')}
                                    className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-lg transition-transform transform hover:scale-105"
                                    title="Save and Exit to Main Menu"
                                >
                                    Exit
                                </button>
                            ) : (
                                <span className="text-yellow-400 font-bold">Offline Mode</span>
                            )}
                        </div>

                        <button
                            onClick={() => setBuildsModalOpen(true)}
                            className="p-3 bg-yellow-800 hover:bg-yellow-700 text-white rounded-full shadow-lg transition-transform transform hover:scale-105"
                            title="View Saved Builds"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.5 3a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM15.75 8a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5a.75.75 0 01.75-.75zM10 8.75a.75.75 0 00-.75.75v5.5a.75.75 0 001.5 0v-5.5a.75.75 0 00-.75-.75zM4 11.25a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5a.75.75 0 00-.75-.75z"></path>
                            </svg>
                        </button>
                        <button
                            onClick={() => setGameState('map')}
                            className="p-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-transform transform hover:scale-105"
                            title="Back to Map"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                            </svg>
                        </button>
                    </div>
                </header>
            )}

            <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
                 {gameState === 'main-menu' && (
                    <MainMenu
                        user={user}
                        onStartGame={() => setGameState('map')}
                        onOpenBuilds={() => setBuildsModalOpen(true)}
                        onLogout={handleLogout}
                    />
                )}
                
                {gameState === 'map' && (
                    <>
                        <div className="w-full max-w-4xl mb-6 p-4 bg-gray-700 rounded-xl shadow-xl border-t-4 border-lime-500">
                            <h2 className="text-xl font-bold mb-2">Current Grade Level: <span className="text-lime-400">{currentGradeLevel.name}</span></h2>
                            <div className="flex flex-wrap items-center justify-between">
                                <div className="flex flex-wrap gap-2 items-center">
                                    {gradeLevels.map(level => (
                                        <button
                                            key={level.id}
                                            onClick={() => handleGradeChange(level.id)}
                                            className={`px-4 py-2 rounded-full font-semibold transition-all shadow-md
                                                ${profile.gradeId === level.id
                                                ? 'bg-lime-500 text-gray-900 ring-2 ring-lime-300'
                                                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                            }`}
                                        >
                                            {level.name}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handlePlayPendingBattle}
                                    className={`px-4 py-2 rounded-full font-semibold transition-all shadow-md flex items-center gap-2
                                        ${(profile.pendingBattlesCount || 0) > 0
                                        ? 'bg-purple-700 hover:bg-purple-600 text-white cursor-pointer ring-2 ring-purple-400 animate-pulse'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={(profile.pendingBattlesCount || 0) === 0}
                                    title="View pending monster battles"
                                >
                                    <span>Pending Battles</span>
                                    <span className="bg-gray-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-1 ring-gray-500">
                                        {profile.pendingBattlesCount || 0}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <MapExplorationView
                            currentGradeLevel={currentGradeLevel}
                            onStartChallenge={startChallenge}
                            onStartBuild={startNewBuild}
                            inventory={profile.inventory}
                            getRewardPreviewText={getRewardPreviewText}
                            loadedImages={loadedImages}
                            monsterBattleIsPending={profile.monsterBattleIsPending}
                        />
                    </>
                )}
                {(gameState === 'challenge' || challengeState.isOpen) && (
                    <ChallengeModal
                        challengeState={challengeState}
                        onSubmitAnswer={submitAnswer}
                        onClose={() => { setChallengeState(s => ({ ...s, isOpen: false })); setGameState('map'); }}
                        getRewardPreviewText={getRewardPreviewText}
                        loadedImages={loadedImages}
                        onRequestInstruction={handleRequestInstruction}
                        onAcknowledgeInstruction={handleAcknowledgeInstruction}
                        currentGradeLevel={currentGradeLevel}
                    />
                )}
            </main>

            {gameState === 'build' && buildState.isOpen && (
                <BuildingCanvas
                    buildState={buildState}
                    setBuildState={setBuildState}
                    inventory={profile.inventory}
                    onInventoryUpdate={(newInventory) => {
                        setProfile(p => ({ ...p, inventory: newInventory }));
                    }}
                    onSave={handleSaveBuild}
                    onClose={() => {
                        setProfile(p => ({ ...p, inventory: buildState.inventoryOnEnter }));
                        setBuildState(s => ({ ...s, isOpen: false }));
                        setGameState('map');
                    }}
                    loadedImages={loadedImages}
                />
            )}

            <MonsterBattleUnlockModal
                isOpen={showMonsterUnlockModal}
                onStart={handlePlayPendingBattle}
                onLater={handleDeferMonsterBattle}
            />

            <BuildsModal
                isOpen={buildsModalOpen}
                onClose={() => setBuildsModalOpen(false)}
                savedBuilds={savedBuilds}
                onLoadBuild={loadBuildForEditing}
                onDeleteMultipleBuilds={handleDeleteMultipleBuilds}
                onNewBuild={startNewBuild}
            />
        </div>
    );
};


const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
    console.error("Root element not found. Make sure you have a div with id='root' in your HTML file.");
}
