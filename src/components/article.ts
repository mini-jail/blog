import { template } from "jail/dom"
import { formatTime } from "../helpers.ts"
import { activeMedia } from "../media.ts"

export function Article(post: MastodonPost) {
  const showMedia = () => {
    for (const media of post.mediaContent) {
      activeMedia().add(media)
    }
    activeMedia(activeMedia())
  }
  const media = post.mediaContent.map((media) => {
    return template`
      <img 
        src=${media.previewUrl}
        d-on:click=${showMedia}
      />
    `
  })
  return template`
    <article data-post-id=${post.id}>
      <header>
        <time>${formatTime(post.createdAt)}</time>
      </header>
      <div class="content">
        <pre>${post.textContent}</pre>
        <div class="media" data-size=${post.mediaContent.length}>
          ${media}
        </div>
      </div>
      <footer>
        <div>replies: ${post.repliesCount}</div>
        <div>reblogs: ${post.reblogsCount}</div>
      </footer>
    </article>
  `
}
