import { stringFromCharCode, stringFromEntityMap } from "./helpers.ts"

const ACCOUNT_ID = "109261778853799326"
const API_URL = "https://mas.to/api/v1"
const API_ACCOUNT = `${API_URL}/accounts/${ACCOUNT_ID}`
const API_POSTS = `${API_ACCOUNT}/statuses`
const POSTS_URL = new URL(API_POSTS)

async function fetchRawPosts(maxId?: string): Promise<MastodonPostRaw[]> {
  try {
    POSTS_URL.searchParams.set("limit", "10")
    POSTS_URL.searchParams.set("exclude_reblogs", "true")
    POSTS_URL.searchParams.set("exclude_replies", "true")
    POSTS_URL.searchParams.delete("max_id")
    if (maxId) {
      POSTS_URL.searchParams.set("max_id", maxId)
    }
    const req = await fetch(POSTS_URL, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    return await req.json()
  } catch (error) {
    console.error(error)
    return []
  }
}

function toMastodonMedia(
  media: MastodonMediaAttachmentRaw,
): MastodonMediaAttachment {
  return {
    type: media.type,
    url: media.url,
    previewUrl: media.preview_url,
    meta: media.meta.original,
  }
}

function toTextContent(data: string): string {
  return data
    .replace(/<p>([^<]*)<\/p>/gm, "$1\n")
    .replace(/<br\s*?\/>/gm, "\n")
    .replace(/<[^>]*>/gm, "")
    .replace(/&(\w+);/g, stringFromEntityMap)
    .replace(/&#(\d+);/g, stringFromCharCode)
}

function toMastodonPost(post: MastodonPostRaw): MastodonPost {
  return {
    id: post.id,
    createdAt: post.created_at,
    editedAt: post.edited_at,
    reblogsCount: post.reblogs_count,
    repliesCount: post.replies_count,
    textContent: toTextContent(post.content),
    mediaContent: post.media_attachments.map(toMastodonMedia),
  }
}

export async function fetchAccount(): Promise<MastodonAccount> {
  const req = await fetch(API_ACCOUNT, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  const raw: MastodonAccountRaw = await req.json()
  return {
    displayName: raw.display_name,
    avatar: raw.avatar,
    header: raw.header,
    textContent: toTextContent(raw.note),
    followersCount: raw.followers_count,
    followingCount: raw.following_count,
    statusesCount: raw.statuses_count,
    url: raw.url,
    fields: raw.fields,
  }
}

export async function fetchPosts(maxId?: string) {
  if (maxId === undefined || maxId === null) {
    maxId = ""
  }
  return (await fetchRawPosts(maxId))
    .filter((post) => post.in_reply_to_id === null)
    .map(toMastodonPost)
}
