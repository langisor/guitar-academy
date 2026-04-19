"use client";

import { hookstate, useHookstate } from "@hookstate/core";

// Create global hookstate store
const leftHandedState = hookstate(false);

export function useLeftHanded() {
  const state = useHookstate(leftHandedState);

  return {
    isLeftHanded: state.value,
    setLeftHanded: (value: boolean) => state.set(value),
    toggleLeftHanded: () => state.set((prev) => !prev),
  };
}
