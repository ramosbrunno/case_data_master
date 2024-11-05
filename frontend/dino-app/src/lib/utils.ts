import { type ClassValue, clsx } from "clsx"; // Importa o tipo ClassValue e a função clsx
import { twMerge } from "tailwind-merge";     // Importa a função twMerge

// Função utilitária para combinar classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
