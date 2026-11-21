// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { en } from '../src/i18n/en'
import { ptBR } from '../src/i18n/pt-br'
import { MAPS } from '../src/maps'
import { EMOTES } from '../src/online/protocol'
import { TUTORIAL_STEPS } from '../src/tutorial/script'
import { UNIT_CLASSES } from '../src/unit-types'
import { SKILLS } from '../src/skills'
import { language, setLanguage, t } from '../src/i18n'

/** Every leaf path of a dictionary, with its kind (string, function or array length) */
function shape(value: unknown, path = ''): string[] {
  if (typeof value === 'function') return [`${path}:fn${value.length}`]
  if (Array.isArray(value)) return [`${path}:[${value.length}]`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))]
  if (value && typeof value === 'object') return Object.keys(value).sort().flatMap(key => shape((value as Record<string, unknown>)[key], `${path}.${key}`))
  return [`${path}:${typeof value}`]
}

/** Every string a dictionary can show (functions called with sample arguments) */
function texts(value: unknown): string[] {
  if (typeof value === 'function') return [String(value(...Array.from({ length: value.length }, () => 2)))]
  if (Array.isArray(value)) return value.flatMap(texts)
  if (value && typeof value === 'object') return Object.values(value).flatMap(texts)
  return typeof value === 'string' ? [value] : []
}

describe('i18n', () => {
  test('pt-BR has exactly the keys, lists and functions of English', () => {
    expect(shape(ptBR)).toEqual(shape(en))
  })

  test('no empty text', () => {
    for (const dictionary of [en, ptBR]) expect(texts(dictionary).filter(text => text.trim() === '')).toEqual([])
  })

  test('every map, class, skill, emote and tutorial step has its texts', () => {
    for (const dictionary of [en, ptBR]) {
      for (const map of MAPS) expect(dictionary.maps[map.id]?.name, map.id).toBeTruthy()
      for (const unitClass of UNIT_CLASSES) expect(dictionary.classes[unitClass]?.name, unitClass).toBeTruthy()
      for (const id of Object.keys(SKILLS) as (keyof typeof SKILLS)[]) expect(dictionary.skills[id]?.name, id).toBeTruthy()
      for (const emote of EMOTES) expect(dictionary.emotes[emote], emote).toBeTruthy()
      for (const step of TUTORIAL_STEPS) if (step.text) expect(dictionary.tutorial[step.text], step.text).toBeTruthy()
    }
  })

  test('data objects follow the current language', () => {
    const before = language()
    try {
      setLanguage('pt-BR')
      expect(t()).toBe(ptBR)
      expect(SKILLS['skill-run'].name).toBe('Correr')
      expect(MAPS[0].name).toBe(ptBR.maps[MAPS[0].id].name)
      setLanguage('en')
      expect(SKILLS['skill-run'].name).toBe('Run')
    } finally {
      setLanguage(before)
    }
  })
})
