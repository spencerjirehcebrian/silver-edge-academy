import { Types } from 'mongoose'
import { ShopItem } from '../modules/shop/shop.model'
import { logger } from '../utils/logger'

export async function seedShop(adminId: Types.ObjectId): Promise<void> {
  logger.info('Seeding shop items...')

  const shopItems = [
    // Avatar Packs
    {
      name: 'Ninja Pack',
      description: 'Become a coding ninja with stealthy avatar options',
      category: 'avatar_pack' as const,
      price: 500,
      previewData: {
        icons: ['ninja', 'shuriken', 'katana'],
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Robot Pack',
      description: 'Transform into a futuristic coding robot',
      category: 'avatar_pack' as const,
      price: 750,
      previewData: {
        icons: ['robot', 'gear', 'circuit'],
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Astronaut Pack',
      description: 'Explore the code universe as an astronaut',
      category: 'avatar_pack' as const,
      price: 1000,
      previewData: {
        icons: ['rocket', 'planet', 'star'],
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Wizard Pack',
      description: 'Cast coding spells with magical wizard avatars',
      category: 'avatar_pack' as const,
      price: 1500,
      previewData: {
        icons: ['wand', 'hat', 'crystal'],
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },

    // UI Themes
    {
      name: 'Ocean Theme',
      description: 'Calm blue waves for a relaxing coding experience',
      category: 'ui_theme' as const,
      price: 300,
      previewData: {
        gradientFrom: '#3b82f6',
        gradientTo: '#06b6d4',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Forest Theme',
      description: 'Fresh green tones inspired by nature',
      category: 'ui_theme' as const,
      price: 400,
      previewData: {
        gradientFrom: '#22c55e',
        gradientTo: '#10b981',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Sunset Theme',
      description: 'Warm orange and pink hues like a beautiful sunset',
      category: 'ui_theme' as const,
      price: 500,
      previewData: {
        gradientFrom: '#f97316',
        gradientTo: '#ec4899',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Galaxy Theme',
      description: 'Deep space purple for cosmic coders',
      category: 'ui_theme' as const,
      price: 800,
      previewData: {
        gradientFrom: '#a855f7',
        gradientTo: '#6366f1',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },

    // Editor Themes
    {
      name: 'Dark Pro',
      description: 'Professional dark theme for focused coding',
      category: 'editor_theme' as const,
      price: 200,
      previewData: {
        gradientFrom: '#1e293b',
        gradientTo: '#0f172a',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Light Mode',
      description: 'Clean bright theme for daytime coding',
      category: 'editor_theme' as const,
      price: 200,
      previewData: {
        gradientFrom: '#f8fafc',
        gradientTo: '#e2e8f0',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Dracula',
      description: 'Classic dark theme with vibrant colors',
      category: 'editor_theme' as const,
      price: 600,
      previewData: {
        gradientFrom: '#282a36',
        gradientTo: '#44475a',
      },
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },

    // Teacher Rewards
    {
      name: 'Starbucks Gift Card ($25)',
      description: 'Treat yourself to premium coffee and snacks',
      category: 'teacher_reward' as const,
      price: 2500,
      isActive: true,
      isPermanent: false,
      createdBy: adminId,
    },
    {
      name: 'Amazon Gift Card ($50)',
      description: 'Get whatever you need from the world\'s largest store',
      category: 'teacher_reward' as const,
      price: 5000,
      isActive: true,
      isPermanent: false,
      createdBy: adminId,
    },
    {
      name: 'Professional Development Course',
      description: 'Access to premium online teaching courses',
      category: 'teacher_reward' as const,
      price: 8000,
      isActive: true,
      isPermanent: true,
      createdBy: adminId,
    },
    {
      name: 'Classroom Supplies Voucher',
      description: 'Stock up on essential classroom materials',
      category: 'teacher_reward' as const,
      price: 3000,
      isActive: true,
      isPermanent: false,
      createdBy: adminId,
    },
    {
      name: 'Tech Gadget Voucher',
      description: 'Upgrade your teaching tech setup',
      category: 'teacher_reward' as const,
      price: 10000,
      isActive: true,
      isPermanent: false,
      createdBy: adminId,
    },
    {
      name: 'Spa & Wellness Package',
      description: 'Relax and recharge with a wellness day',
      category: 'teacher_reward' as const,
      price: 6000,
      isActive: true,
      isPermanent: false,
      createdBy: adminId,
    },
  ]

  await ShopItem.insertMany(shopItems)
  logger.info(`Created ${shopItems.length} shop items`)
}
