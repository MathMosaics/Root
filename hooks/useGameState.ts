


import { useState, useCallback } from 'react';
import { saveProfileToFirestore, saveBuildToFirestore } from '../firebase/firestore';
import { generateProblemExplanation } from '../lib/gemini';
// FIX: Correctly type `initialBuildState.inventoryOnEnter` to match the expected inventory structure, resolving a TypeScript error in `index.tsx` when restoring inventory. This ensures type safety when updating the player's profile state.
import { initialProfile } from '../constants';

const initialChallengeState = {
    isOpen: false,
    obstacleName: '',
    problems: [],
    currentProblemIndex: 0,
    answers: [],
    isCorrect: null,
    rewards: {},
    isComplete: false,
    isMonsterBattle: false,
    instruction: '',
    showInstruction: false,
};

const initialBuildState = {
    isOpen: false,
    currentBlock: 'WoodPlank',
    inventoryOnEnter: {} as typeof initialProfile.inventory,
    currentBuild: { id: null, name: 'My Build', blocks: [] },
};

export const useGameState = ({ userId, profile, setProfile, isFirebaseEnabled, appId, getRewardForObstacle, generateNewProblemSet, savedBuilds, generateSingleProblem }) => {
    const [gameState, setGameState] = useState('main-menu');
    const [challengeState, setChallengeState] = useState(initialChallengeState);
    const [buildState, setBuildState] = useState(initialBuildState);
    const [buildsModalOpen, setBuildsModalOpen] = useState(false);
    const [showMonsterUnlockModal, setShowMonsterUnlockModal] = useState(false);

    const startChallenge = useCallback((obstacleName) => {
        const isMonsterBattle = obstacleName === 'Monster Battle';
        const newProblems = generateNewProblemSet(isMonsterBattle);
        const newRewards = getRewardForObstacle(obstacleName);

        setChallengeState({
            ...initialChallengeState,
            isOpen: true,
            obstacleName,
            problems: newProblems,
            rewards: newRewards,
            isMonsterBattle,
        });
        setGameState('challenge');
    }, [getRewardForObstacle, generateNewProblemSet]);

    const submitAnswer = useCallback((answer) => {
        const currentProblem = challengeState.problems[challengeState.currentProblemIndex];
        
        const letterBasedTypes = ['comparison', 'place-value-comparison', 'fraction-identification', 'shape-identification'];
        let correct = false;
        
        if (currentProblem.type === 'sorting') {
            // Answer is an array of strings
            correct = JSON.stringify(answer) === JSON.stringify(currentProblem.answer);
        } else {
            const formattedAnswer = String(answer).replace(/[$,]/g, '').trim();
            if (letterBasedTypes.includes(currentProblem.type)) {
                correct = formattedAnswer.toLowerCase() === String(currentProblem.answer).toLowerCase();
            } else if (currentProblem.type === 'telling-time-interactive') {
                correct = formattedAnswer === String(currentProblem.answer);
            } else { // Handles arithmetic, counting, and now counting-money
                // For money, compare values, not just strings, to handle cases like "5.2" vs "5.20"
                if (currentProblem.type === 'counting-money') {
                    const userAnswerCents = Math.round(parseFloat(formattedAnswer) * 100);
                    const correctAnswerCents = Math.round(parseFloat(String(currentProblem.answer)) * 100);
                    correct = !isNaN(userAnswerCents) && userAnswerCents === correctAnswerCents;
                } else {
                    correct = formattedAnswer.toLowerCase() === String(currentProblem.answer).toLowerCase();
                }
            }
        }


        setChallengeState(s => ({ ...s, isCorrect: correct }));

        setTimeout(() => {
            if (correct) {
                const nextIndex = challengeState.currentProblemIndex + 1;
                if (nextIndex >= challengeState.problems.length) {
                    // Challenge complete
                    const newInventory = { ...profile.inventory };
                    Object.entries(challengeState.rewards).forEach(([item, count]) => {
                        newInventory[item] = (Number(newInventory[item]) || 0) + (count as number);
                    });
                    
                    const newProfile = {
                        ...profile,
                        inventory: newInventory,
                        challengesCompleted: (profile.challengesCompleted || 0) + 1,
                        monsterBattleIsPending: challengeState.isMonsterBattle ? false : ((profile.challengesCompleted || 0) + 1) % 5 === 0,
                        pendingBattlesCount: challengeState.isMonsterBattle ? Math.max(0, (profile.pendingBattlesCount || 0) - 1) : profile.pendingBattlesCount
                    };
                    
                    setProfile(newProfile);
                    if (isFirebaseEnabled && userId) {
                        saveProfileToFirestore(appId, userId, newProfile);
                    }
                    
                    if (!challengeState.isMonsterBattle && newProfile.monsterBattleIsPending) {
                        setShowMonsterUnlockModal(true);
                        const newPendingProfile = {
                            ...newProfile,
                            monsterBattleIsPending: false, // Don't show modal again for this one
                            pendingBattlesCount: (newProfile.pendingBattlesCount || 0) + 1,
                        };
                        setProfile(newPendingProfile);
                        if (isFirebaseEnabled && userId) {
                            saveProfileToFirestore(appId, userId, newPendingProfile);
                        }
                    }

                    setChallengeState(s => ({ ...s, isComplete: true, isCorrect: null }));
                } else {
                    // Next problem
                    setChallengeState(s => ({ ...s, currentProblemIndex: nextIndex, isCorrect: null, showInstruction: false, instruction: '' }));
                }
            } else {
                // Incorrect answer
                setChallengeState(s => ({ ...s, isCorrect: false }));
                // Reset after a delay
                setTimeout(() => setChallengeState(s => ({ ...s, isCorrect: null })), 1500);
            }
        }, 1000);
    }, [challengeState, profile, setProfile, isFirebaseEnabled, userId, appId]);

    const handleRequestInstruction = useCallback(async () => {
        const currentProblem = challengeState.problems[challengeState.currentProblemIndex];
        if (!currentProblem) return;

        setChallengeState(s => ({ ...s, instruction: 'Thinking...' }));
        try {
            const explanation = await generateProblemExplanation(currentProblem, profile.gradeId);
            setChallengeState(s => ({ ...s, instruction: explanation, showInstruction: true }));
        } catch (error) {
            console.error(error);
            setChallengeState(s => ({ ...s, instruction: 'Sorry, I had trouble generating an explanation.', showInstruction: true }));
        }
    }, [challengeState.problems, challengeState.currentProblemIndex, profile.gradeId]);

    const handleAcknowledgeInstruction = useCallback(() => {
        setChallengeState(s => ({ ...s, showInstruction: false }));
    }, []);

    const startNewBuild = useCallback(() => {
        setBuildsModalOpen(false);
        setBuildState({
            isOpen: true,
            currentBlock: 'WoodPlank',
            inventoryOnEnter: { ...profile.inventory },
            currentBuild: { id: null, name: 'My New Build', blocks: [] },
        });
        setGameState('build');
    }, [profile.inventory]);

    const loadBuildForEditing = useCallback((build) => {
        setBuildsModalOpen(false);
        setBuildState({
            isOpen: true,
            currentBlock: 'WoodPlank',
            inventoryOnEnter: { ...profile.inventory },
            currentBuild: build,
        });
        setGameState('build');
    }, [profile.inventory]);

    const handleSaveBuild = useCallback(async (name, blocks) => {
        const buildData = {
            ...buildState.currentBuild,
            name,
            blocks,
            updatedAt: new Date().toISOString(),
        };
        setBuildState(s => ({ ...s, currentBuild: buildData }));
        if (isFirebaseEnabled && userId) {
            await saveBuildToFirestore(appId, userId, buildData);
        }
        // local save logic would go here if needed
    }, [buildState.currentBuild, isFirebaseEnabled, userId, appId]);

    const handlePlayPendingBattle = useCallback(() => {
        setShowMonsterUnlockModal(false);
        if ((profile.pendingBattlesCount || 0) > 0) {
            startChallenge('Monster Battle');
        }
    }, [profile.pendingBattlesCount, startChallenge]);
    
    const handleDeferMonsterBattle = useCallback(() => {
        setShowMonsterUnlockModal(false);
        const newProfile = {
            ...profile,
            monsterBattleIsPending: false, // Defer it, but don't lose it
            pendingBattlesCount: (profile.pendingBattlesCount || 0), // Already incremented
        };
        setProfile(newProfile);
        if (isFirebaseEnabled && userId) {
            saveProfileToFirestore(appId, userId, newProfile);
        }
    }, [profile, setProfile, isFirebaseEnabled, userId, appId]);

    return {
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
    };
};