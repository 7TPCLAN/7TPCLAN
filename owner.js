const SUPABASE_URL = "https://hzmupvsednhmwzvytysd.supabase.co";

// Supabase Publishable Key
const SUPABASE_KEY = "sb_publishable_8z_0Mmt332ZqWHm-Wa2iOQ_O4cgDq40";


// ================================
// SUPABASE
// ================================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ================================
// ELEMENTS
// ================================

const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");


// ================================
// CHECK
// ================================

console.log("7TPCLAN Owner Panel JS loaded.");
console.log("Login button:", loginButton);


// ================================
// LOGIN BUTTON
// ================================

if (loginButton) {

    loginButton.addEventListener("click", loginOwner);

} else {

    console.error("ERROR: loginButton was not found.");

}


// ================================
// LOGIN FUNCTION
// ================================

async function loginOwner() {

    console.log("Login button clicked.");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");


    if (!usernameInput || !passwordInput) {

        console.error(
            "Username or password input was not found."
        );

        if (loginStatus) {
            loginStatus.textContent =
                "Login system error. Check the HTML IDs.";
        }

        return;
    }


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    if (loginStatus) {
        loginStatus.textContent = "";
    }


    // ================================
    // EMPTY CHECK
    // ================================

    if (!username || !password) {

        loginStatus.textContent =
            "Enter your username and password.";

        return;
    }


    // ================================
    // USERNAME → REAL AUTH EMAIL
    // ================================

    const authEmail =
        "ThunderPainYT.7tpclan@gmail.com";


    console.log(
        "Attempting login for:",
        authEmail
    );


    loginStatus.textContent =
        "Logging in...";


    // ================================
    // SUPABASE LOGIN
    // ================================

    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: authEmail,

            password: password

        });


    // ================================
    // LOGIN ERROR
    // ================================

    if (error) {

        console.error(
            "Supabase login error:",
            error
        );

        loginStatus.textContent =
            error.message;

        return;
    }


    console.log(
        "Supabase login successful:",
        data.user
    );


    // ================================
    // GET PROFILE
    // ================================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient

            .from("profiles")

            .select(
                "id, username, role"
            )

            .eq(
                "id",
                data.user.id
            )

            .single();


    // ================================
    // PROFILE ERROR
    // ================================

    if (
        profileError ||
        !profile
    ) {

        console.error(
            "Profile error:",
            profileError
        );

        await supabaseClient.auth.signOut();

        loginStatus.textContent =
            "Owner profile not found.";

        return;
    }


    console.log(
        "Profile:",
        profile
    );


    // ================================
    // OWNER CHECK
    // ================================

    if (
        profile.username.toLowerCase()
            !== username.toLowerCase()
        ||
        profile.role !== "owner"
    ) {

        await supabaseClient.auth.signOut();

        loginStatus.textContent =
            "You don't have Owner access.";

        return;
    }


    // ================================
    // SUCCESS
    // ================================

    console.log(
        "OWNER LOGIN SUCCESS."
    );


    document.getElementById(
        "loginScreen"
    ).style.display = "none";


    document.getElementById(
        "panel"
    ).style.display = "block";


    document.getElementById(
        "userRole"
    ).textContent =
        profile.role.toUpperCase();


    loginStatus.textContent = "";

}


// ================================
// LOGOUT
// ================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            document.getElementById(
                "panel"
            ).style.display = "none";

            document.getElementById(
                "loginScreen"
            ).style.display = "flex";

        }
    );

}


// ================================
// GITHUB FILES
// ================================

const GITHUB_REPO = "7TPCLAN/7TPCLAN";
const GITHUB_BRANCH = "main";
const GITHUB_API = "https://api.github.com";

let currentFilesPath = "";

const filesSection = document.getElementById("filesSection");
const filesList = document.getElementById("filesList");
const filesPathLabel = document.getElementById("filesPath");
const filesBackButton = document.getElementById("filesBackButton");
const filesRefreshButton = document.getElementById("filesRefreshButton");
const fileCount = document.getElementById("fileCount");

const dashboardTopbar = document.getElementById("dashboardTopbar");
const dashboardCards = document.getElementById("dashboardCards");
const dashboardWelcome = document.getElementById("dashboardWelcome");

function showDashboard() {
    console.log("Owner Panel: opening Dashboard");

    if (filesSection) filesSection.style.display = "none";
    if (dashboardTopbar) dashboardTopbar.style.display = "flex";
    if (dashboardCards) dashboardCards.style.display = "grid";
    if (dashboardWelcome) dashboardWelcome.style.display = "block";
}

function showFiles() {
    console.log("Owner Panel: opening Files");

    if (dashboardTopbar) dashboardTopbar.style.display = "none";
    if (dashboardCards) dashboardCards.style.display = "none";
    if (dashboardWelcome) dashboardWelcome.style.display = "none";
    if (filesSection) filesSection.style.display = "block";

    loadGithubFiles(currentFilesPath);
}

async function loadGithubFiles(path = "") {
    if (!filesList) {
        console.error("Owner Panel: filesList was not found.");
        return;
    }

    filesList.innerHTML =
        '<div class="files-loading">Loading GitHub files...</div>';

    const encodedPath = path
        .split("/")
        .filter(Boolean)
        .map(encodeURIComponent)
        .join("/");

    const url = encodedPath
        ? `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${GITHUB_BRANCH}`
        : `${GITHUB_API}/repos/${GITHUB_REPO}/contents/?ref=${GITHUB_BRANCH}`;

    try {
        const response = await fetch(url, {
            headers: {
                "Accept": "application/vnd.github+json"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : [data];

        currentFilesPath = path;

        if (filesPathLabel) {
            filesPathLabel.textContent =
                `${GITHUB_REPO} / ${path ? path + " /" : ""}`;
        }

        if (fileCount) {
            fileCount.textContent = items.length;
        }

        renderGithubFiles(items);

    } catch (error) {
        console.error("GitHub files error:", error);

        filesList.innerHTML = `
            <div class="files-error">
                Could not load GitHub files.<br>
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}

function renderGithubFiles(items) {
    if (!filesList) return;

    filesList.innerHTML = "";

    const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "dir" ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });

    if (!sorted.length) {
        filesList.innerHTML =
            '<div class="files-empty">This folder is empty.</div>';
        return;
    }

    for (const item of sorted) {
        const row = document.createElement("div");
        row.className = "file-row";
        row.setAttribute("role", "button");
        row.setAttribute("tabindex", "0");

        const icon =
            item.type === "dir"
                ? "📁"
                : getFileIcon(item.name);

        row.innerHTML = `
            <div class="file-name">
                <span>${icon}</span>
                <span>${escapeHtml(item.name)}</span>
            </div>

            <div class="file-meta">
                ${item.type === "dir" ? "Folder" : formatFileSize(item.size)}
            </div>
        `;

        const openItem = () => {
            if (item.type === "dir") {
                loadGithubFiles(item.path);
                return;
            }

            window.open(
                item.html_url,
                "_blank",
                "noopener,noreferrer"
            );
        };

        row.addEventListener("click", openItem);

        row.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openItem();
            }
        });

        filesList.appendChild(row);
    }
}

function getFileIcon(name) {
    const lower = name.toLowerCase();

    if (lower.endsWith(".html")) return "🌐";
    if (lower.endsWith(".js")) return "📜";
    if (lower.endsWith(".css")) return "🎨";
    if (lower.endsWith(".json")) return "⚙️";

    if (
        lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".webp")
    ) {
        return "🖼️";
    }

    return "📄";
}

function formatFileSize(size = 0) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

if (filesRefreshButton) {
    filesRefreshButton.addEventListener("click", () => {
        loadGithubFiles(currentFilesPath);
    });
}

if (filesBackButton) {
    filesBackButton.addEventListener("click", () => {
        if (!currentFilesPath) {
            showFiles();
            return;
        }

        const parts = currentFilesPath
            .split("/")
            .filter(Boolean);

        parts.pop();

        loadGithubFiles(parts.join("/"));
    });
}

// ================================
// SIDEBAR NAVIGATION
// ================================

document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-button")
            .forEach((item) => item.classList.remove("active"));

        button.classList.add("active");

        const section = button.dataset.section;

        console.log("Owner Panel navigation:", section);

        if (section === "files") {
            showFiles();
            return;
        }

        showDashboard();
    });
});

// Make sure the dashboard is the initial view.
showDashboard();
