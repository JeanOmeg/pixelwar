import { en, type Strings } from './en'
import { ptBR } from './pt-br'

/**
 * Game texts in English (default) and Brazilian Portuguese.
 *
 * `t()` returns the dictionary of the current language: `t().menu.play`.
 * Texts with numbers or names are functions: `t().army.emptySlots(n)`.
 * `en.ts` is the source of the keys; `pt-br.ts` is typed `Strings`, so a
 * missing or extra key fails the typecheck.
 *
 * The choice is saved in localStorage and only changes from the title screen
 * (the flags), so a match never switches language halfway. Components that
 * stay mounted across that change listen with `onLanguageChange`.
 */

export type Language = 'en' | 'pt-BR'
export type { Strings }

export const LANGUAGES: Language[] = ['en', 'pt-BR']

const DICTIONARIES: Record<Language, Strings> = { en, 'pt-BR': ptBR }
const PREF_LANGUAGE = 'pixelfantasywar.language'
const LANGUAGE_EVENT = 'pixelfantasywar-language'

function savedLanguage(): Language {
  try {
    const saved = localStorage.getItem(PREF_LANGUAGE)
    return LANGUAGES.includes(saved as Language) ? saved as Language : 'en'
  } catch {
    return 'en'
  }
}

let current: Language = savedLanguage()
setDocumentLanguage()

function setDocumentLanguage() {
  if (typeof document !== 'undefined') document.documentElement.lang = current
}

/** Texts of the current language */
export function t(): Strings {
  return DICTIONARIES[current]
}

export function language(): Language {
  return current
}

export function setLanguage(next: Language) {
  if (next === current || !LANGUAGES.includes(next)) return
  current = next
  try { localStorage.setItem(PREF_LANGUAGE, next) } catch { /* storage unavailable */ }
  setDocumentLanguage()
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LANGUAGE_EVENT))
}

/** Calls `listener` after every language change; returns the unsubscribe */
export function onLanguageChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(LANGUAGE_EVENT, listener)
  return () => window.removeEventListener(LANGUAGE_EVENT, listener)
}

/** "1 unit" / "2 units": picks the form for `count` */
export function plural(count: number, one: string, other: string): string {
  return count === 1 ? one : other
}
