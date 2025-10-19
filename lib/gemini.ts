import { GoogleGenAI } from "@google/genai";
import { gradeLevels } from '../useGradeLogic';

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.warn("Gemini API key not found. 'Show me how' feature will be disabled.");
}

/**
 * Generates a student-friendly explanation for a given math problem.
 * @param problem The problem object from the game state.
 * @param gradeId The player's current grade level ID.
 * @returns A promise that resolves with the explanation text.
 */
export const generateProblemExplanation = async (problem: any, gradeId: number): Promise<string> => {
    if (!ai) {
        return "The AI tutor is currently unavailable. Please check your API key.";
    }

    const gradeName = gradeLevels.find(g => g.id === gradeId)?.name || 'student';
    let problemText = '';
    
    // Convert the problem object into a simple string for the AI
    if (problem.type === 'arithmetic') {
        problemText = problem.question.replace('?', '').trim();
    } else if (problem.type === 'comparison') {
        problemText = `comparing which group has more or less items. Group A has ${problem.data.groupA.count} and Group B has ${problem.data.groupB.count}.`;
    } else if (problem.type === 'counting') {
        problemText = `counting a group of ${problem.data.count} items.`;
    } else if (problem.type === 'picto') {
        problemText = `a picture math problem starting with ${problem.data.initial} items, and then an operation of '${problem.data.operation}' with ${problem.data.change} items.`;
    }

    const prompt = `
        You are a friendly and encouraging math teacher explaining a concept to a ${gradeName}.
        Do not solve the provided problem directly or give the answer.
        Instead, explain the general step-by-step method for solving this TYPE of problem.
        Keep the language simple, clear, and encouraging. Use bullet points or numbered lists for the steps.

        Problem for context: "${problemText}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating explanation from Gemini:", error);
        return "Sorry, I'm having trouble explaining this right now. Please try again in a moment.";
    }
};
