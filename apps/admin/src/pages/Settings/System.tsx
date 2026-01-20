import { useState, useEffect } from 'react'
import { Timer, Upload, Key, Code2, Database } from 'lucide-react'
import {
  useSystemSettings,
  useUpdateSystemSettings,
  useStorageInfo,
} from '@/hooks/queries/useSettings'
import type { SystemSettings as SystemSettingsType } from '@/services/api/settings'
import { formatBytes } from '@/utils/formatters'

export default function System() {
  const { data: settings, isLoading: settingsLoading } = useSystemSettings()
  const { data: storage, isLoading: storageLoading } = useStorageInfo()
  const updateSettings = useUpdateSystemSettings()

  // Code Execution
  const [timeout, setTimeout] = useState(7)
  const [maxOutput, setMaxOutput] = useState(10000)

  // File Upload
  const [maxFileSize, setMaxFileSize] = useState(50)
  const [maxVideoDuration, setMaxVideoDuration] = useState(30)

  // Session
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [refreshTokenDays, setRefreshTokenDays] = useState(7)

  // Editor
  const [defaultMode, setDefaultMode] = useState<'text' | 'visual' | 'mixed'>('text')
  const [defaultComplexity, setDefaultComplexity] = useState<'simplified' | 'standard' | 'advanced'>(
    'standard'
  )
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    if (settings) {
      setTimeout(settings.codeExecution.timeoutSeconds)
      setMaxOutput(settings.codeExecution.maxOutputLength)
      setMaxFileSize(settings.fileUpload.maxFileSizeMb)
      setMaxVideoDuration(settings.fileUpload.maxVideoDurationMinutes)
      setSessionTimeout(settings.session.timeoutMinutes)
      setRefreshTokenDays(settings.session.refreshTokenDays)
      setDefaultMode(settings.editor.defaultMode)
      setDefaultComplexity(settings.editor.defaultComplexity)
      setFontSize(settings.editor.fontSize)
    }
  }, [settings])

  const handleSave = async () => {
    const updates: Partial<SystemSettingsType> = {
      codeExecution: {
        timeoutSeconds: timeout,
        maxOutputLength: maxOutput,
      },
      fileUpload: {
        maxFileSizeMb: maxFileSize,
        maxVideoDurationMinutes: maxVideoDuration,
        allowedTypes: settings?.fileUpload.allowedTypes || [],
      },
      session: {
        timeoutMinutes: sessionTimeout,
        refreshTokenDays: refreshTokenDays,
      },
      editor: {
        defaultMode,
        defaultComplexity,
        fontSize,
      },
    }
    await updateSettings.mutateAsync(updates)
  }

  const isLoading = settingsLoading || storageLoading

  if (isLoading) {
    return <SystemSkeleton />
  }

  const storagePercentage = storage ? Math.round((storage.used / storage.total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Code Execution Limits */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Code Execution Limits</h3>
              <p className="text-sm text-slate-500">Resource limits for student code execution</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Execution Timeout
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">seconds</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Maximum time before code is terminated
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Max Output Length
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={maxOutput}
                  onChange={(e) => setMaxOutput(Number(e.target.value))}
                  className="w-28 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">characters</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Console output will be truncated</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Limits */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">File Upload Limits</h3>
              <p className="text-sm text-slate-500">Limits for media uploads in lessons</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Max File Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">MB</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Max Video Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={maxVideoDuration}
                  onChange={(e) => setMaxVideoDuration(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">minutes</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Allowed Types
              </label>
              <p className="text-sm text-slate-600 py-2">
                {settings?.fileUpload.allowedTypes.join(', ') || 'jpg, png, gif, mp4, webm, mp3, pdf'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Session Settings</h3>
              <p className="text-sm text-slate-500">Authentication and session configuration</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Session Timeout
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">minutes of inactivity</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Refresh Token Lifetime
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={refreshTokenDays}
                  onChange={(e) => setRefreshTokenDays(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Default Editor Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Default Editor Settings</h3>
              <p className="text-sm text-slate-500">
                Default code editor configuration for new lessons
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Default Mode
              </label>
              <select
                value={defaultMode}
                onChange={(e) => setDefaultMode(e.target.value as 'text' | 'visual' | 'mixed')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
              >
                <option value="text">Text (Standard)</option>
                <option value="visual">Visual (Blockly)</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Default Complexity
              </label>
              <select
                value={defaultComplexity}
                onChange={(e) =>
                  setDefaultComplexity(e.target.value as 'simplified' | 'standard' | 'advanced')
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
              >
                <option value="simplified">Simplified</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Font Size</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-500">px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Storage Usage</h3>
              <p className="text-sm text-slate-500">Current storage consumption</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                {storage ? `${formatBytes(storage.used)} used of ${formatBytes(storage.total)}` : 'Loading...'}
              </span>
              <span className="text-sm font-medium text-slate-800">{storagePercentage}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-lg font-bold text-slate-800">
                {storage ? formatBytes(storage.breakdown.lessonMedia) : '0 Bytes'}
              </p>
              <p className="text-xs text-slate-500">Lesson Media</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-lg font-bold text-slate-800">
                {storage ? formatBytes(storage.breakdown.sandbox) : '0 Bytes'}
              </p>
              <p className="text-xs text-slate-500">Sandbox</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-lg font-bold text-slate-800">
                {storage ? formatBytes(storage.breakdown.database) : '0 Bytes'}
              </p>
              <p className="text-xs text-slate-500">Database</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium disabled:opacity-50"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

function SystemSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
