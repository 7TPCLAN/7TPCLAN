import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !["owner", "developer"].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Owner/developer access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const path = String(body.path || "").trim();
    const content = String(body.content ?? "");
    const message = String(body.message || "").trim();
    const sha = String(body.sha || "").trim();

    if (!path || !message || !sha) {
      return new Response(
        JSON.stringify({ error: "path, content, message, and sha are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.startsWith(".github/") || path.includes("..")) {
      return new Response(
        JSON.stringify({ error: "That path cannot be edited from Owner Panel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "GitHub integration is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const githubResponse = await fetch(
      `https://api.github.com/repos/7TPCLAN/7TPCLAN/contents/${encodedPath}`,
      {
        method: "PUT",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Owner Panel: ${message}`,
          content: btoa(unescape(encodeURIComponent(content))),
          sha,
          branch: "main",
        }),
      }
    );

    const githubData = await githubResponse.json();

    if (!githubResponse.ok) {
      return new Response(
        JSON.stringify({
          error: githubData.message || "GitHub update failed",
        }),
        { status: githubResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        commit: githubData.commit?.sha || null,
        path,
        message,
        updatedBy: profile.username,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
