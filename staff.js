/* =========================
   7TPclan STAFF PANEL
========================= */

const loginSection = document.getElementById("loginSection");
const staffDashboard = document.getElementById("staffDashboard");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const loginMessage = document.getElementById("loginMessage");
const serverList = document.getElementById("serverList");

async function initStaffPanel() {
  if (!window.supabaseClient) return;

  const { data: { session } } =
    await window.supabaseClient.auth.getSession();

  if (session) {
    await showDashboard(session.user);
  } else {
    showLogin();
  }
}

async function staffLogin() {
  loginMessage.textContent = "";

  const email =
    document.getElementById("staffEmail").value.trim();

  const password =
    document.getElementById("staffPassword").value;

  if (!email || !password) {
    loginMessage.textContent =
      "Enter your email and password.";
    return;
  }

  const { data, error } =
    await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  await showDashboard(data.user);
}

async function staffLogout() {
  await window.supabaseClient.auth.signOut();
  showLogin();
}

async function showDashboard(user) {
  loginSection.style.display = "none";
  staffDashboard.style.display = "block";

  const loggedInAs =
    document.getElementById("loggedInAs");

  loggedInAs.textContent =
    `Signed in as ${user.email}`;

  await loadServers();
}

function showLogin() {
  loginSection.style.display = "block";
  staffDashboard.style.display = "none";
  loginMessage.textContent = "";
}

async function loadServers() {
  const { data, error } =
    await window.supabaseClient
      .from("tryout_servers")
      .select("*")
      .order("id", { ascending: true });

  if (error) {
    serverList.innerHTML = `
      <div class="empty-servers">
        ${escapeHTML(error.message)}
      </div>
    `;
    return;
  }

  serverList.innerHTML = "";

  if (!data || data.length === 0) {
    serverList.innerHTML = `
      <div class="empty-servers">
        No VIP servers added yet.
      </div>
    `;
    return;
  }

  data.forEach(server => {
    const card = document.createElement("div");
    card.className = "server-admin-card";

    const statusText =
      server.available && server.active
        ? "🟢 TRYOUT ACTIVE"
        : server.available
          ? "🟢 SERVER AVAILABLE"
          : "🔴 UNAVAILABLE";

    const statusClass =
      server.available
        ? "status-active"
        : "status-ended";

    card.innerHTML = `
      <h3>${escapeHTML(server.name)}</h3>

      <div class="server-status ${statusClass}">
        ${statusText}
      </div>

      <p>
        Link:
        ${escapeHTML(server.link || "No link")}
      </p>

      <p>
        Hosted by:
        ${escapeHTML(server.hosted_by || "—")}
      </p>

      <div class="server-actions">

        <button
          class="btn-start"
          data-action="start"
          data-id="${server.id}">
          ▶ START TRYOUT
        </button>

        <button
          class="btn-ended"
          data-action="end"
          data-id="${server.id}">
          ⛔ END TRYOUT
        </button>

        <button
          class="btn-small"
          data-action="available"
          data-id="${server.id}">
          ✅ SET AVAILABLE
        </button>

        <button
          class="btn-danger"
          data-action="unavailable"
          data-id="${server.id}">
          🚫 SET UNAVAILABLE
        </button>

        <button
          class="btn-small"
          data-action="edit"
          data-id="${server.id}">
          ✏️ EDIT
        </button>

        <button
          class="btn-danger"
          data-action="delete"
          data-id="${server.id}">
          🗑 DELETE
        </button>

      </div>
    `;

    card.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "start") startTryout(id);
        if (action === "end") endTryout(id);
        if (action === "available") setAvailable(id);
        if (action === "unavailable") setUnavailable(id);
        if (action === "edit") editServer(id);
        if (action === "delete") deleteServer(id);
      });
    });

    serverList.appendChild(card);
  });
}

async function addServer() {
  const name =
    document.getElementById("serverName").value.trim();

  const link =
    document.getElementById("serverLink").value.trim();

  if (!name || !link) {
    alert("Enter both the server name and VIP server link.");
    return;
  }

  const { data: { user } } =
    await window.supabaseClient.auth.getUser();

  if (!user) {
    showLogin();
    return;
  }

  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .insert({
        name,
        link,
        available: true,
        active: false,
        hosted_by: user.email
      });

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("serverName").value = "";
  document.getElementById("serverLink").value = "";

  await loadServers();
}

async function startTryout(id) {
  const { data: { user } } =
    await window.supabaseClient.auth.getUser();

  if (!user) {
    showLogin();
    return;
  }

  const { data: server } =
    await window.supabaseClient
      .from("tryout_servers")
      .select("link")
      .eq("id", id)
      .single();

  if (!server?.link) {
    alert("Add a VIP server link before starting the tryout.");
    return;
  }

  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({
        available: true,
        active: true,
        hosted_by: user.email
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

async function endTryout(id) {
  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({
        active: false,
        hosted_by: null
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

async function setAvailable(id) {
  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({
        available: true
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

async function setUnavailable(id) {
  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({
        available: false,
        active: false,
        hosted_by: null
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

async function editServer(id) {
  const { data: server, error: fetchError } =
    await window.supabaseClient
      .from("tryout_servers")
      .select("name,link")
      .eq("id", id)
      .single();

  if (fetchError) {
    alert(fetchError.message);
    return;
  }

  const newName =
    prompt("Enter new server name:", server.name);

  if (!newName) return;

  const newLink =
    prompt("Enter new VIP server link:", server.link || "");

  if (!newLink) return;

  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({
        name: newName.trim(),
        link: newLink.trim()
      })
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

async function deleteServer(id) {
  if (!confirm("Delete this VIP server?")) {
    return;
  }

  const { error } =
    await window.supabaseClient
      .from("tryout_servers")
      .delete()
      .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadServers();
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

if (loginButton) {
  loginButton.addEventListener("click", staffLogin);
}

if (logoutButton) {
  logoutButton.addEventListener("click", staffLogout);
}

document.addEventListener("DOMContentLoaded", initStaffPanel);
