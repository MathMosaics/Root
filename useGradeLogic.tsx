import { useCallback } from 'react';
import { coloredBlockTypes, monsterBlockTypes } from './constants';


// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Helper to generate multiple-choice options with one correct answer
const generateMcqOptions = (correctAnswer: string | number, allPossibleAnswers: (string | number)[], count: number): { options: (string | number)[], answer: string } => {
    const correct = String(correctAnswer);
    let distractors = allPossibleAnswers
        .map(String)
        .filter(ans => ans !== correct);
    
    const shuffledDistractors = shuffleArray(distractors);
    const options = [correct, ...shuffledDistractors.slice(0, count - 1)];
    const shuffledOptions = shuffleArray(options);
    const newAnswerIndex = shuffledOptions.findIndex(opt => opt === correct);
    const newAnswerLetter = String.fromCharCode(65 + newAnswerIndex); // A, B, C...

    return { options: shuffledOptions, answer: newAnswerLetter };
};


// FIX: Create a robust way to handle singular/plural nouns for dynamic questions.
const itemNouns = {
    'Apple': { singular: 'apple', plural: 'apples' },
    'Cow': { singular: 'cow', plural: 'cows' },
    'Pig': { singular: 'pig', plural: 'pigs' },
    'Chicken': { singular: 'chicken', plural: 'chickens' },
    'Fish': { singular: 'fish', plural: 'fish' },
    'Slime': { singular: 'slime', plural: 'slimes' },
    'Bat': { singular: 'bat', plural: 'bats' },
    'Spider': { singular: 'spider', plural: 'spiders' },
    'Stone': { singular: 'stone', plural: 'stones' },
    'WoodPlank': { singular: 'plank', plural: 'planks' },
    'Man': { singular: 'man', plural: 'men' },
    'Woman': { singular: 'woman', plural: 'women' },
};
const countableItems = Object.keys(itemNouns);

const getNoun = (item: string, count: number = 1): string => {
    const nouns = itemNouns[item];
    if (!nouns) return item.toLowerCase();
    return count === 1 ? nouns.singular : nouns.plural;
};

const sortableItems = [
    { name: 'Insect', size: 1 },
    { name: 'Fish', size: 2 },
    { name: 'Bird', size: 3 },
    { name: 'Apple', size: 4 },
    { name: 'Cat', size: 10 },
    { name: 'Dog', size: 12 },
    { name: 'Chicken', size: 13 },
    { name: 'Pig', size: 15 },
    { name: 'Cow', size: 20 },
    { name: 'Man', size: 25 },
    { name: 'Woman', size: 25 },
    { name: 'Elephant', size: 50 },
];


export const gradeLevels = [
    { id: 1, name: 'Grade K', problemTypes: ['counting', 'comparison', 'sorting'] },
    { id: 2, name: 'Grade 1', problemTypes: ['counting', 'comparison', 'arithmetic_add_sub_20', 'picto'] },
    {
        id: 3, name: 'Grade 2', problemTypes: [
            // Replaced generic arithmetic with specific types for better variety
            'arithmetic_add_multi_2_digit', // Covers multi-digit addition
            'arithmetic_sub_100',          // NEW: Dedicated subtraction
            'arithmetic_mul_intro',        // NEW: Intro to multiplication
            'arithmetic_div_intro',        // NEW: Intro to division
            'word-problem-add-sub',
            'place-value-comparison',
            'fraction-identification',
            'shape-identification',
            'counting-money',
            'telling-time-interactive'
        ]
    },
    { id: 4, name: 'Grade 3', problemTypes: ['arithmetic_mul_div_100', 'picto_mul_div'] },
    { id: 5, name: 'Grade 4', problemTypes: ['arithmetic_all', 'fractions_simple'] },
    { id: 6, name: 'Grade 5', problemTypes: ['arithmetic_all', 'fractions_advanced', 'decimals'] },
];

// All available reward blocks, categorized
const allRewards = {
    basic: ['Dirt', 'Stone', 'WoodPlank', 'WoodTrunk', 'Leaves', 'Sand', 'Gravel', 'Grass'],
    animals: ['Cow', 'Pig', 'Chicken', 'Dog', 'Cat', 'Bird', 'Fish', 'Insect', 'Elephant'],
    minerals: ['Iron', 'Copper', 'Marble', 'Silver', 'Gold'],
    people: ['Man', 'Woman', 'Baby'],
    building: ['Window', 'Door', 'Shingles', 'Table', 'Chair'],
    rare: ['Diamond'],
    colored: coloredBlockTypes,
    monsters: monsterBlockTypes
};

// Define rewards for each obstacle type
const obstacleRewards: { [key: string]: { common: string[], rare?: string[], count: [number, number], preview: string } } = {
    'Diggin\' It': { common: allRewards.basic, rare: allRewards.minerals, count: [3, 6], preview: 'Basic blocks & minerals' },
    'Pick-els!': { common: allRewards.minerals, rare: ['Diamond'], count: [2, 4], preview: 'Minerals & maybe a Diamond!' },
    'Chop Chop!': { common: ['WoodTrunk', 'WoodPlank', 'Leaves', 'Apple'], count: [3, 5], preview: 'Wood, leaves & apples' },
    "It's ALIVE!": { common: allRewards.animals, rare: allRewards.people, count: [1, 2], preview: 'Animals & people' },
    'A-La-Built!': { common: allRewards.building, count: [2, 4], preview: 'Building materials' },
    'Block-o-Rama!': { common: allRewards.colored, count: [5, 10], preview: 'Colorful blocks!' },
    'Monster Battle': { common: allRewards.monsters, count: [1, 3], preview: 'Monster blocks!' }
};


const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;


const generateProblem = (gradeId: number, monsterBattle: boolean = false) => {
    const level = gradeLevels.find(g => g.id === gradeId) || gradeLevels[0];
    const problemTypes = level.problemTypes;
    const type = getRandomElement(problemTypes);

    let problem: any = {};
    let op, n1, n2, answer;

    switch (type) {
        case 'counting':
            const itemToCount = getRandomElement(countableItems);
            const count = getRandomInt(3, 15);
            problem = { 
                type: 'counting', 
                question: `How many ${getNoun(itemToCount, count)} are there?`, 
                data: { icon: itemToCount, count: count }, 
                answer: count 
            };
            break;
        case 'comparison':
            n1 = getRandomInt(1, 10);
            n2 = getRandomInt(1, 10);
            if (n1 === n2) n2++;
            problem = {
                type: 'comparison',
                question: 'Which group has more?',
                data: {
                    groupA: { icon: 'Apple', count: n1 },
                    groupB: { icon: 'Stone', count: n2 },
                    options: ['A', 'B']
                },
                answer: n1 > n2 ? 'A' : 'B'
            };
            break;
        case 'sorting':
            const shuffledSortable = shuffleArray(sortableItems);
            const itemsToSort = shuffledSortable.slice(0, 3);
            const sortOrder = Math.random() > 0.5 ? 'asc' : 'desc';
            const question = sortOrder === 'asc'
                ? 'Put these in order from SMALLEST to BIGGEST.'
                : 'Put these in order from BIGGEST to SMALLEST.';
            
            const sortedItems = [...itemsToSort].sort((a, b) => {
                return sortOrder === 'asc' ? a.size - b.size : b.size - a.size;
            });

            problem = {
                type: 'sorting',
                question,
                data: {
                    // provide shuffled items for user to sort
                    items: shuffleArray(itemsToSort.map(item => item.name)),
                },
                // The answer is the correctly ordered list of names
                answer: sortedItems.map(item => item.name),
            };
            break;
        case 'arithmetic_add_sub_20':
            op = getRandomElement(['+', '-']);
            n1 = getRandomInt(1, 20);
            n2 = getRandomInt(1, op === '+' ? 20 - n1 : n1);
            answer = op === '+' ? n1 + n2 : n1 - n2;
            problem = { type: 'arithmetic', question: `${n1} ${op} ${n2} = ?`, answer };
            break;
        case 'arithmetic_add_sub_100':
             op = getRandomElement(['+', '-']);
            n1 = getRandomInt(10, 100);
            n2 = getRandomInt(10, op === '+' ? 100 - n1 : n1);
            answer = op === '+' ? n1 + n2 : n1 - n2;
            problem = { type: 'arithmetic', question: `${n1} ${op} ${n2} = ?`, answer };
            break;
        case 'arithmetic_mul_div_100':
            op = getRandomElement(['*', '/']);
            if (op === '*') {
                n1 = getRandomInt(2, 10);
                n2 = getRandomInt(2, 10);
                answer = n1 * n2;
                problem = { type: 'arithmetic', question: `${n1} × ${n2} = ?`, answer };
            } else {
                answer = getRandomInt(2, 10);
                n2 = getRandomInt(2, 10);
                n1 = answer * n2;
                problem = { type: 'arithmetic', question: `${n1} ÷ ${n2} = ?`, answer };
            }
            break;
        case 'picto':
            op = getRandomElement(['add', 'subtract']);
            const pictoItem = getRandomElement(countableItems);
            const opText = op === 'add' ? 'get' : 'lose';
            const moreText = op === 'add' ? ' more' : '';

            n1 = getRandomInt(3, 10);
            n2 = getRandomInt(1, op === 'add' ? 10 - n1 : n1 - 1);
            answer = op === 'add' ? n1 + n2 : n1 - n2;
            
            problem = {
                type: 'picto',
                question: `You have ${n1} ${getNoun(pictoItem, n1)}. Then you ${opText} ${n2}${moreText}. How many ${getNoun(pictoItem, 0)} do you have now?`,
                data: { icon: pictoItem, initial: n1, operation: op, change: n2 },
                answer
            };
            break;
         case 'place-value-comparison':
            const n1_pv = getRandomInt(100, 999);
            let n2_pv = getRandomInt(100, 999);
            while (n1_pv === n2_pv) {
                n2_pv = getRandomInt(100, 999);
            }
            const correctSymbol = n1_pv > n2_pv ? '>' : '<';
            const mcq_pv = generateMcqOptions(correctSymbol, ['<', '>', '='], 3);
            problem = {
                type: 'place-value-comparison',
                question: `Which symbol makes this true? ${n1_pv} ___ ${n2_pv}`,
                data: { options: mcq_pv.options },
                answer: mcq_pv.answer
            };
            break;

        case 'arithmetic_add_multi_2_digit':
            const numCount = getRandomInt(3, 4);
            const nums = Array.from({ length: numCount }, () => getRandomInt(10, 99));
            const sum = nums.reduce((a, b) => a + b, 0);
            problem = {
                type: 'arithmetic',
                question: `What is ${nums.join(' + ')}?`,
                data: { numbers: nums, operator: '+' },
                answer: sum
            };
            break;
        
        case 'word-problem-add-sub':
            const item = getRandomElement(['apples', 'pencils', 'stickers', 'marbles']);
            const startAmount = getRandomInt(20, 100);
            const changeAmount = getRandomInt(5, 19);
            const operation = getRandomElement(['lose', 'get']);
            const wordProblemAnswer = operation === 'get' ? startAmount + changeAmount : startAmount - changeAmount;
            problem = {
                type: 'arithmetic', // Uses numeric input
                question: `You have ${startAmount} ${item}. Then you ${operation} ${changeAmount}. How many ${item} do you have now?`,
                answer: wordProblemAnswer
            };
            break;

        case 'fraction-identification':
            const denominators = [2, 3, 4];
            const denominator = getRandomElement(denominators);
            const numerator = getRandomInt(1, denominator);
            const shape = getRandomElement(['circle', 'rectangle']);
            const allFractions = ['1/2', '1/3', '2/3', '1/4', '2/4', '3/4'];
            const mcq_frac = generateMcqOptions(`${numerator}/${denominator}`, allFractions, 3);
            problem = {
                type: 'fraction-identification',
                question: 'What fraction of the shape is shaded?',
                data: { shape, numerator, denominator, options: mcq_frac.options },
                answer: mcq_frac.answer
            };
            break;

        case 'shape-identification':
            const shapes = ['Triangle', 'Square', 'Rectangle', 'Circle', 'Pentagon', 'Hexagon'];
            const correctShape = getRandomElement(shapes);
            const mcq_shape = generateMcqOptions(correctShape, shapes, 4);
            problem = {
                type: 'shape-identification',
                question: 'What shape is this?',
                data: { shape: correctShape, options: mcq_shape.options },
                answer: mcq_shape.answer
            };
            break;

        case 'counting-money':
            const dollars1 = getRandomInt(0, 4);
            const dollars5 = getRandomInt(0, 2);
            const quarters = getRandomInt(0, 4);
            const dimes = getRandomInt(0, 5);
            const nickels = getRandomInt(0, 5);
            const pennies = getRandomInt(0, 5);
            
            const totalCents = (dollars1 * 100) + (dollars5 * 500) + (quarters * 25) + (dimes * 10) + (nickels * 5) + pennies;
            
            // Ensure there's some money to count
            if (totalCents === 0) return generateProblem(gradeId, monsterBattle);

            const moneyAnswer = (totalCents / 100).toFixed(2);

            problem = {
                type: 'counting-money', // This will now be a numeric input type
                question: 'How much money is shown?',
                data: {
                    bills: { '1s': dollars1, '5s': dollars5 },
                    coins: { quarters, dimes, nickels, pennies }
                },
                answer: moneyAnswer
            };
            break;

        case 'telling-time-interactive':
            const hour = getRandomInt(1, 12);
            const minute = getRandomInt(0, 11) * 5; // To the nearest 5 minutes
            const formattedMinute = minute < 10 ? `0${minute}` : minute;
            const timeAnswer = `${hour}:${formattedMinute}`;
            problem = {
                type: 'telling-time-interactive',
                question: `Set the clock to ${timeAnswer}`,
                answer: timeAnswer
            };
            break;

        case 'arithmetic_sub_100':
            n1 = getRandomInt(20, 100);
            n2 = getRandomInt(10, n1); // Ensure n2 isn't larger and result is positive.
            answer = n1 - n2;
            problem = { type: 'arithmetic', question: `${n1} - ${n2} = ?`, answer };
            break;

        case 'arithmetic_mul_intro':
            n1 = getRandomInt(2, 10);
            n2 = getRandomInt(2, 5);
            if (Math.random() > 0.5) [n1, n2] = [n2, n1];
            answer = n1 * n2;
            problem = { type: 'arithmetic', question: `${n1} × ${n2} = ?`, answer };
            break;

        case 'arithmetic_div_intro':
            const divisor = getRandomInt(2, 5);
            const quotient = getRandomInt(2, 10);
            const dividend = divisor * quotient;
            answer = quotient;
            problem = { type: 'arithmetic', question: `${dividend} ÷ ${divisor} = ?`, answer };
            break;

        default:
            // Fallback to a simple problem
            n1 = getRandomInt(1, 10);
            n2 = getRandomInt(1, 10);
            answer = n1 + n2;
            problem = { type: 'arithmetic', question: `${n1} + ${n2} = ?`, answer };
    }
    
    // Monster battles are harder
    if (monsterBattle) {
        // Just making numbers bigger for now
        if (problem.type === 'arithmetic') {
             let q = problem.question.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
             if (q) {
                let num1 = parseInt(q[1]) * 2;
                let num2 = parseInt(q[3]) * 2;
                let operator = q[2];
                let newAnswer;
                if(operator === '+') newAnswer = num1 + num2;
                if(operator === '-') newAnswer = num1 - n2;
                if(operator === '×') newAnswer = num1 * num2;
                if(operator === '÷') {
                    num1 = num1 * num2; // make it divisible
                    newAnswer = num1 / num2;
                }
                problem.question = `${num1} ${operator} ${num2} = ?`;
                problem.answer = newAnswer;
             }
        }
    }

    return problem;
};

const getProblemCountForGrade = (gradeId: number, isMonsterBattle: boolean): number => {
    // For a monster battle, the difficulty (and number of questions) is based on the *next* grade level.
    // We cap the effective grade ID at the maximum level available.
    const maxGradeId = gradeLevels.reduce((max, level) => Math.max(max, level.id), 0);
    const effectiveGradeId = isMonsterBattle ? Math.min(gradeId + 1, maxGradeId) : gradeId;

    switch (effectiveGradeId) {
        case 1: return getRandomInt(3, 5); // Kindergarten
        case 2: return 8;  // Grade 1
        case 3: return 12; // Grade 2
        case 4: return 16; // Grade 3
        case 5: return 20; // Grade 4
        case 6: return 20; // Grade 5
        default: return 3;
    }
};

export const useGradeData = (gradeId: number) => {
    const currentGradeLevel = gradeLevels.find(g => g.id === gradeId) || gradeLevels[0];

    const getRewardForObstacle = useCallback((obstacleName: string) => {
        const rewardInfo = obstacleRewards[obstacleName];
        if (!rewardInfo) return {};

        const { common, rare, count } = rewardInfo;
        const rewardCount = getRandomInt(count[0], count[1]);
        const rewards: { [key: string]: number } = {};

        for (let i = 0; i < rewardCount; i++) {
            // 10% chance for a rare reward if available
            const useRare = rare && rare.length > 0 && Math.random() < 0.1;
            const blockType = useRare ? getRandomElement(rare!) : getRandomElement(common);
            rewards[blockType] = (rewards[blockType] || 0) + 1;
        }
        return rewards;
    }, []);

    const generateNewProblemSet = useCallback((isMonsterBattle: boolean) => {
        const problemCount = getProblemCountForGrade(gradeId, isMonsterBattle);
        const problems = [];
        for (let i = 0; i < problemCount; i++) {
            problems.push(generateProblem(gradeId, isMonsterBattle));
        }
        return problems;
    }, [gradeId]);

    const generateSingleProblem = useCallback((isMonsterBattle: boolean) => {
        return generateProblem(gradeId, isMonsterBattle);
    }, [gradeId]);
    
    const getRewardPreviewText = useCallback((obstacleName: string) => {
        return obstacleRewards[obstacleName]?.preview || "Mystery Blocks";
    }, []);

    return { currentGradeLevel, getRewardForObstacle, generateNewProblemSet, getRewardPreviewText, generateSingleProblem };
};
