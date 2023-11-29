import { RenderResult, template } from "jail/dom"
import { createSignal } from "jail/signal"

export const activeMedia = createSignal<MastodonMediaAttachment[]>([])
export const mediaSize = () => activeMedia().length
export const hasMedia = () => mediaSize() > 0
export const closeMedia = () => {
  activeMedia([])
}
export function* ActiveMedia(): Iterable<RenderResult> {
  if (hasMedia() === false) {
    return
  }
  for (const media of activeMedia()) {
    if (media.type === "image") {
      yield template`<img class="content" src=${media.url} />`
    }
    if (media.type === "gifv") {
      yield template`<video class="content" src=${media.url} autoplay loop></video>`
    }
  }
}
