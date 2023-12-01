import { template } from "jail/dom"
import { language, languages } from "../i18n.ts"

export function LanguageButtons() {
  return languages.map((lang) => {
    return template`
      <button 
        class="lang" 
        data-selected=${() => language() === lang} 
        d-on:click.delegate=${() => language(lang)}
      >
        ${lang}
      </button>
    `
  })
}
