import { useQuery } from '@tanstack/react-query'
import * as gamificationApi from '@/services/api/gamification'

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: gamificationApi.getBadges,
  })
}

export function useXpHistory() {
  return useQuery({
    queryKey: ['xp-history'],
    queryFn: () => gamificationApi.getXpHistory().then((res) => res.data),
  })
}
