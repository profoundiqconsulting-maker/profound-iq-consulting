import { trpc } from "@/lib/trpc";

export function useUnreadCount(refreshIntervalMs = 30000, enabled = true) {
  const { data: unreadCount = 0, refetch } = trpc.communication.notifications.unreadCount.useQuery(undefined, {
    enabled,
    refetchOnWindowFocus: enabled,
    refetchInterval: enabled ? refreshIntervalMs : undefined,
    retry: false,
  });

  return { unreadCount, loading: false, refetch };
}
