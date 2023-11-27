import { RenderResult, template } from "jail/dom"
import { createSignal } from "jail/signal"

export const activeMedia = createSignal<Set<MastodonMediaAttachment>>(new Set())
export const mediaSize = () => activeMedia().size
export const hasMedia = () => mediaSize() > 0
export const closeMedia = () => {
  activeMedia().clear()
  activeMedia(activeMedia())
}
export function* getActiveMedia(): Iterable<RenderResult> {
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
