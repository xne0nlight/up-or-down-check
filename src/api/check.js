export default {
  async fetch(request) {
    const urlParam = new URL(request.url).searchParams.get("url");
    if (!urlParam) {
      return new Response(
        JSON.stringify({ error: "Missing ?url parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let target;
    try {
      target = new URL(urlParam);
      if (!["http:", "https:"].includes(target.protocol)) throw "";
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(target.toString(), {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      return new Response(
        JSON.stringify({
          status: resp.status >= 200 && resp.status < 400 ? "up" : "down",
          code: resp.status,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ status: "down", error: err.name }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  },
};