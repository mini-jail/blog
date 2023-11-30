import { template } from "jail/dom"
import { formatTime } from "../helpers.ts"
import { activeMedia } from "../media.ts"

export function Article(post: MastodonPost) {
  const showMedia = () => activeMedia(post.mediaContent)
  const media = post.mediaContent.length && post.mediaContent.map((media) => {
    return template`
      <img 
        src=${media.previewUrl}
        d-on:click=${showMedia}
      />
    `
  })
  return template`
    <article data-post-id=${post.id} class="flex column gap-2 pad-2">
      <header class="flex justify-right">
        <time>${formatTime(post.createdAt)}</time>
      </header>
      <div class="content">
        <pre>${post.textContent}</pre>
        <div class="media" data-size=${post.mediaContent.length}>
          ${media}
        </div>
      </div>
      <footer class="flex row gap-2">
        <div>replies: ${post.repliesCount}</div>
        <div>reblogs: ${post.reblogsCount}</div>
      </footer>
    </article>
  `
}
