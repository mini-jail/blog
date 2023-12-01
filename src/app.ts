import { createEffect, createSignal, onMount, onUnmount } from "jail/signal"
import { mount, type RenderResult, template } from "jail/dom"
import { fromAsync, recordFrom } from "./helpers.ts"
import { fetchAccount, fetchPosts } from "./mastodon_client.ts"
import {
  ActiveMedia,
  closeMedia,
  hasMedia,
  mediaSize,
} from "./components/media.ts"
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
  const html = createSignal(document.documentElement)
  const account = recordFrom(fromAsync(fetchAccount), {
    displayName: "...",
    textContent: "...",
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
    fields: [],
  })
  const posts = fromAsync(fetchPosts, [])
  const accountFields = () =>
    account
      .fields()
      .map((field) => `${field.name}: ${field.value}\n`)
  function* PostElements(): Iterable<RenderResult> {
    for (const post of posts()) {
      yield Article(post)
    }
  }
  const onScroll = async (): Promise<void> => {
    if (onScroll.loading) {
      return
    }
    const { scrollHeight, scrollTop } = html(),
      scrolled = scrollTop / scrollHeight,
      lastPostId = posts().at(-1)?.id || onScroll.lastId
    if (scrolled <= 0.75) {
      return
    }
    onScroll.loading = true
    if (onScroll.lastId === lastPostId) {
      return removeEventListener("scroll", onScroll)
    }
    posts(posts().concat(await fetchPosts(lastPostId)))
    onScroll.lastId = lastPostId
    onScroll.loading = false
  }
  onScroll.lastId = ""
  onScroll.loading = false

  createEffect(() => {
    html().dataset.scrollable = String(!hasMedia())
  })
  onMount(() => addEventListener("scroll", onScroll))
  onUnmount(() => removeEventListener("scroll", onScroll))

  return template`
    <header class="flex row align-center justify-end gap-4 pad-3">
      <a href=${account.url} target="_blank" title=${t("visit me on mastodon")}>
        <div class="avatar" style="background-image: url(${account.avatar})"></div>
      </a>
      <div class="flex column auto justify-center gap-1">
        <h4>${account.displayName}</h4>
      </div>
      <div class="languages flex gap-2 row">
        ${LanguageButtons}
      </div>
    </header>
    <main class="flex column gap-2">
      <article class="flex column gap-2 pad-2 bio">
        <header style="background-image: url(${account.header})">
          <div class="avatar" style="background-image: url(${account.avatar})"></div>
        </header>
        <div class="flex gap-2 row">
          <label>
            <span>${T.name}</span>
            <pre title=${account.displayName}>
              ${account.displayName}
            </pre>
          </label>
          <label>
            <span>${T.posts}</span>
            <pre>${account.statusesCount}</pre>
          </label>
        </div>
        <div class="flex gap-2 row">
          <label>
            <span>${T.followers}</span>
            <pre>${account.followersCount}</pre>
          </label>
          <label>
            <span>${T.follows}</span>
            <pre>${account.followingCount}</pre>
          </label>
        </div>
        <label>
          <pre>
            ${account.textContent}
            ${accountFields}
          </pre>
        </label>
      </article>
      ${PostElements}
    </main>
    <div class="active-media" data-size="0" data-size=${mediaSize}>
      <header class="flex">
        <button class="close" d-on:click=${closeMedia}>
          ${T.close}
        </button>
      </header>
      <div class="container flex">
        ${ActiveMedia}
      </div>
    </div>
  `
}

mount(document.body, () => {
  installI18N()
  return Application()
})
