// This file will manage loading image assets.
// For now, we'll manually list the paths. In a real project with a build server,
// a script could automatically generate this list.

// The list of all image assets the game uses.
export const imagePaths: string[] = [
    '/assets/Dirt.png',
    '/assets/WoodTrunk.png',
    '/assets/Stone.png',
    '/assets/WoodPlank.png',
    '/assets/Apple.png',
    '/assets/Sand.png',
    '/assets/Grass.png',
    '/assets/Man.png',
    '/assets/Woman.png',
    '/assets/Baby.png',
    '/assets/Cow.png',
    '/assets/Pig.png',
    '/assets/Chicken.png',
    '/assets/Dog.png',
    '/assets/Cat.png',
    '/assets/Bird.png',
    '/assets/Fish.png',
    '/assets/Insect.png',
    '/assets/Elephant.png',
    // Mineral Assets
    '/assets/Iron.png',
    '/assets/Copper.png',
    '/assets/Marble.png',
    '/assets/Silver.png',
    '/assets/Gold.png',
    // Monster Assets
    '/assets/Slime.png',
    '/assets/Bat.png',
    '/assets/Spider.png',
    '/assets/Ghost.png',
    '/assets/Zombie.png',
    '/assets/Skeleton.png',
    '/assets/Ogre.png',
    '/assets/Golem.png',
    '/assets/Dragon.png',
];

/**
 * Converts a Blob (like an image file) to a Base64 data URL.
 * @param blob The blob to convert.
 * @returns A promise that resolves with the data URL string.
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("FileReader did not return a string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Takes an array of image URLs, fetches them, and converts them to a map of
 * filename -> base64 data URL.
 * @param paths An array of strings, where each string is a path to an image.
 * @returns A promise that resolves to a Record<string, string>.
 */
export async function loadImagesAsBase64(paths: string[]): Promise<Record<string, string>> {
    const assetMap: Record<string, string> = {};

    const promises = paths.map(async (path) => {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for path ${path}`);
            }
            const blob = await response.blob();
            const base64 = await blobToBase64(blob);

            // Extract filename without extension to use as a key
            // e.g., "/assets/sword.png" becomes "sword"
            const filename = path.split('/').pop()?.split('.').shift();
            if (filename) {
                assetMap[filename] = base64;
            }
        } catch (error) {
            console.error(`Failed to load or convert image at ${path}:`, error);
            // We can decide to either throw, or let it fail gracefully.
            // For now, we'll just log the error and continue.
        }
    });

    await Promise.all(promises);

    return assetMap;
}