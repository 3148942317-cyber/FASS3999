import { randomUUID } from "node:crypto";

const COMMENTS_KEY = process.env.COMMENTS_KEY || "fass3999:question-box:comments";
const MAX_COMMENTS = 200;

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value, limit) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return { url: url.replace(/\/$/, ""), token };
}

async function redis(commands) {
  const config = getRedisConfig();
  if (!config) {
    throw new Error("Missing Upstash Redis environment variables.");
  }

  const response = await fetch(`${config.url}/multi-exec`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data && data.error ? data.error : "Redis request failed.");
  }

  return data;
}

async function listComments() {
  const data = await redis([["LRANGE", COMMENTS_KEY, "0", String(MAX_COMMENTS - 1)]]);
  const values = Array.isArray(data) && data[0] ? data[0].result : [];
  return values
    .map((value) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function saveComment(comment) {
  await redis([
    ["LPUSH", COMMENTS_KEY, JSON.stringify(comment)],
    ["LTRIM", COMMENTS_KEY, "0", String(MAX_COMMENTS - 1)]
  ]);
}

export async function GET() {
  try {
    const comments = await listComments();
    return json({ comments });
  } catch {
    return json(
      {
        error: "Comments are not available yet. Configure Upstash Redis environment variables in Vercel."
      },
      500
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json().catch(() => ({}));
    const message = clean(data.message, 1200);
    const name = clean(data.name || "Anonymous", 80) || "Anonymous";
    const role = clean(data.role || "Community member", 60) || "Community member";
    const topic = clean(data.topic || "General question", 80) || "General question";

    if (message.length < 3) {
      return json({ error: "Please write a longer comment or question." }, 400);
    }

    const comment = {
      id: randomUUID(),
      name,
      role,
      topic,
      message,
      createdAt: new Date().toISOString()
    };

    await saveComment(comment);
    return json({ comment }, 201);
  } catch {
    return json(
      {
        error: "The comment could not be saved. Check the database environment variables in Vercel."
      },
      500
    );
  }
}
