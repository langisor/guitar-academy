"use server";

import { ChordsService } from "../services/chords.service";
import { Chord, ChordKey, ChordSuffix, GuitarData } from "../types/chords.types";

const service = ChordsService.getInstance();

export async function getAvailableKeys(): Promise<ChordKey[]> {
  return service.getAvailableKeys();
}

export async function getAvailableSuffixes(): Promise<ChordSuffix[]> {
  return service.getAvailableSuffixes();
}

export async function getChordDetail(
  key: ChordKey,
  suffix: ChordSuffix
): Promise<Chord | null> {
  return service.getChordDetail(key, suffix);
}

export async function getChordsForKey(key: ChordKey): Promise<Chord[]> {
  return service.getChordsForKey(key);
}

export async function getMetadata(): Promise<GuitarData> {
  return service.getMetadata();
}

export async function searchChords(
  query: string
): Promise<Array<{ key: ChordKey; suffix: ChordSuffix }>> {
  return service.searchChords(query);
}
