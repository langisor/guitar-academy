import { useState, useEffect } from 'react';
import { progressService } from '@/services/ProgressService';
import { UserProgress, DailyGoal, PracticeSession } from '@/repositories';

export function useProgress(userId: number = 1) { // Default user id for now
  const [xp, setXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [userXP, userProgress, todayGoal] = await Promise.all([
        progressService.getTotalXP(userId),
        progressService.getUserProgress(userId),
        progressService.getDailyGoal(userId, new Date().toISOString().split('T')[0])
      ]);
      
      setXP(userXP);
      setProgress(userProgress);
      setDailyGoal(todayGoal);
      setLoading(false);
    }
    loadData();
  }, [userId]);

  const completeLevel = async (levelId: number, stars: number = 3, xpEarned: number = 50) => {
    await progressService.completeLevel(userId, levelId, stars, xpEarned);
    // Refresh data
    const newXP = await progressService.getTotalXP(userId);
    const newProgress = await progressService.getUserProgress(userId);
    setXP(newXP);
    setProgress(newProgress);
  };

  const updatePracticeMinutes = async (minutes: number) => {
    await progressService.updateDailyGoal(userId, minutes);
    const todayGoal = await progressService.getDailyGoal(userId, new Date().toISOString().split('T')[0]);
    setDailyGoal(todayGoal);
  };

  return {
    xp,
    loading,
    progress,
    dailyGoal,
    completeLevel,
    updatePracticeMinutes
  };
}
