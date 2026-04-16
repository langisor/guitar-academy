import { useState, useEffect } from 'react';
import { songService } from '@/services/SongService';
import { Song } from '@/repositories';

export function useSongs(difficulty?: string) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSongs() {
      setLoading(true);
      const data = difficulty 
        ? await songService.getSongsByDifficulty(difficulty)
        : await songService.getAllSongs();
      setSongs(data);
      setLoading(false);
    }
    loadSongs();
  }, [difficulty]);

  return { songs, loading };
}
