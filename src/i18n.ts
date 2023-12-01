import { createDirective } from "jail/dom"
import { createEffect, createRoot, createSignal } from "jail/signal"
import translations from "../public/i18n.json" assert { type: "json" }

type Language = keyof typeof translations
type Keys = (typeof translations)[Language]
type Key = keyof Keys
type Translation = () => string
type TranslationMap = Record<Key, Translation>
type TranslationArg =
  | string
  | number
  | { toString(): string }
  | (() => TranslationArg)

export const languages = Object.keys(translations) as Language[]

export const language = createRoot(() => {
  const stored = localStorage.getItem("i18n") as Language | null
  const language = createSignal<Language>(
    stored && languages.includes(stored)
      ? stored
      : languages.includes(navigator.language as Language)
      ? navigator.language as Language
      : languages[0],
  )
  createEffect(() => localStorage.setItem("i18n", language()))
  return language
})!

function translate(lang: Language, key: Key, args?: TranslationArg[]) {
  const translation: string = translations[lang]?.[key] ?? key
  if (!args?.length) {
    return translation
  }
  let i = -1
  return translation.replace(/{}/gm, () => {
    const arg = args[++i]
    return String(typeof arg === "function" ? arg() : arg)
  })
}

export function t(key: Key, ...args: TranslationArg[]): Translation
export function t(
  template: TemplateStringsArray,
  ...args: TranslationArg[]
): Translation
export function t(
  template: TemplateStringsArray | Key,
  ...args: TranslationArg[]
): Translation {
  const key = typeof template === "string"
    ? template
    : template.join("{}") as Key
  return () => translate(language(), key, args)
}

export const T = new Proxy<TranslationMap>(Object.create(null), {
  get(_target, key: Key) {
    return () => translate(language(), key)
  },
})

/**
 * <div d-t:textContent="hello lol"></div>
 * <div d-t="hello lol"></div>
 */
export function installI18N() {
  createDirective<Key>("t", (elt, binding) => {
    const prop = binding.arg ?? "textContent"
    elt[prop] = translate(language(), binding.value)
  })
}
