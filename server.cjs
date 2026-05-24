const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const root = __dirname;
const publicFiles = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/program.html", "program.html"],
  ["/resources.html", "resources.html"],
  ["/question-box.html", "question-box.html"],
  ["/styles.css", "styles.css"],
  ["/site.js", "site.js"],
  ["/assets/connection-lines.svg", "assets/connection-lines.svg"],
  ["/assets/home-connection.png", "assets/home-connection.png"]
]);

const commentsPath = path.join(root, "data", "comments.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8"
};

async function readComments() {
  try {
    const raw = await fs.readFile(commentsPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeComments(comments) {
  await fs.mkdir(path.dirname(commentsPath), { recursive: true });
  await fs.writeFile(commentsPath, `${JSON.stringify(comments, null, 2)}\n`, "utf8");
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function clean(value, limit) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

async function handleApi(req, res) {
  if (req.method === "GET" && req.url === "/api/comments") {
    const comments = await readComments();
    send(res, 200, JSON.stringify({ comments }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/comments") {
    try {
      const body = await collectBody(req);
      const data = JSON.parse(body || "{}");
      const message = clean(data.message, 1200);
      const name = clean(data.name || "Anonymous", 80) || "Anonymous";
      const role = clean(data.role || "Community member", 60) || "Community member";
      const topic = clean(data.topic || "General question", 80) || "General question";

      if (message.length < 3) {
        send(res, 400, JSON.stringify({ error: "Please write a longer comment or question." }));
        return;
      }

      const comment = {
        id: randomUUID(),
        name,
        role,
        topic,
        message,
        createdAt: new Date().toISOString()
      };

      const comments = await readComments();
      comments.unshift(comment);
      await writeComments(comments.slice(0, 200));
      send(res, 201, JSON.stringify({ comment }));
    } catch (error) {
      send(res, 400, JSON.stringify({ error: "The comment could not be saved." }));
    }
    return;
  }

  send(res, 404, JSON.stringify({ error: "Not found" }));
}

async function handleStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  const relative = publicFiles.get(url.pathname);

  if (!relative) {
    send(res, 404, "Page not found", "text/plain; charset=utf-8");
    return;
  }

  const filePath = path.join(root, relative);
  const ext = path.extname(filePath);

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=300"
    });
    res.end(data);
  } catch {
    send(res, 404, "Page not found", "text/plain; charset=utf-8");
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
  } else {
    handleStatic(req, res);
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Website running at http://localhost:${port}`);
});
