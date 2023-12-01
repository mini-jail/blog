import { template } from "jail/dom"
import { language, languages } from "../i18n.ts"

export function* LanguageButtons() {
  for (const lang of languages) {
    yield template`
      <button 
        class="lang" 
        data-selected=${() => language() === lang} 
        d-on:click.delegate=${() => language(lang)}
      >
        ${lang}
      </button>
    `
  }
}
