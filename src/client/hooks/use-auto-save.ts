"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  /** Callback to execute the save */
  onSave: (value: string) => Promise<void>;
  /** Debounce delay in ms (default: 1000) */
  debounceMs?: number;
  /** Duration to show "Saved" status before returning to idle (default: 2000) */
  savedDisplayMs?: number;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Call this when content changes (will debounce) */
  handleChange: (newValue: string) => void;
  /** Call this on blur (will save immediately if pending) */
  handleBlur: () => void;
  /** Force a save immediately */
  saveNow: () => void;
}

export function useAutoSave({
  onSave,
  debounceMs = 1000,
  savedDisplayMs = 2000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");

  const pendingValueRef = useRef<string | null>(null);
  const lastSavedValueRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);
  const isSavingRef = useRef(false);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref current to avoid stale closures
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const doSave = useCallback(async () => {
    const valueToSave = pendingValueRef.current;
    if (valueToSave === null || valueToSave === lastSavedValueRef.current) {
      return;
    }
    if (isSavingRef.current) {
      return;
    }

    const generation = ++generationRef.current;
    isSavingRef.current = true;
    setStatus("saving");

    try {
      await onSaveRef.current(valueToSave);

      // Only update if this is still the latest save
      if (generation === generationRef.current) {
        lastSavedValueRef.current = valueToSave;
        setStatus("saved");

        // Clear any existing saved timer
        if (savedTimerRef.current) {
          clearTimeout(savedTimerRef.current);
        }
        savedTimerRef.current = setTimeout(() => {
          setStatus("idle");
        }, savedDisplayMs);
      }
    } catch {
      if (generation === generationRef.current) {
        setStatus("error");
      }
    } finally {
      isSavingRef.current = false;

      // If a newer value was queued while saving, save it now
      if (
        pendingValueRef.current !== null &&
        pendingValueRef.current !== lastSavedValueRef.current
      ) {
        doSave();
      }
    }
  }, [savedDisplayMs]);

  const handleChange = useCallback(
    (newValue: string) => {
      pendingValueRef.current = newValue;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        doSave();
      }, debounceMs);
    },
    [debounceMs, doSave]
  );

  const handleBlur = useCallback(() => {
    // Clear debounce timer and save immediately
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    doSave();
  }, [doSave]);

  const saveNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    doSave();
  }, [doSave]);

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
      // Synchronously attempt to save if there's pending data
      if (
        pendingValueRef.current !== null &&
        pendingValueRef.current !== lastSavedValueRef.current
      ) {
        onSaveRef.current(pendingValueRef.current).catch(() => {});
      }
    };
  }, []);

  return { status, handleChange, handleBlur, saveNow };
}
