// Importa as dependências necessárias do React
import { useState, useCallback } from 'react'

// Define a interface Toast, que representa a estrutura de uma notificação
interface Toast {
  id: number              // Identificador único da notificação
  title: string           // Título da notificação
  description: string     // Descrição ou mensagem da notificação
  variant?: 'default' | 'destructive' // Tipo da notificação, podendo ser padrão ou destrutivo
}

// Hook personalizado useToast
// Função: Gerenciar o estado de notificações (toasts) e permitir a exibição e remoção de mensagens
export function useToast() {
  // Declaração do estado que armazena uma lista de notificações ativas
  const [toasts, setToasts] = useState<Toast[]>([])

  // Função toast
  // Descrição: Adiciona uma nova notificação à lista de toasts, com um título, descrição e, opcionalmente, um tipo.
  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    setToasts((prevToasts) => [
      ...prevToasts,
      { id: Date.now(), title, description, variant }, // Gera um ID único usando Date.now()
    ])
  }, [])

  // Função dismissToast
  // Descrição: Remove uma notificação da lista de toasts com base no ID fornecido.
  const dismissToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  // Retorna as funções e o estado de toasts
  // - toast: Adiciona uma nova notificação
  // - toasts: Lista de notificações ativas
  // - dismissToast: Remove uma notificação com base no ID
  return { toast, toasts, dismissToast }
}
