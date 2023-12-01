import { template } from "jail/dom"
import { formatTime } from "../helpers.ts"
import { activeMedia } from "./media.ts"
import { t } from "../i18n.ts"

function MediaPreviews(post: MastodonPost) {
  if (post.mediaContent.length === 0) {
    return null
  }
  return function* () {
    for (const media of post.mediaContent) {
      yield template`<img src=${media.previewUrl} />`
    }
  }
}

export function Article(post: MastodonPost) {
  const showMedia = () => activeMedia(post.mediaContent)

  return template`
    <article data-post-id=${post.id} class="flex column gap-2 pad-2">
      <header class="flex justify-right">
        <time>${t`posted on ${formatTime(post.createdAt)}`}</time>
      </header>
      <div class="content">
        <pre>${post.textContent}</pre>
        <div 
          class="media"
          data-size=${post.mediaContent.length}
          d-on:click.delegate=${showMedia}
        >
          ${MediaPreviews(post)}
        </div>
      </div>
    </article>
  `
}
