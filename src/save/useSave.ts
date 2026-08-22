import { useCallback, useEffect, useState } from 'react'
import { parseSave } from '../game/engine'
import type { SaveData } from '../game/engine'

export const SAVE_KEY = 'pennyhunt-save'

function read(): SaveData {
  try {
    return parseSave(localStorage.getItem(SAVE_KEY))
  } catch {
    return parseSave(null)
  }
}

/** Persistent progress + settings, mirrored to localStorage on every change. */
export function useSave() {
  const [save, setSaveState] = useState<SaveData>(read)

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    } catch {
      /* private mode / quota — progress just won't persist */
    }
  }, [save])

  const setSave = useCallback((fn: (s: SaveData) => SaveData) => setSaveState(fn), [])

  return { save, setSave }
}
