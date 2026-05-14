import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getCustomArtUrl(langCode: string) {
  const baseUrl = "https://btttr.cc/poster-a/imdb/poster-default/{imdb_id}.jpg";
  const langMap: Record<string, string> = {
    'es-ES': 'es',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'it-IT': 'it',
    'pt-BR': 'pt-PT',
    'zh-CN': 'zh',
    'ar-SA': 'ar',
    'hi-IN': 'hi'
  };
  
  const lang = langMap[langCode];
  return lang ? `${baseUrl}?lang=${lang}` : baseUrl;
}
