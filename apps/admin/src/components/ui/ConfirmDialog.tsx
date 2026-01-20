import { AlertTriangle, Trash2, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-accent-500" />,
  }

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'primary' as const,
  }

  const iconBackgrounds = {
    danger: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-accent-50',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBackgrounds[variant]}`}
        >
          {icons[variant]}
        </div>
        <div className="flex-1">
          <p className="text-slate-600">{message}</p>
        </div>
      </div>
    </Modal>
  )
}

// Hook for managing confirm dialog state
import { useState, useCallback, useRef } from 'react'

interface UseConfirmDialogOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<UseConfirmDialogOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(false)
    resolveRef.current = null
  }, [])

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(true)
    resolveRef.current = null
  }, [])

  const dialogProps: ConfirmDialogProps | null = options
    ? {
        isOpen,
        onClose: handleClose,
        onConfirm: handleConfirm,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        variant: options.variant,
      }
    : null

  return {
    confirm,
    dialogProps,
  }
}
