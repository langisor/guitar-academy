"use client"

import { useGuitarSettings } from '@/store/guitarSettings'

export function useLeftHandMode() {
  const leftHandMode = useGuitarSettings((state) => state.leftHandMode)
  const toggleLeftHandMode = useGuitarSettings((state) => state.toggleLeftHandMode)
  const setLeftHandMode = useGuitarSettings((state) => state.setLeftHandMode)

  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e']
  const leftHandStringNames = ['e', 'B', 'G', 'D', 'A', 'E']

  const getStringNames = (isLeftHand: boolean = leftHandMode) => {
    return isLeftHand ? leftHandStringNames : stringNames
  }

  const mirrorStringIndex = (index: number) => {
    return leftHandMode ? 5 - index : index
  }

  return {
    leftHandMode,
    toggleLeftHandMode,
    setLeftHandMode,
    getStringNames,
    mirrorStringIndex,
  }
}
