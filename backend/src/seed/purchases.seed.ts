import { Purchase, ShopItem } from '../modules/shop/shop.model'
import { StudentProfile } from '../modules/users/studentProfile.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'

export async function seedPurchases(users: SeededUsers): Promise<void> {
  logger.info('Seeding purchases...')

  // Get shop items by name for easy reference
  const ninjaPack = await ShopItem.findOne({ name: 'Ninja Pack' })
  const robotPack = await ShopItem.findOne({ name: 'Robot Pack' })
  const astronautPack = await ShopItem.findOne({ name: 'Astronaut Pack' })
  const wizardPack = await ShopItem.findOne({ name: 'Wizard Pack' })
  const oceanTheme = await ShopItem.findOne({ name: 'Ocean Theme' })
  const forestTheme = await ShopItem.findOne({ name: 'Forest Theme' })
  const galaxyTheme = await ShopItem.findOne({ name: 'Galaxy Theme' })
  const draculaEditor = await ShopItem.findOne({ name: 'Dracula' })
  const lightModeEditor = await ShopItem.findOne({ name: 'Light Mode' })

  const purchases = []

  // Helper function to create timestamps
  const daysAgo = (days: number, hours: number = 0) =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000)

  // ==========================================
  // liam_js (level 7, 680 XP, 6800 currency)
  // Purchases: Ninja Pack (500) + Ocean Theme (300)
  // ==========================================
  const liamId = users.students[2] // liam_js
  const liamProfile = await StudentProfile.findOne({ userId: liamId })

  if (liamProfile && ninjaPack && oceanTheme) {
    // Purchase Ninja Pack
    purchases.push({
      studentId: liamId,
      itemId: ninjaPack._id,
      price: ninjaPack.price,
      purchasedAt: daysAgo(5),
    })

    // Purchase Ocean Theme
    purchases.push({
      studentId: liamId,
      itemId: oceanTheme._id,
      price: oceanTheme.price,
      purchasedAt: daysAgo(4),
    })

    // Update student profile: deduct currency and set theme preference
    await StudentProfile.updateOne(
      { userId: liamId },
      {
        currencyBalance: liamProfile.currencyBalance - 500 - 300, // 6800 - 800 = 6000
        'preferences.theme': 'light', // Using Ocean theme
      }
    )

    // Increment purchase count for items
    await ShopItem.updateOne({ _id: ninjaPack._id }, { $inc: { purchaseCount: 1 } })
    await ShopItem.updateOne({ _id: oceanTheme._id }, { $inc: { purchaseCount: 1 } })
  }

  // ==========================================
  // sophia_js (level 8, 820 XP, 8200 currency)
  // Purchases: Wizard Pack (1500) + Galaxy Theme (800) + Dracula (600)
  // ==========================================
  const sophiaId = users.students[7] // sophia_js
  const sophiaProfile = await StudentProfile.findOne({ userId: sophiaId })

  if (sophiaProfile && wizardPack && galaxyTheme && draculaEditor) {
    // Purchase Wizard Pack
    purchases.push({
      studentId: sophiaId,
      itemId: wizardPack._id,
      price: wizardPack.price,
      purchasedAt: daysAgo(6),
    })

    // Purchase Galaxy Theme
    purchases.push({
      studentId: sophiaId,
      itemId: galaxyTheme._id,
      price: galaxyTheme.price,
      purchasedAt: daysAgo(4),
    })

    // Purchase Dracula Editor
    purchases.push({
      studentId: sophiaId,
      itemId: draculaEditor._id,
      price: draculaEditor.price,
      purchasedAt: daysAgo(2),
    })

    // Update student profile: deduct currency and set preferences
    await StudentProfile.updateOne(
      { userId: sophiaId },
      {
        currencyBalance: sophiaProfile.currencyBalance - 1500 - 800 - 600, // 8200 - 2900 = 5300
        'preferences.theme': 'dark',
        'preferences.editorTheme': 'dracula',
      }
    )

    // Increment purchase count for items
    await ShopItem.updateOne({ _id: wizardPack._id }, { $inc: { purchaseCount: 1 } })
    await ShopItem.updateOne({ _id: galaxyTheme._id }, { $inc: { purchaseCount: 1 } })
    await ShopItem.updateOne({ _id: draculaEditor._id }, { $inc: { purchaseCount: 1 } })
  }

  // ==========================================
  // ava_tech (level 6, 580 XP, 5800 currency)
  // Purchases: Robot Pack (750) + Forest Theme (400)
  // ==========================================
  const avaId = users.students[5] // ava_tech
  const avaProfile = await StudentProfile.findOne({ userId: avaId })

  if (avaProfile && robotPack && forestTheme) {
    // Purchase Robot Pack
    purchases.push({
      studentId: avaId,
      itemId: robotPack._id,
      price: robotPack.price,
      purchasedAt: daysAgo(7),
    })

    // Purchase Forest Theme
    purchases.push({
      studentId: avaId,
      itemId: forestTheme._id,
      price: forestTheme.price,
      purchasedAt: daysAgo(5),
    })

    // Update student profile: deduct currency and set theme preference
    await StudentProfile.updateOne(
      { userId: avaId },
      {
        currencyBalance: avaProfile.currencyBalance - 750 - 400, // 5800 - 1150 = 4650
        'preferences.theme': 'light',
      }
    )

    // Increment purchase count for items
    await ShopItem.updateOne({ _id: robotPack._id }, { $inc: { purchaseCount: 1 } })
    await ShopItem.updateOne({ _id: forestTheme._id }, { $inc: { purchaseCount: 1 } })
  }

  // ==========================================
  // alex_coder (level 5, 450 XP, 4500 currency)
  // Purchases: Astronaut Pack (1000)
  // ==========================================
  const alexId = users.students[0] // alex_coder
  const alexProfile = await StudentProfile.findOne({ userId: alexId })

  if (alexProfile && astronautPack) {
    // Purchase Astronaut Pack
    purchases.push({
      studentId: alexId,
      itemId: astronautPack._id,
      price: astronautPack.price,
      purchasedAt: daysAgo(8),
    })

    // Update student profile: deduct currency
    await StudentProfile.updateOne(
      { userId: alexId },
      {
        currencyBalance: alexProfile.currencyBalance - 1000, // 4500 - 1000 = 3500
      }
    )

    // Increment purchase count for items
    await ShopItem.updateOne({ _id: astronautPack._id }, { $inc: { purchaseCount: 1 } })
  }

  // ==========================================
  // isabella_code (level 5, 490 XP, 4900 currency)
  // Purchases: Light Mode Editor (200)
  // ==========================================
  const isabellaId = users.students[9] // isabella_code
  const isabellaProfile = await StudentProfile.findOne({ userId: isabellaId })

  if (isabellaProfile && lightModeEditor) {
    // Purchase Light Mode Editor
    purchases.push({
      studentId: isabellaId,
      itemId: lightModeEditor._id,
      price: lightModeEditor.price,
      purchasedAt: daysAgo(3),
    })

    // Update student profile: deduct currency and set editor theme
    await StudentProfile.updateOne(
      { userId: isabellaId },
      {
        currencyBalance: isabellaProfile.currencyBalance - 200, // 4900 - 200 = 4700
        'preferences.editorTheme': 'light',
      }
    )

    // Increment purchase count for items
    await ShopItem.updateOne({ _id: lightModeEditor._id }, { $inc: { purchaseCount: 1 } })
  }

  // Create all purchases
  if (purchases.length > 0) {
    await Purchase.insertMany(purchases)
  }

  logger.info(`Created ${purchases.length} purchases and updated student profiles`)
}
