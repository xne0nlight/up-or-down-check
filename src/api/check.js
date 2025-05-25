// src/api/check.js

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
};

export default {
  async fetch(request) {
    const urlParam = new URL(request.url).searchParams.get("url");
    if (!urlParam) {
      return new Response(
        JSON.stringify({ error: "Missing ?url parameter" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    let target;
    try {
      target = new URL(urlParam);
      if (!["http:", "https:"].includes(target.protocol)) throw "";
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Helper to decide “up” vs “down”
    const isUp = (status) => status < 500;

    // Attempt HEAD first
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      let resp = await fetch(target.toString(), {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // If server error, treat as down
      if (resp.status >= 500) {
        return new Response(
          JSON.stringify({ status: "down", code: resp.status }),
          { headers: jsonHeaders }
        );
      }
      // 2xx or 3xx = up
      if (isUp(resp.status) && resp.status < 400) {
        return new Response(
          JSON.stringify({ status: "up", code: resp.status }),
          {
            headers: {
              ...jsonHeaders,
              "Cache-Control": "public, max-age=60"
            },
            cf: {
              cacheTtl: 60,
              cacheEverything: true
            }
          }
        );
      }
      // Otherwise a 4xx: fall through to GET
    } catch (e) {
      // network error or timeout on HEAD — fall through to GET
    }

    // Fallback: try GET
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      let resp = await fetch(target.toString(), {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (isUp(resp.status)) {
        return new Response(
          JSON.stringify({ status: "up", code: resp.status }),
          {
            headers: {
              ...jsonHeaders,
              "Cache-Control": "public, max-age=60"
            },
            cf: {
              cacheTtl: 60,
              cacheEverything: true
            }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ status: "down", code: resp.status }),
          { headers: jsonHeaders }
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ status: "down", error: err.name }),
        { headers: jsonHeaders }
      );
    }
  },
};
