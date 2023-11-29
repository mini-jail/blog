import { createEffect, createSignal, onMount } from "jail/signal"
import { mount, type RenderResult, template } from "jail/dom"
import { debounced, fromAsync } from "./helpers.ts"
import { fetchAccount, fetchPosts } from "./mastodon_client.ts"
import { ActiveMedia, closeMedia, hasMedia, mediaSize } from "./media.ts"
import { Article } from "./components/article.ts"

function Application() {
  const html = createSignal(document.documentElement)
  const account = fromAsync(fetchAccount)
  const posts = fromAsync(fetchPosts, [])
  const displayName = () => account()?.displayName ?? "..."
  const description = () => account()?.textContent ?? "..."
  const avatarImage = () => account()?.avatar ?? "unset"
  function* PostElements(): Iterable<RenderResult> {
    for (const post of posts()) {
      yield Article(post)
    }
  }

  createEffect(() => {
    html().dataset.scrollable = String(!hasMedia())
  })

  onMount(() => {
    let lastId = "", loading = false
    addEventListener(
      "scroll",
      debounced(async () => {
        if (loading) {
          return
        }
        const { scrollHeight, scrollTop } = html()
        if ((scrollTop / scrollHeight) <= 0.75) {
          return
        }
        loading = true
        const lastPostId = posts().at(-1)?.id || lastId
        if (lastId === lastPostId) {
          return
        }
        const morePosts = await fetchPosts(lastPostId)
        posts(posts().concat(morePosts))
        lastId = lastPostId
        loading = false
      }, 500),
    )
  })

  return template`
    <header class="flex row align-center justify-end gap-4 pad-2">
      <img class="avatar" src=${avatarImage} />
      <div class="flex column auto justify-center gap-1">
        <h4>${displayName}</h4>
        <p>${description}</p>
      </div>
    </header>
    <main class="flex column gap-2 pad-2">
      ${PostElements}
    </main>
    <div class="active-media" data-size=${mediaSize}>
      <header>
        <div class="close" d-on:click=${closeMedia}>close</div>
      </header>
      <div class="container">${ActiveMedia}</div>
    </div>
  `
}

mount(document.body, Application)
