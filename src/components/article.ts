import { template } from "jail/dom"
import { formatTime } from "../helpers.ts"
import { activeMedia } from "../media.ts"
import { T, t } from "../i18n.ts"

function MediaPreview(media: MastodonMediaAttachment) {
  return template`<img src=${media.previewUrl} />`
}

export function Article(post: MastodonPost) {
  const showMedia = () => activeMedia(post.mediaContent)
  const media = post.mediaContent.length
    ? post.mediaContent.map(MediaPreview)
    : null
  return template`
    <article data-post-id=${post.id} class="flex column gap-2 pad-2">
      <header class="flex justify-right">
        <time>
          ${t`posted on ${formatTime(post.createdAt)}`}
        </time>
      </header>
      <div class="content">
        <pre>${post.textContent}</pre>
        <div 
          class="media" 
          data-size=${post.mediaContent.length}
          d-on:click=${showMedia}
        >
          ${media}
        </div>
      </div>
      <footer class="flex row gap-2">
        <div>${T.replies}: ${post.repliesCount}</div>
        <div>${T.reblogs}: ${post.reblogsCount}</div>
      </footer>
    </article>
  `
}
