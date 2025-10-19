// --- NEW: Color definitions for Block-o-Rama ---
const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Cyan'];
const blockShapes = ['Block', 'Slab', 'SmallBlock'];
export const coloredBlockTypes = colors.flatMap(color => blockShapes.map(shape => `${color}${shape}`));

const initialColoredInventory = coloredBlockTypes.reduce((acc, blockType) => {
    acc[blockType] = 0;
    return acc;
}, {});

const coloredBlockDimensions = colors.reduce((acc, color) => {
    acc[`${color}Block`] = { width: 40, height: 40 };
    acc[`${color}Slab`] = { width: 40, height: 20 };
    acc[`${color}SmallBlock`] = { width: 20, height: 20 };
    return acc;
}, {});


// --- NEW: Monster definitions ---
export const monsterBlockTypes = [
    'Slime', 'Bat', 'Spider', 'Ghost', // 1x1
    'Zombie', 'Skeleton',              // 1x2
    'Ogre', 'Golem',                   // 2x2
    'Dragon'                           // 3x2
];
const initialMonsterInventory = monsterBlockTypes.reduce((acc, blockType) => {
    acc[blockType] = 0;
    return acc;
}, {});

// --- Main Constants ---

export const initialProfile = {
    gradeId: 3, // Default Grade 2
    inventory: { 
        'Dirt': 10, 
        'WoodPlank': 5, 
        'Stone': 3, 
        'Diamond': 0,
        'WoodTrunk': 0,
        'Leaves': 0,
        'Water': 0,
        'Wool': 0,
        'Sand': 0,
        'Gravel': 0,
        'Apple': 0,
        'Grass': 0,
        'Man': 0,
        'Woman': 0,
        'Baby': 0,
        'Cow': 0,
        'Pig': 0,
        'Chicken': 0,
        'Dog': 0,
        'Cat': 0,
        'Bird': 0,
        'Fish': 0,
        'Insect': 0,
        'Elephant': 0,
        'Iron': 0,
        'Marble': 0,
        'Copper': 0,
        'Gold': 0,
        'Silver': 0,
        'Window': 0,
        'Door': 0,
        'Shingles': 0,
        'Table': 0,
        'Chair': 0,
        ...initialColoredInventory,
        ...initialMonsterInventory,
    },
    challengesCompleted: 0, // Tracks total challenges won
    monsterBattleIsPending: false, // Flag for the special event
    pendingBattlesCount: 0,
    isInitialized: false,
};

export const BLOCK_DIMENSIONS: { [key: string]: { width: number; height: number } } = {
    'Dirt': { width: 40, height: 40 },
    'Stone': { width: 40, height: 40 },
    'WoodPlank': { width: 80, height: 20 },
    'Diamond': { width: 40, height: 40 },
    'WoodTrunk': { width: 40, height: 40 },
    'Leaves': { width: 40, height: 40 },
    'Water': { width: 40, height: 40 },
    'Wool': { width: 40, height: 40 },
    'Sand': { width: 40, height: 40 },
    'Gravel': { width: 40, height: 40 },
    'Apple': { width: 15, height: 15 },
    'Grass': { width: 40, height: 10 },
    'Man': { width: 40, height: 80 },
    'Woman': { width: 40, height: 80 },
    'Baby': { width: 40, height: 40 },
    'Cow': { width: 60, height: 40 },
    'Pig': { width: 60, height: 40 },
    'Chicken': { width: 40, height: 40 },
    'Dog': { width: 60, height: 40 },
    'Cat': { width: 40, height: 40 },
    'Bird': { width: 20, height: 20 },
    'Fish': { width: 20, height: 20 },
    'Insect': { width: 20, height: 20 },
    'Elephant': { width: 80, height: 80 },
    'Iron': { width: 40, height: 40 },
    'Marble': { width: 40, height: 40 },
    'Copper': { width: 40, height: 40 },
    'Gold': { width: 40, height: 40 },
    'Silver': { width: 40, height: 40 },
    'Window': { width: 40, height: 40 },
    'Door': { width: 40, height: 80 },
    'Shingles': { width: 40, height: 20 },
    'Table': { width: 60, height: 40 },
    'Chair': { width: 40, height: 40 },
    ...coloredBlockDimensions,
    // Monster Dimensions
    'Slime': { width: 40, height: 40 },
    'Bat': { width: 40, height: 40 },
    'Spider': { width: 40, height: 40 },
    'Ghost': { width: 40, height: 40 },
    'Zombie': { width: 40, height: 80 },
    'Skeleton': { width: 40, height: 80 },
    'Ogre': { width: 80, height: 80 },
    'Golem': { width: 80, height: 80 },
    'Dragon': { width: 120, height: 80 },
};

// Defines the order of blocks in the build inventory bar for categorization.
export const blockOrder = [
    'Dirt', 'Stone', 'Gravel', 'Sand', 'Iron', 'Copper', 'Marble', 'Silver', 'Gold', 
    'WoodTrunk', 'WoodPlank', 'Leaves', 'Grass', 'Apple', 
    'Door', 'Window', 'Shingles', 'Table', 'Chair',
    // --- NEW: Colored blocks, grouped by color ---
    ...colors.flatMap(color => blockShapes.map(shape => `${color}${shape}`)),
    'Man', 'Woman', 'Baby', 'Cow', 'Pig', 'Chicken', 'Dog', 'Cat', 'Bird', 'Fish', 'Insect', 'Elephant',
    // --- NEW: Monsters category ---
    ...monsterBlockTypes,
    'Wool', 'Water', 'Diamond'
];