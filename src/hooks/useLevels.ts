import { useState, useEffect } from 'react';
import { levelService } from '@/services/LevelService';
import { Level } from '@/repositories';

export function useLevels(worldId?: number) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLevels() {
      setLoading(true);
      const data = worldId 
        ? await levelService.getLevelsForWorld(worldId)
        : await levelService.getAllLevels();
      setLevels(data);
      setLoading(false);
    }
    loadLevels();
  }, [worldId]);

  return { levels, loading };
}

export function useLevel(levelId: number) {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLevel() {
      if (!levelId) return;
      setLoading(true);
      const data = await levelService.getLevelById(levelId);
      setLevel(data);
      setLoading(false);
    }
    loadLevel();
  }, [levelId]);

  return { level, loading };
}
