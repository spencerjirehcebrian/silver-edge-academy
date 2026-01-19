import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as shopApi from '@/services/api/shop'

export function useShopItems() {
  return useQuery({
    queryKey: ['shop-items'],
    queryFn: shopApi.getShopItems,
  })
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: shopApi.getInventory,
  })
}

export function usePurchaseItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => shopApi.purchaseItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-items'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useEquipItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, slot }: { itemId: string; slot: 'avatar' | 'uiTheme' | 'editorTheme' }) =>
      shopApi.equipItem(itemId, slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
