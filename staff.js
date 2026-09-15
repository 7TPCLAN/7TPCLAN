/* =========================================
   7TPclan STAFF PANEL
   USERNAME + PASSWORD LOGIN
========================================= */


/*
   Username -> Supabase Auth email

   The staff member types their username,
   but Supabase authenticates the mapped email
   behind the scenes.

   You MUST create these corresponding
   Supabase Auth users.
*/

const staffAccounts = {

  "ThunderPainYT":
    "thunderpainyt@7tpclan.com",

  "Mr._":
    "mr@7tpclan.com",

  "jnsjna19":
    "jnsjna19@7tpclan.com",

  "Raven":
    "raven@7tpclan.com",

  "eku":
    "eku@7tpclan.com",

  "7TP_Smobu":
    "7tp_smobu@7tpclan.com"

};


/* =========================================
   ELEMENTS
========================================= */

const loginSection =
  document.getElementById("loginSection");

const staffDashboard =
  document.getElementById("staffDashboard");

const loginButton =
  document.getElementById("loginButton");

const logoutButton =
  document.getElementById("logoutButton");

const addServerButton =
  document.getElementById("addServerButton");

const loginMessage =
  document.getElementById("loginMessage");

const serverList =
  document.getElementById("serverList");

const loggedInAs =
  document.getElementById("loggedInAs");


/* =========================================
   SHOW LOGIN
========================================= */

function showLogin() {

  loginSection.style.display =
    "block";

  staffDashboard.style.display =
    "none";

  loginMessage.textContent =
    "";

}


/* =========================================
   SHOW DASHBOARD
========================================= */

async function showDashboard(user) {

  loginSection.style.display =
    "none";

  staffDashboard.style.display =
    "block";


  const username =
    localStorage.getItem(
      "7tp_staff_username"
    );


  loggedInAs.textContent =
    `Logged in as ${username || user?.email || "Staff"}`;


  await loadServers();

}


/* =========================================
   LOGIN
========================================= */

async function staffLogin() {

  loginMessage.textContent =
    "";


  const username =
    document
      .getElementById("staffUsername")
      .value
      .trim();


  const password =
    document
      .getElementById("staffPassword")
      .value;


  if (!username || !password) {

    loginMessage.textContent =
      "Enter your username and password.";

    return;

  }


  const email =
    staffAccounts[username];


  if (!email) {

    loginMessage.textContent =
      "Invalid staff username.";

    return;

  }


  if (!window.supabaseClient) {

    loginMessage.textContent =
      "Supabase is not configured.";

    return;

  }


  const {
    data,
    error
  } =
    await window.supabaseClient.auth
      .signInWithPassword({

        email: email,

        password: password

      });


  if (error) {

    loginMessage.textContent =
      "Incorrect username or password.";

    console.error(error);

    return;

  }


  localStorage.setItem(
    "7tp_staff_username",
    username
  );


  await showDashboard(
    data.user
  );

}


/* =========================================
   LOGOUT
========================================= */

async function staffLogout() {

  if (window.supabaseClient) {

    await window.supabaseClient.auth
      .signOut();

  }


  localStorage.removeItem(
    "7tp_staff_username"
  );


  document
    .getElementById("staffUsername")
    .value = "";


  document
    .getElementById("staffPassword")
    .value = "";


  showLogin();

}


/* =========================================
   GET SERVERS
========================================= */

async function loadServers() {

  if (!serverList) {
    return;
  }


  const {
    data,
    error
  } =
    await window.supabaseClient
      .from("tryout_servers")
      .select("*")
      .order(
        "id",
        {
          ascending: true
        }
      );


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

    const card =
      document.createElement("div");


    card.className =
      "server-admin-card";


    let status;


    if (
      server.available &&
      server.active
    ) {

      status =
        "🟢 TRYOUT ACTIVE";

    }

    else if (
      server.available
    ) {

      status =
        "🟢 SERVER AVAILABLE";

    }

    else {

      status =
        "🔴 UNAVAILABLE";

    }


    card.innerHTML = `

      <h3>
        ${escapeHTML(server.name)}
      </h3>


      <div
        class="server-status ${
          server.available
            ? "status-active"
            : "status-ended"
        }">

        ${status}

      </div>


      <p>
        Link:
        ${escapeHTML(
          server.link || "No link"
        )}
      </p>


      <p>
        Hosted by:
        ${escapeHTML(
          server.hosted_by || "—"
        )}
      </p>


      <div class="server-actions">


        <button
          class="btn-start"
          type="button"
          data-action="start"
          data-id="${server.id}">

          ▶ START TRYOUT

        </button>


        <button
          class="btn-ended"
          type="button"
          data-action="end"
          data-id="${server.id}">

          ⛔ END TRYOUT

        </button>


        <button
          class="btn-small"
          type="button"
          data-action="available"
          data-id="${server.id}">

          ✅ SET AVAILABLE

        </button>


        <button
          class="btn-danger"
          type="button"
          data-action="unavailable"
          data-id="${server.id}">

          🚫 SET UNAVAILABLE

        </button>


        <button
          class="btn-small"
          type="button"
          data-action="edit"
          data-id="${server.id}">

          ✏️ EDIT

        </button>


        <button
          class="btn-danger"
          type="button"
          data-action="delete"
          data-id="${server.id}">

          🗑 DELETE

        </button>


      </div>

    `;


    card
      .querySelectorAll("button")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              Number(
                button.dataset.id
              );


            const action =
              button.dataset.action;


            if (
              action === "start"
            ) {

              startTryout(id);

            }


            if (
              action === "end"
            ) {

              endTryout(id);

            }


            if (
              action === "available"
            ) {

              setAvailable(id);

            }


            if (
              action === "unavailable"
            ) {

              setUnavailable(id);

            }


            if (
              action === "edit"
            ) {

              editServer(id);

            }


            if (
              action === "delete"
            ) {

              deleteServer(id);

            }

          }
        );

      });


    serverList.appendChild(
      card
    );

  });

}


/* =========================================
   ADD SERVER
========================================= */

async function addServer() {

  const name =
    document
      .getElementById("serverName")
      .value
      .trim();


  const link =
    document
      .getElementById("serverLink")
      .value
      .trim();


  if (!name || !link) {

    alert(
      "Enter both the server name and VIP server link."
    );

    return;

  }


  const {
    data: {
      user
    }
  } =
    await window.supabaseClient
      .auth
      .getUser();


  if (!user) {

    showLogin();

    return;

  }


  const username =
    localStorage.getItem(
      "7tp_staff_username"
    );


  const {
    error
  } =
    await window.supabaseClient
      .from("tryout_servers")
      .insert({

        name: name,

        link: link,

        available: true,

        active: false,

        hosted_by: username

      });


  if (error) {

    alert(error.message);

    return;

  }


  document
    .getElementById("serverName")
    .value = "";


  document
    .getElementById("serverLink")
    .value = "";


  await loadServers();

}


/* =========================================
   START TRYOUT
========================================= */

async function startTryout(id) {

  const {
    data: {
      user
    }
  } =
    await window.supabaseClient
      .auth
      .getUser();


  if (!user) {

    showLogin();

    return;

  }


  const {
    data: server,
    error: fetchError
  } =
    await window.supabaseClient
      .from("tryout_servers")
      .select("link")
      .eq("id", id)
      .single();


  if (fetchError) {

    alert(fetchError.message);

    return;

  }


  if (!server.link) {

    alert(
      "Add a VIP server link first."
    );

    return;

  }


  const username =
    localStorage.getItem(
      "7tp_staff_username"
    );


  const {
    error
  } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({

        available: true,

        active: true,

        hosted_by: username

      })
      .eq("id", id);


  if (error) {

    alert(error.message);

    return;

  }


  await loadServers();

}


/* =========================================
   END TRYOUT
========================================= */

async function endTryout(id) {

  const {
    error
  } =
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


/* =========================================
   SET AVAILABLE
========================================= */

async function setAvailable(id) {

  const {
    error
  } =
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


/* =========================================
   SET UNAVAILABLE
========================================= */

async function setUnavailable(id) {

  const {
    error
  } =
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


/* =========================================
   EDIT SERVER
========================================= */

async function editServer(id) {

  const {
    data: server,
    error: fetchError
  } =
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
    prompt(
      "Enter new server name:",
      server.name
    );


  if (
    newName === null ||
    !newName.trim()
  ) {

    return;

  }


  const newLink =
    prompt(
      "Enter new VIP server link:",
      server.link || ""
    );


  if (
    newLink === null ||
    !newLink.trim()
  ) {

    return;

  }


  const {
    error
  } =
    await window.supabaseClient
      .from("tryout_servers")
      .update({

        name:
          newName.trim(),

        link:
          newLink.trim()

      })
      .eq("id", id);


  if (error) {

    alert(error.message);

    return;

  }


  await loadServers();

}


/* =========================================
   DELETE SERVER
========================================= */

async function deleteServer(id) {

  if (
    !confirm(
      "Delete this VIP server?"
    )
  ) {

    return;

  }


  const {
    error
  } =
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


/* =========================================
   SAFE HTML
========================================= */

function escapeHTML(value) {

  const div =
    document.createElement("div");


  div.textContent =
    value || "";


  return div.innerHTML;

}


/* =========================================
   BUTTONS
========================================= */

if (loginButton) {

  loginButton.addEventListener(
    "click",
    staffLogin
  );

}


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    staffLogout
  );

}


if (addServerButton) {

  addServerButton.addEventListener(
    "click",
    addServer
  );

}


/* =========================================
   ENTER KEY LOGIN
========================================= */

document
  .getElementById("staffPassword")
  ?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        staffLogin();

      }

    }
  );


/* =========================================
   CHECK SESSION
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    if (!window.supabaseClient) {

      showLogin();

      return;

    }


    const {
      data: {
        session
      }
    } =
      await window.supabaseClient
        .auth
        .getSession();


    if (session) {

      await showDashboard(
        session.user
      );

    }

    else {

      showLogin();

    }

  }
);
