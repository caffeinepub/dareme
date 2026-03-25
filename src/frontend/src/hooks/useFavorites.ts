import { useCallback, useEffect, useState } from "react";
import type { Dare } from "../backend";

const STORAGE_KEY = "dareme-favorites";

function loadFavorites(): Dare[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Restore BigInt ids
    return parsed.map((d: Dare & { id: string | bigint }) => ({
      ...d,
      id: BigInt(d.id),
    }));
  } catch {
    return [];
  }
}

function saveFavorites(favorites: Dare[]): void {
  try {
    // Serialize BigInt as string
    const serialized = JSON.stringify(
      favorites.map((d) => ({ ...d, id: d.id.toString() })),
    );
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Dare[]>(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (dare: Dare) => favorites.some((f) => f.id === dare.id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (dare: Dare) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === dare.id);
        if (exists) return prev.filter((f) => f.id !== dare.id);
        return [dare, ...prev];
      });
      return !favorites.some((f) => f.id === dare.id);
    },
    [favorites],
  );

  const removeFavorite = useCallback((dare: Dare) => {
    setFavorites((prev) => prev.filter((f) => f.id !== dare.id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
