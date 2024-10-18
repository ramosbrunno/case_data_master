import { useState, useCallback } from 'react'

interface Toast {
  id: number
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), title, description, variant },
    ])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return { toast, toasts, dismissToast }
}