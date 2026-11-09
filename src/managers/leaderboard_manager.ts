export interface LeaderboardEntry {
    name: string;
    score: number;
}

export class LeaderboardManager {
    private static STORAGE_KEY = "os_defender_leaderboard";
    private static MAX_ENTRIES = 5;

    public static getScores(): LeaderboardEntry[] {
        const data = localStorage.getItem(LeaderboardManager.STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    public static saveScore(name: string, score: number): void {
        const scores = LeaderboardManager.getScores();
        scores.push({ name: name.toLocaleUpperCase(), score });

        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, LeaderboardManager.MAX_ENTRIES);

        localStorage.setItem(LeaderboardManager.STORAGE_KEY, JSON.stringify(topScores));
    }
}