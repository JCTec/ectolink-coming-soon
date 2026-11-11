// =============================================================================
// Static file server for Heroku
// =============================================================================
//
// The site is plain static files, exactly as GitHub Pages serves them. Heroku
// needs a running process, so this tiny server stands in for GitHub Pages. It
// uses only Node's built-in modules: there is nothing to install.
//
// Behaviour, matching GitHub Pages:
//   /            -> index.html
//   /some/dir/   -> some/dir/index.html
//   /tree/x      -> tree/x.html  (extensionless URLs also work)
//   missing      -> 404.html with a 404 status
//
// Never served: dotfiles (.git, .slugignore, ...), the server's own files, and
// anything outside this folder. Docs (*.md) are also removed from the Heroku
// build by .slugignore.
// =============================================================================

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// Repo files that exist only to run this server.
const BLOCKED = new Set(["server.js", "package.json", "package-lock.json", "Procfile", "CNAME"]);

// HTML and data change on every refresh, so revalidate them; everything else
// (icons, images) can be cached for a day. The data file and stylesheet are
// already cache-busted with ?date= query strings.
function cacheControl(ext) {
  return ext === ".html" || ext === ".json" || ext === ".xml"
    ? "public, max-age=300, must-revalidate"
    : "public, max-age=86400";
}

function isServable(rel) {
  if (rel.split("/").some((part) => part.startsWith("."))) return false;
  if (BLOCKED.has(rel)) return false;
  if (rel.endsWith(".md")) return false;
  return true;
}

// Returns an absolute file path for the request, or null.
function resolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;

  const abs = path.resolve(ROOT, "." + path.posix.normalize("/" + decoded));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;

  const candidates = decoded.endsWith("/")
    ? [path.join(abs, "index.html")]
    : [abs, abs + ".html", path.join(abs, "index.html")];

  for (const file of candidates) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    if (!isServable(rel)) continue;
    try {
      if (fs.statSync(file).isFile()) return file;
    } catch {
      // not there, try the next candidate
    }
  }
  return null;
}

function send(req, res, status, file) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Cache-Control": status === 200 ? cacheControl(ext) : "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }

  // www.ectolink.org -> ectolink.org, as GitHub Pages did, so only one
  // address is ever indexed.
  const host = (req.headers.host || "").toLowerCase();
  if (host.startsWith("www.")) {
    res.writeHead(301, { Location: "https://" + host.slice(4) + req.url });
    return res.end();
  }

  const urlPath = new URL(req.url, "http://localhost").pathname;

  // A directory requested without its trailing slash: redirect, so relative
  // links inside the page resolve against the right folder.
  const file = resolve(urlPath);
  if (file && !urlPath.endsWith("/") && file === resolve(urlPath + "/")) {
    res.writeHead(301, { Location: urlPath + "/" });
    return res.end();
  }

  if (file) return send(req, res, 200, file);
  send(req, res, 404, path.join(ROOT, "404.html"));
});

server.listen(PORT, () => {
  console.log(`ectolink serving ${ROOT} on port ${PORT}`);
});
