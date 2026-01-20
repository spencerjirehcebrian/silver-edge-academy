import { useSearchParams, useNavigate } from 'react-router-dom'
import { TrendingUp, Trophy, ShoppingBag, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/queries/useProfile'
import { useBadges } from '@/hooks/queries/useGamification'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressTab } from './tabs/ProgressTab'
import { BadgesTab } from './tabs/BadgesTab'
import { ShopTab } from './tabs/ShopTab'
import { SettingsTab } from './tabs/SettingsTab'

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data: profileData, isLoading: profileLoading } = useProfile()
  const { data: badgesData, isLoading: badgesLoading } = useBadges()

  const defaultTab = searchParams.get('tab') || 'progress'

  const handleLogout = async () => {
    await logout()
    navigate('/app/login')
  }

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" className="h-56 rounded-2xl" />
        <Skeleton variant="rectangular" className="h-12 rounded-xl" />
        <Skeleton variant="rectangular" className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!profileData || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load profile</p>
      </div>
    )
  }

  const { profile, stats } = profileData

  // Calculate XP progress percentage
  const xpProgress = ((profile.totalXp % 100) / 100) * 100 || 75 // Default to 75% if at level boundary
  const xpNeeded = 100 // XP needed for next level (simplified)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          {/* Large Avatar */}
          <Avatar
            avatarId={profile.avatarId}
            displayName={profile.displayName}
            size="xl"
            className="w-24 h-24 mb-4"
          />

          {/* Name & Username */}
          <h1 className="font-display text-2xl font-bold text-slate-800">
            {profile.displayName}
          </h1>
          <p className="text-slate-500 mb-4">@{profile.username}</p>

          {/* Level & XP Progress (Only place XP bar appears) */}
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-semibold text-violet-600">
                Level {profile.currentLevel}
              </span>
              <span className="text-sm text-slate-500">
                {profile.totalXp % 100} / {xpNeeded} XP
              </span>
            </div>
            <ProgressBar
              value={xpProgress}
              max={100}
              size="lg"
              color="violet"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="progress">
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Trophy className="w-4 h-4 mr-1.5" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="shop">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <ProgressTab
            stats={{
              lessonsCompleted: stats.lessonsCompleted,
              exercisesPassed: stats.exercisesPassed,
              quizzesPassed: stats.quizzesPassed,
              badgesEarned: stats.badgesEarned,
            }}
            streakDays={profile.currentStreakDays}
          />
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <BadgesTab
            earned={badgesData?.filter(b => b.isEarned) || []}
            locked={badgesData?.filter(b => !b.isEarned) || []}
            isLoading={badgesLoading}
            totalEarned={badgesData?.filter(b => b.isEarned).length || 0}
            totalAvailable={badgesData?.length || 0}
          />
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="shop">
          <ShopTab balance={profile.currencyBalance} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab onLogout={handleLogout} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
