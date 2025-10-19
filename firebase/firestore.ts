import { db } from './config';

export const getProfileDocRef = (appId: string, userId: string) => db.collection(`artifacts/${appId}/users/${userId}/game_profiles`).doc(userId);
export const getBuildsCollectionRef = (appId: string, userId: string) => db.collection(`artifacts/${appId}/users/${userId}/saved_builds`);

export const saveProfileToFirestore = async (appId: string, userId: string, profile: any) => {
    if (!db || !userId) return;
    try {
        await getProfileDocRef(appId, userId).set(profile, { merge: true });
    } catch (error) {
        console.error("Error saving profile:", error);
    }
};

export const saveBuildToFirestore = async (appId: string, userId: string, build: any) => {
    if (!db || !userId) return;
    try {
        if (build.id) {
            const buildDocRef = getBuildsCollectionRef(appId, userId).doc(build.id);
            await buildDocRef.update(build);
        } else {
            await getBuildsCollectionRef(appId, userId).add({
                ...build,
                createdAt: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error("Error saving build:", error);
    }
};

export const deleteBuildFromFirestore = async (appId: string, userId: string, buildId: string) => {
    if (!db || !userId || !buildId) return;
    try {
        const buildDocRef = getBuildsCollectionRef(appId, userId).doc(buildId);
        await buildDocRef.delete();
    } catch (error) {
        console.error("Error deleting build:", error);
    }
};
