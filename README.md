# Cultural Connection Program Website

This is a simple four-page website for the FASS3999 case study project.

Pages:

- Home
- Background
- Program
- Question Box

The Question Box uses the local Node server in `server.js` and saves submitted comments to `data/comments.json`.

## Run locally

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Note: static hosting such as GitHub Pages can show the pages, but it cannot run the comment-saving server. Use `npm start` for the working Question Box.
