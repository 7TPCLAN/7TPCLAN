/* =========================
   7TPclan PUBLIC TRYOUTS
========================= */

async function loadPublicServers() {
  const grid = document.getElementById("vipServerGrid");

  if (!grid || !window.supabaseClient) return;

  const { data, error } = await window.supabaseClient
    .from("tryout_servers")
    .select("id,name,link,available,active,hosted_by,updated_at")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    grid.innerHTML = `
      <article class="vip-server-card">
        <div class="vip-server-status ended">⚠️ UNABLE TO LOAD SERVERS</div>
        <h3>Tryout servers are temporarily unavailable.</h3>
        <p>Please refresh the page later.</p>
      </article>
    `;
    return;
  }

  grid.innerHTML = "";

  if (!data || data.length === 0) {
    grid.innerHTML = `
      <article class="vip-server-card">
        <div class="vip-server-status ended">🔴 NO ACTIVE SERVERS</div>
        <h3>No tryout servers available</h3>
        <p>Check back when a Tryout Staff member adds one.</p>
      </article>
    `;
    return;
  }

  data.forEach(server => {
    const card = document.createElement("article");
    card.className = "vip-server-card";

    if (server.available && server.active && server.link) {
      card.innerHTML = `
        <div class="vip-server-status">🟢 TRYOUT ACTIVE</div>
        <h3>${escapeHTML(server.name)}</h3>
        <p>Hosted by: ${escapeHTML(server.hosted_by || "Tryout Staff")}</p>
        <a
          class="btn"
          href="${safeURL(server.link)}"
          target="_blank"
          rel="noopener noreferrer">
          🎯 Join Server
        </a>
      `;
    } else if (server.available && server.link) {
      card.innerHTML = `
        <div class="vip-server-status">🟢 SERVER AVAILABLE</div>
        <h3>${escapeHTML(server.name)}</h3>
        <p>Waiting for a tryout to start.</p>
      `;
    } else {
      card.innerHTML = `
        <div class="vip-server-status ended">🔴 UNAVAILABLE</div>
        <h3>${escapeHTML(server.name)}</h3>
        <p>This server is currently unavailable.</p>
        <span class="server-disabled">Server Unavailable</span>
      `;
    }

    grid.appendChild(card);
  });
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

function safeURL(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "#";
    }

    return url.href;
  } catch {
    return "#";
  }
}

document.addEventListener("DOMContentLoaded", loadPublicServers);

setInterval(loadPublicServers, 15000);
