import { api } from './client'
import { STUDENT_ENDPOINTS } from './endpoints'
import type { StudentShopItem, PurchaseResult } from '@/types/student'

/**
 * Get shop items with ownership status
 */
export async function getShopItems(): Promise<StudentShopItem[]> {
  const { items } = await api.get<{ items: StudentShopItem[] }>(
    STUDENT_ENDPOINTS.shop.items
  )
  return items
}

/**
 * Get owned items (inventory)
 */
export async function getInventory(): Promise<StudentShopItem[]> {
  const { items } = await api.get<{ items: StudentShopItem[] }>(
    STUDENT_ENDPOINTS.shop.inventory
  )
  return items
}

/**
 * Purchase a shop item
 */
export async function purchaseItem(itemId: string): Promise<PurchaseResult> {
  return api.post<PurchaseResult>(STUDENT_ENDPOINTS.shop.purchase, { itemId })
}

/**
 * Equip an owned item
 */
export async function equipItem(
  itemId: string,
  slot: 'avatar' | 'uiTheme' | 'editorTheme'
): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(STUDENT_ENDPOINTS.shop.equip, { itemId, slot })
}
