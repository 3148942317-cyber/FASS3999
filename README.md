# Cultural Connection Program Website

This is a simple four-page website for the FASS3999 case study project.

Pages:

- Home
- Background
- Program
- Question Box

The Question Box uses:

- `api/comments.js` on Vercel, backed by Upstash Redis.
- `server.cjs` locally, backed by `data/comments.json`.

## Run locally

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Note: static hosting such as GitHub Pages can show the pages, but it cannot run the comment-saving server. Use `npm start` for the working Question Box.

## Deploy on Vercel with saved comments

1. Import this GitHub repository into Vercel.
2. In the Vercel project, add an Upstash Redis database from Storage or Marketplace.
3. Make sure these environment variables are available in the Vercel project:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Optional:

```text
COMMENTS_KEY=fass3999:question-box:comments
```

4. Redeploy the project.

The site calls `/api/comments`, so Vercel will use `api/comments.js` to load and save Question Box submissions.
