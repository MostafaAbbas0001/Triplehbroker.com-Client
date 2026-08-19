import { QueryClient } from "@tanstack/react-query";

export const CONTENT_STALE_TIME = 30 * 60 * 1000;
export const CONTENT_GC_TIME = 24 * 60 * 60 * 1000;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CONTENT_STALE_TIME,
        gcTime: CONTENT_GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  });
}
