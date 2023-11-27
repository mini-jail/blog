import { createEffect, createSignal, onMount, Signal } from "jail/signal"
import { mount, type RenderResult, template } from "jail/dom"
import {
  type MastodonAccount,
  type MastodonMediaAttachment,
  MastodonPost,
} from "../types.d.ts"

const activeMedia = createSignal<Set<MastodonMediaAttachment>>(new Set())
const mediaSize = () => activeMedia().size
const hasMedia = () => mediaSize() > 0
const closeMedia = () => {
  activeMedia().clear()
  activeMedia(activeMedia())
}
function* getActiveMedia() {
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

function fromAsync<T>(
  promiseGetter: () => Promise<T>,
): Signal<T | undefined>
function fromAsync<T>(
  promiseGetter: () => Promise<T>,
  initialValue: T,
): Signal<T>
function fromAsync<T>(promiseGetter: () => Promise<T>, initialValue?: T) {
  const signal = createSignal(initialValue)
  createEffect(() => promiseGetter().then(signal))
  return signal
}

async function fetchJSON<T>(url: string): Promise<T> {
  return await fetch(url).then((res) => res.json())
}

function formatTime(data: string) {
  return data.replace(
    /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(.*)/,
    "$4:$5 $3.$2.$1",
  )
}

function debounced<Callback extends (this: any, ...args: any[]) => any>(
  callback: Callback,
  timeout: number,
): Callback {
  let timeHandle: number
  return (function (...args) {
    clearTimeout(timeHandle)
    timeHandle = setTimeout(() => {
      callback.call(this, ...args)
    }, timeout)
  }) as Callback
}

function Article(post: MastodonPost) {
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

function Application() {
  const html = createSignal(document.documentElement)
  const account = fromAsync(() => fetchJSON<MastodonAccount>("/api/account"))
  const posts = fromAsync(() => fetchJSON<MastodonPost[]>("/api/post"), [])
  const displayName = () => account()?.displayName ?? "..."
  const description = () => account()?.textContent ?? "..."
  const avatarImage = () => account()?.avatar ?? "unset"
  function* postElements(): Iterable<RenderResult> {
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
        const morePosts = await fetchJSON<MastodonPost[]>(
          "/api/post/" + lastPostId,
        )
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
      ${postElements}
    </main>
    <div d-if=${hasMedia} class="active-media" data-size=${mediaSize}>
      <header>
        <div class="close" d-on:click=${closeMedia}>close</div>
      </header>
      <div class="container">${getActiveMedia}</div>
    </div>
  `
}

mount(document.body, Application)
