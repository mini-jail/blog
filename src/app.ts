import { createEffect, createSignal, onMount, onUnmount } from "jail/signal"
import { mount, type RenderResult, template } from "jail/dom"
import { fromAsync } from "./helpers.ts"
import { fetchAccount, fetchPosts } from "./mastodon_client.ts"
import { ActiveMedia, closeMedia, hasMedia, mediaSize } from "./media.ts"
import { Article } from "./components/article.ts"
import { installI18N, language, languages, T, t } from "./i18n.ts"

function LanguageButtons() {
  return languages.map((lang) => {
    return template`
      <button class="lang" d-on:click.delegate=${() => language(lang)}>
        ${lang}
      </button>
    `
  })
}

function Application() {
  const filter = createSignal("")
  const html = createSignal(document.documentElement)
  const account = fromAsync(fetchAccount)
  const posts = fromAsync(fetchPosts, [])
  const displayName = () => account()?.displayName ?? "..."
  const description = () => account()?.textContent ?? "..."
  const avatarImage = () => account()?.avatar ?? "unset"
  const url = () => account()?.url
  function* PostElements(): Iterable<RenderResult> {
    const currentFilter = filter()
    for (const post of posts()) {
      if (post.textContent.includes(currentFilter)) {
        yield Article(post)
      }
    }
  }
  let lastId = "", loading = false
  const onScroll = async () => {
    if (loading) {
      return
    }
    const { scrollHeight, scrollTop } = html(),
      scrolled = scrollTop / scrollHeight,
      lastPostId = posts().at(-1)?.id || lastId
    if (scrolled <= 0.75) {
      return
    }
    loading = true
    if (lastId === lastPostId) {
      return removeEventListener("scroll", onScroll)
    }
    posts(posts().concat(await fetchPosts(lastPostId)))
    lastId = lastPostId
    loading = false
  }

  createEffect(() => {
    filter()
    onScroll()
  })

  createEffect(() => {
    html().dataset.scrollable = String(!hasMedia())
  })

  onMount(() => {
    addEventListener("scroll", onScroll)
  })

  onUnmount(() => {
    removeEventListener("scroll", onScroll)
  })

  return template`
    <header class="flex row align-center justify-end gap-4 pad-2">
      <a href=${url} target="_blank" title=${t("visit me on mastodon")}>
        <img class="avatar" src=${avatarImage} />
      </a>
      <div class="flex column auto justify-center gap-1">
        <h4>${displayName}</h4>
        <p>${description}</p>
      </div>
      <div class="flex row gap-2">
        ${LanguageButtons}
      </div>
    </header>
    <main class="flex column gap-2 pad-2">
      ${PostElements}
    </main>
    <div class="active-media" data-size="0" data-size=${mediaSize}>
      <header class="flex">
        <button class="close" d-on:click=${closeMedia}>
          ${T.close}
        </button>
      </header>
      <div class="container flex pad-2">
        ${ActiveMedia}
      </div>
    </div>
  `
}

mount(document.body, () => {
  installI18N()
  return Application()
})
