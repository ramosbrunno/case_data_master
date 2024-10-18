import { useState, useCallback } from 'react'

interface ToastProps {
  title: string
  description: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, { title, description, variant }])
  }, [])

  const dismissToast = useCallback((index: number) => {
    setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index))
  }, [])

  return { toast, toasts, dismissToast }
}