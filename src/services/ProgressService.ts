import { 
  progressRepository, 
  dailyGoalRepository, 
  practiceSessionRepository,
  UserProgress,
  DailyGoal,
  PracticeSession
} from "@/repositories";

export class ProgressService {
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await progressRepository.getUserProgress(userId);
  }

  async getLevelProgress(userId: number, levelId: number): Promise<UserProgress | null> {
    const progress = await progressRepository.getLevelProgress(userId, levelId);
    return progress || null;
  }

  async completeLevel(userId: number, levelId: number, stars: number = 3, xpEarned: number = 50): Promise<void> {
    const existing = await this.getLevelProgress(userId, levelId);
    
    const progress: Omit<UserProgress, "id"> = {
      user_id: userId,
      level_id: levelId,
      completed: 1,
      stars: stars,
      xp_earned: (existing?.xp_earned || 0) + xpEarned,
      attempts: (existing?.attempts || 0) + 1,
      completed_at: new Date().toISOString()
    };

    await progressRepository.upsertProgress(progress);
  }

  async getTotalXP(userId: number): Promise<number> {
    return await progressRepository.getTotalXP(userId);
  }

  async getCompletedLevelsCount(userId: number): Promise<number> {
    return await progressRepository.getCompletedLevelsCount(userId);
  }

  async getDailyGoal(userId: number, date: string): Promise<DailyGoal | null> {
    const goal = await dailyGoalRepository.getDailyGoal(userId, date);
    return goal || null;
  }

  async updateDailyGoal(userId: number, minutes: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.getDailyGoal(userId, today);
    
    await dailyGoalRepository.upsertDailyGoal(userId, {
      date: today,
      minutes_practiced: (existing?.minutes_practiced || 0) + minutes,
      goal_minutes: existing?.goal_minutes || 15
    });
  }

  async getPracticeStats(userId: number, days: number = 7): Promise<PracticeSession[]> {
    return await practiceSessionRepository.getSessions(userId, days);
  }
  
  async addPracticeSession(userId: number, duration: number, exercises: number, xp: number): Promise<void> {
    await practiceSessionRepository.createSession({
      user_id: userId,
      duration_minutes: duration,
      exercises_completed: exercises,
      xp_earned: xp,
      date: new Date().toISOString().split('T')[0]
    });
  }
}

export const progressService = new ProgressService();
