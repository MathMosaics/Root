import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { getProfileDocRef, getBuildsCollectionRef, saveProfileToFirestore } from '../firebase/firestore';
import { initialProfile } from '../constants';

// Define types for better code quality
type Profile = typeof initialProfile & { isInitialized: boolean; [key: string]: any };
type Build = { id: string; name: string; blocks: any[]; [key: string]: any };

export const usePlayerProfile = (isAuthReady: boolean, userId: string | null, isFirebaseEnabled: boolean, appId: string) => {
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [savedBuilds, setSavedBuilds] = useState<Build[]>([]);

    useEffect(() => {
        if (!isAuthReady || !userId || !db || !isFirebaseEnabled) {
            if (!userId) {
                setProfile(initialProfile);
                setSavedBuilds([]);
            }
            return;
        }

        const unsubscribeProfile = getProfileDocRef(appId, userId).onSnapshot((docSnap) => {
            if (docSnap.exists) {
                const data = docSnap.data();
                setProfile(prev => ({
                    ...initialProfile,
                    ...data,
                    isInitialized: true
                }));
            } else {
                saveProfileToFirestore(appId, userId, initialProfile);
                setProfile({ ...initialProfile, isInitialized: true });
            }
        }, (error) => console.error("Profile snapshot error:", error));

        const buildsQuery = getBuildsCollectionRef(appId, userId);
        const unsubscribeBuilds = buildsQuery.onSnapshot((snapshot) => {
            const buildsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Build[];
            setSavedBuilds(buildsList);
        }, (error) => console.error("Builds snapshot error:", error));

        return () => {
            unsubscribeProfile();
            unsubscribeBuilds();
        };
    }, [isAuthReady, userId, isFirebaseEnabled, appId]);

    useEffect(() => {
        if (!isFirebaseEnabled && isAuthReady) {
            setProfile(prev => ({...prev, isInitialized: true}));
        }
    }, [isFirebaseEnabled, isAuthReady]);

    const handleGradeChange = (newGradeId: number) => {
        const newProfile = { ...profile, gradeId: newGradeId };
        setProfile(newProfile);
        if (isFirebaseEnabled && userId) {
            saveProfileToFirestore(appId, userId, newProfile);
        }
    };

    const handleDeleteMultipleBuilds = async (buildIds: string[]) => {
        if (!isFirebaseEnabled || !userId || !db || buildIds.length === 0) {
            console.warn("Cannot delete builds. User not logged in or no builds selected.");
            return;
        }

        try {
            const buildsToDelete = savedBuilds.filter(build => buildIds.includes(build.id));
            if (buildsToDelete.length === 0) return;

            const returnedBlocks: { [key: string]: number } = {};
            buildsToDelete.forEach(build => {
                if (build.blocks && Array.isArray(build.blocks)) {
                    build.blocks.forEach(block => {
                        returnedBlocks[block.type] = (returnedBlocks[block.type] || 0) + 1;
                    });
                }
            });

            const newInventory = { ...profile.inventory };
            Object.entries(returnedBlocks).forEach(([type, count]) => {
                newInventory[type] = (Number(newInventory[type]) || 0) + count;
            });
            
            const batch = db.batch();
            const profileRef = getProfileDocRef(appId, userId);
            batch.update(profileRef, { inventory: newInventory });

            buildIds.forEach(id => {
                const buildRef = getBuildsCollectionRef(appId, userId).doc(id);
                batch.delete(buildRef);
            });

            await batch.commit();

        } catch (error) {
            console.error("Error deleting multiple builds:", error);
        }
    };

    return { profile, setProfile, savedBuilds, handleGradeChange, handleDeleteMultipleBuilds };
};
