declare global {
  type MastodonMediaAttachment = {
    type: string
    url: string
    previewUrl: string
    meta: MastodonMediaAttachmentMeta
  }

  type MastodonMediaAttachmentMeta = {
    width: number
    height: number
    size: string
    aspect: number
  }

  type MastodonMediaAttachmentRaw = {
    id: string
    type: string
    url: string
    preview_url: string
    remote_url: string | null
    preview_remote_url: string | null
    text_url: string | null
    meta: {
      original: MastodonMediaAttachmentMeta
      small: MastodonMediaAttachmentMeta
    }
    description: string | null
    blurhash: string
  }

  type MastodonAccount = {
    displayName: string
    textContent: string
    avatar: string
    header: string
    followersCount: number
    followingCount: number
    statusesCount: number
    url: string
    fields: MastodonAccountField[]
  }

  type MastodonAccountField = {
    name: string
    value: string
    verified_at: string | null
  }

  type MastodonAccountRaw = {
    id: string
    username: string
    acct: string
    display_name: string
    locked: boolean
    bot: boolean
    discoverable: boolean
    group: boolean
    created_at: string
    note: string
    url: string
    uri: string
    avatar: string
    avatar_static: string
    header: string
    header_static: string
    followers_count: number
    following_count: number
    statuses_count: number
    last_status_at: string
    noindex: boolean
    emojis: unknown[]
    roles: unknown[]
    fields: MastodonAccountField[]
  }

  type MastodonApplication = {
    name: string
    website: unknown
  }

  type MastodonPostRaw = {
    id: string
    created_at: string
    in_reply_to_id: string | null
    in_reply_to_account_id: string | null
    sensitive: boolean
    spoiler_text: string
    visibility: string
    language: string
    uri: string
    url: string
    replies_count: number
    reblogs_count: number
    edited_at: string | null
    content: string
    reblog: unknown
    application: MastodonApplication
    account: MastodonAccountRaw
    media_attachments: MastodonMediaAttachmentRaw[]
    mentions: unknown[]
    tags: string[]
    emojis: unknown[]
    card: unknown
    poll: unknown
  }

  type MastodonPost = {
    id: string
    createdAt: string
    editedAt: string | null
    repliesCount: number
    reblogsCount: number
    textContent: string
    mediaContent: MastodonMediaAttachment[]
  }
}

export {}
