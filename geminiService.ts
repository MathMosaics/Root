import { GoogleGenAI } from "@google/genai";
import { type Analysis, type Source, type Game, type TeamStatsData, type Underdog } from '../types.ts';
import { cacheService } from './cacheService.ts';

// FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to resolve a TypeScript
// error and align with the @google/genai coding guidelines, which mandate using process.env.API_KEY.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    // This error will be shown in the browser's console if the key is missing.
    throw new Error("API_KEY environment variable not found. Please ensure it is configured in your deployment settings.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });


// Cache TTLs (Time-To-Live) in milliseconds
const ONE_HOUR = 60 * 60 * 1000;
const TWELVE_HOURS = 12 * ONE_HOUR;

export const fetchTodaysGames = async (sport: string): Promise<Game[]> => {
    const cacheKey = `games_${sport}`;
    const cachedGames = cacheService.get<Game[]>(cacheKey);

    if (cachedGames) {
        // Filter out games that have already started from the cached list
        const upcomingGames = cachedGames.filter(game => new Date(game.dateTime) > new Date());
        if (upcomingGames.length > 0) {
            return upcomingGames;
        }
    }
    
    // --- If cache is empty or all games have started, fetch new ones ---
    let leagueQuery: string;
    switch (sport) {
        case 'All':
            leagueQuery = 'from the following major US leagues: NBA, WNBA, NCAA Basketball, NFL, NCAA Football, MLB, and NHL';
            break;
        case 'Basketball':
            leagueQuery = 'from the NBA, WNBA, and NCAA';
            break;
        case 'Football':
            leagueQuery = 'from the NFL and NCAA';
            break;
        case 'Baseball':
            leagueQuery = 'from the MLB';
            break;
        case 'Hockey':
            leagueQuery = 'from the NHL';
            break;
        default:
             leagueQuery = 'from major US professional and college leagues';
    }

    const prompt = `List up to 10 major upcoming games ${leagueQuery} scheduled to start today in the United States.
    IMPORTANT: You must strictly adhere to the specified leagues. Exclude all other leagues, including high school, international, or other minor leagues.

    Format each game as: "Team A vs Team B (Sport) [YYYY-MM-DDTHH:MM:SSZ]".
    For example: "Golden State Warriors vs Boston Celtics (Basketball) [2024-10-26T23:30:00Z]".
    The time must be in UTC and formatted as a full ISO 8601 string.
    Each game should be on a new line. Do not include any other text, headers, or explanations.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            // REMOVED: `tools: [{ googleSearch: {} }]` to conserve rate limit quota.
        });

        const text = response.text;
        if (!text) return [];

        const now = new Date();

        const games: Game[] = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.includes(' vs ') && line.includes('[') && line.includes(']'))
            .map(line => {
                const gameMatch = line.match(/(.*) vs (.*) \((.*?)\) \[(.*?)\]/);
                if (gameMatch && gameMatch.length === 5) {
                    const dateTimeString = gameMatch[4].trim();
                    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(dateTimeString)) return null;
                    return { teamA: gameMatch[1].trim(), teamB: gameMatch[2].trim(), sport: gameMatch[3].trim(), dateTime: dateTimeString };
                }
                return null;
            })
            .filter((game): game is Game => {
                if (game === null) return false;
                const gameDate = new Date(game.dateTime);
                return !isNaN(gameDate.getTime()) && gameDate > now;
            });
        
        cacheService.set(cacheKey, games, ONE_HOUR);
        return games;

    } catch (e) {
        console.error("Failed to fetch games list:", e);
        throw new Error("Could not fetch today's games. The AI model failed to respond.");
    }
};

export const fetchUnderdogOfTheDay = async (): Promise<Underdog | null> => {
    const cacheKey = 'underdog_of_the_day';
    const cachedUnderdog = cacheService.get<Underdog>(cacheKey);

    // If we have a cached underdog and their game hasn't started yet, return it instantly.
    if (cachedUnderdog && new Date(cachedUnderdog.dateTime) > new Date()) {
        return cachedUnderdog;
    }

    // Otherwise, fetch a new one. This runs only once per day or if the game starts.
    const prompt = `
    You are an expert sports betting analyst. Your task is to find the single biggest moneyline underdog of the day.

    1.  **Search Criteria:** Scan all upcoming games for today across all major US leagues (NBA, WNBA, NCAA Basketball, NFL, NCAA Football, MLB, NHL).
    2.  **Find the Underdog:** Identify the team with the highest positive moneyline odds (e.g., +450 is higher than +300). The game MUST NOT have started yet.
    3.  **Data Source:** You must search a minimum of 10 real, verifiable, and publicly accessible sports betting websites. Do NOT use "simulated", "illustrative", or placeholder data. The credibility of your work depends on using authentic, real-world odds.
    4.  **JSON Output:** Structure your response as a single, valid JSON object. Do not include any markdown or other text.
        The object must have the following keys:
        - "teamName": The name of the underdog team.
        - "matchup": A string describing the matchup (e.g., "Team A vs Team B").
        - "moneyLine": The highest moneyline odds you found for the underdog (e.g., "+550").
        - "dateTime": The scheduled start time of the game in UTC, formatted as a full ISO 8601 string (e.g., "2024-10-26T23:30:00Z").

    Example Response:
    {
      "teamName": "Orlando Magic",
      "matchup": "Orlando Magic vs Boston Celtics",
      "moneyLine": "+600",
      "dateTime": "2024-10-27T00:00:00Z"
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const cleanedText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const underdog = JSON.parse(cleanedText) as Underdog;
        
        // Safety check: ensure the AI returned a game that hasn't started
        if (new Date(underdog.dateTime) < new Date()) {
            console.warn("AI returned an underdog for a game that already started. Discarding.");
            cacheService.remove(cacheKey); // Clear any stale cache
            return null;
        }

        cacheService.set(cacheKey, underdog, TWELVE_HOURS);
        return underdog;

    } catch (error) {
        console.error("Error fetching underdog of the day from Gemini API:", error);
        // Don't throw an error to prevent the whole app from crashing, just return null.
        return null;
    }
};

export const analyzeMatchup = async (teamsQuery: string): Promise<{ analysis: Analysis; sources: Source[] } | null> => {
  const prompt = `
    You are an expert sports betting analyst. Your task is to analyze an upcoming matchup and find the average market odds from multiple real sources.

    Matchup: "${teamsQuery}"

    Part 1: Comprehensive Analysis
    Perform a comprehensive analysis covering:
    1.  **Recent Form:** How have the teams performed in their last 5-10 games?
    2.  **Head-to-Head:** What is the recent history between these two teams?
    3.  **Key Player Analysis:** Any notable injuries or absences?
    4.  **Statistical Comparison:** Compare key team statistics.
    5.  **Prediction:** Based on your analysis, determine which team is more likely to win.

    Part 2: Average Betting Odds Aggregation
    Search a minimum of 10 different **real, verifiable, and publicly accessible sports betting websites** (e.g., DraftKings, FanDuel, BetMGM, Caesars).
    **CRITICAL INSTRUCTION:** You MUST use real data from actual websites. Do NOT use any "simulated", "illustrative", "example", or placeholder sources. The credibility of this analysis depends entirely on the authenticity of your sources. Failure to use real data will result in an incorrect response. Only use websites that display odds without requiring a user membership.

    For each betting type below, collect the odds from all your sources and calculate the **average** for each line.

    Calculate the average odds for:
    1.  **Point Spread:** The average line for each team.
    2.  **MoneyLine:** The average odds for each team to win outright.
    3.  **Game Total (Over/Under):** The average line and a single prediction ('Over' or 'Under').
    4.  **Team Totals (Over/Under):** The average individual Over/Under line for each team.

    Part 3: JSON Formatting
    Structure your entire response as a single, valid JSON object. Do not include any markdown formatting. The object must have the following keys:
    - "teamA": A string with the name of the first team.
    - "teamB": A string with the name of the second team.
    - "predictedWinner": A string with the name of the team you predict will win.
    - "confidence": A string indicating your confidence level ('High', 'Medium', or 'Low').
    - "analysis": A string containing your detailed analysis from Part 1. Use newline characters for formatting.
    - "oddsSources": An array of strings listing the names of the real sportsbooks you used to calculate the averages.
    - "odds": An object containing the calculated **average** odds from Part 2, structured as follows:
      {
        "spread": {
          "teamA": { "value": "-5.5", "odds": "-110" },
          "teamB": { "value": "+5.5", "odds": "-110" }
        },
        "moneyLine": {
          "teamA": { "value": "-210" },
          "teamB": { "value": "+180" }
        },
        "overUnder": {
          "prediction": "Over",
          "value": "221.5",
          "odds": "-110"
        },
        "teamTotals": {
          "teamA": { "prediction": "Over", "value": "112.5", "odds": "-115" },
          "teamB": { "prediction": "Under", "value": "109.5", "odds": "-115" }
        }
      }
    If you cannot find odds for a specific type, return an empty object for it (e.g., "spread": {}).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const cleanedText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const analysis = JSON.parse(cleanedText) as Analysis;
    
    if (!analysis) {
      console.error("Could not parse a valid analysis object from the model's response.");
      return null;
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = [];
    if (groundingMetadata?.groundingChunks) {
        const uniqueHostnames = new Set<string>();
        for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web && chunk.web.uri) {
                try {
                    const hostname = new URL(chunk.web.uri).hostname.replace(/^www\./, '');
                    if (!uniqueHostnames.has(hostname)) {
                        sources.push({ uri: chunk.web.uri, title: chunk.web.title || hostname });
                        uniqueHostnames.add(hostname);
                    }
                } catch (e) {
                    console.warn(`Could not parse URL for source: ${chunk.web.uri}`, e);
                }
            }
        }
    }

    return { analysis, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from the AI model.");
  }
};

export const fetchTeamStats = async (teamName: string): Promise<TeamStatsData | null> => {
    const cacheKey = `stats_${teamName.toLowerCase().replace(/\s+/g, '_')}`;
    const cachedStats = cacheService.get<TeamStatsData>(cacheKey);
    if (cachedStats) {
        return cachedStats;
    }

    const prompt = `
        You are an expert sports data analyst. Your task is to provide a detailed statistical report for a specific team.
        Team: "${teamName}"
        
        IMPORTANT: The team must be from one of the following major US leagues: NBA, WNBA, NCAA Basketball, NFL, NCAA Football, MLB, or NHL. If the team is not from one of these leagues, do not provide data.

        Search the web for real, verifiable data from major sports statistics websites (e.g., ESPN, Fox Sports, CBS Sports, etc.).

        Compile a report with the following information:
        1.  **Team Name:** The official name of the team.
        2.  **Current Season & Last Season Stats:** Provide the win-loss record and at least 3-4 key team statistics (e.g., Points Per Game, Yards Per Game, ERA, etc., as relevant to the sport) for both the current season and the most recently completed previous season.
        3.  **Player Information:**
            -   **A-Team Lineup:** The typical starting lineup or "A-Team" for the team.
            -   **Full Roster:** A list of the current active players.
            -   **Injury Report:** Any players currently on the injury list, their status, and details. If none, provide an empty list.
        4.  **Recent Games:** A list of the team's last 5-7 games, including the opponent, the final score, and the result (W or L).

        Structure your entire response as a single, valid JSON object. Do not include any markdown formatting or other text.
        The object must exactly match this structure:
        {
          "teamName": "Boston Celtics",
          "currentSeason": {
            "season": "2023-2024",
            "wins": 64,
            "losses": 18,
            "keyStats": {
              "Points Per Game": "120.6",
              "Rebounds Per Game": "46.3",
              "Assists Per Game": "26.9"
            }
          },
          "lastSeason": {
            "season": "2022-2023",
            "wins": 57,
            "losses": 25,
            "keyStats": {
              "Points Per Game": "117.9",
              "Rebounds Per Game": "45.3",
              "Assists Per Game": "26.7"
            }
          },
          "aTeamLineup": [
            { "name": "Jrue Holiday", "position": "PG" },
            { "name": "Derrick White", "position": "SG" },
            { "name": "Jaylen Brown", "position": "SF" },
            { "name": "Jayson Tatum", "position": "PF" },
            { "name": "Kristaps Porziņģis", "position": "C" }
          ],
          "fullRoster": [
            { "name": "Jrue Holiday", "position": "PG" },
            { "name": "Derrick White", "position": "SG" }
          ],
          "injuryReport": [
            { "playerName": "Kristaps Porziņģis", "status": "Out", "details": "Right soleus strain" }
          ],
          "recentGames": [
            { "opponent": "Dallas Mavericks", "score": "106-88", "result": "W" },
            { "opponent": "Dallas Mavericks", "score": "105-98", "result": "W" }
          ]
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const cleanedText = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const stats = JSON.parse(cleanedText) as TeamStatsData;
        cacheService.set(cacheKey, stats, TWELVE_HOURS);
        return stats;
    } catch (error) {
        console.error("Error fetching team stats from Gemini API:", error);
        throw new Error("Failed to get team stats from the AI model.");
    }
};