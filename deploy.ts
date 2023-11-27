import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts"

const app = new Application()
const router = new Router()

app.use(router.allowedMethods())
app.use(router.routes())

await app.listen({ port: 8000 })

/* import { app, PORT, router } from "jail/deploy"
import { fetchAccount, fetchPosts } from "./mastodon_client.ts"

router.get("/api/account", async (ctx) => {
  ctx.response.type = "json"
  ctx.response.body = await fetchAccount()
})

router.get("/api/post/:maxId", async (ctx) => {
  ctx.response.type = "json"
  ctx.response.body = await fetchPosts(ctx.params.maxId)
})

router.get("/api/post", async (ctx) => {
  ctx.response.type = "json"
  ctx.response.body = await fetchPosts("")
})

await app.listen({ port: PORT })
 */
