export interface RoutineHistoryEntry {
  routineSlug: string;
  date: string;
  durationMinutes: number;
  rounds: number;
}

export interface BreathingStats {
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  lastCompletedDate: string;
  completedDates: string[];
  routineHistory: RoutineHistoryEntry[];
}

const STORAGE_KEY = "divine_breathing_stats";

const getTodayString = () => new Date().toISOString().split("T")[0];

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

export function getBreathingStats(): BreathingStats {
  if (typeof window === "undefined") {
    return {
      currentStreak: 0, longestStreak: 0, totalSessions: 0,
      totalMinutes: 0, lastCompletedDate: "", completedDates: [], routineHistory: []
    };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse breathing stats", e);
    }
  }

  return {
    currentStreak: 0, longestStreak: 0, totalSessions: 0,
    totalMinutes: 0, lastCompletedDate: "", completedDates: [], routineHistory: []
  };
}

export function recordSessionComplete(routineSlug: string, durationMinutes: number, rounds: number): BreathingStats {
  const stats = getBreathingStats();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (stats.lastCompletedDate === today) {
    // Already practiced today, just increment sessions/minutes
    stats.totalSessions += 1;
    stats.totalMinutes += durationMinutes;
  } else if (stats.lastCompletedDate === yesterday) {
    // Practiced yesterday, increment streak
    stats.currentStreak += 1;
    stats.totalSessions += 1;
    stats.totalMinutes += durationMinutes;
    stats.lastCompletedDate = today;
    stats.completedDates.push(today);
  } else {
    // Missed a day or first time
    stats.currentStreak = 1;
    stats.totalSessions += 1;
    stats.totalMinutes += durationMinutes;
    stats.lastCompletedDate = today;
    stats.completedDates.push(today);
  }

  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }

  stats.routineHistory.unshift({
    routineSlug,
    date: today,
    durationMinutes,
    rounds
  });

  // Keep history manageable
  if (stats.routineHistory.length > 50) {
    stats.routineHistory = stats.routineHistory.slice(0, 50);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  return stats;
}

export function getAchievements(stats: BreathingStats): string[] {
  const achievements = [];
  if (stats.totalSessions >= 1) achievements.push("First Breath");
  if (stats.currentStreak >= 3) achievements.push("3-Day Flow");
  if (stats.currentStreak >= 7) achievements.push("7-Day Sadhana");
  return achievements;
}
