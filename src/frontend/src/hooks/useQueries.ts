import { useQuery } from "@tanstack/react-query";
import type { Dare } from "../backend";
import { useActor } from "./useActor";

export function useAllDares() {
  const { actor, isFetching } = useActor();
  return useQuery<Dare[]>({
    queryKey: ["dares"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDares();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDaresByCategory(category: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Dare[]>({
    queryKey: ["dares", category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category) return actor.getAllDares();
      return actor.getDaresByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}
