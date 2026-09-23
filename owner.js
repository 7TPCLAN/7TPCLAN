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
const filesUploadButton = document.getElementById("filesUploadButton");
const filesReplaceButton = document.getElementById("filesReplaceButton");
const filesUploadInput = document.getElementById("filesUploadInput");
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

        row.addEventListener("click", () => {
            if (item.type === "dir") {
                loadGithubFiles(item.path);
                return;
            }

            const editableExtensions = [
                ".html", ".htm", ".css", ".js", ".json",
                ".md", ".txt", ".xml", ".svg"
            ];

            const lowerName = item.name.toLowerCase();
            const editable = editableExtensions.some(
                (extension) => lowerName.endsWith(extension)
            );

            if (editable) {
                openGithubFile(item.path);
            } else {
                openItem();
            }
        });

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

async function githubFileMutation(file, replaceMode = false) {
    if (!file) return;

    const name = file.name.trim();

    if (!name || name.includes("/") || name.includes("\\")) {
        throw new Error("Choose a file name without folder separators.");
    }

    if (name.startsWith(".github")) {
        throw new Error("Files inside .github cannot be changed from Owner Panel.");
    }

    const path = currentFilesPath
        ? `${currentFilesPath}/${name}`
        : name;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session?.access_token) {
        throw new Error("Your Owner Panel session has expired. Please log in again.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    const encodedContent = btoa(binary);

    let sha = "";

    if (replaceMode) {
        const encodedPath = path.split("/").map(encodeURIComponent).join("/");
        const existing = await fetch(
            `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${GITHUB_BRANCH}`,
            { headers: { "Accept": "application/vnd.github+json" } }
        );

        if (!existing.ok) {
            throw new Error(existing.status === 404
                ? "That file does not exist in this folder."
                : `Could not find the existing file (HTTP ${existing.status}).`);
        }

        const existingData = await existing.json();

        if (existingData.type !== "file" || !existingData.sha) {
            throw new Error("The selected path is not an existing file.");
        }

        sha = existingData.sha;
    } else {
        const encodedPath = path.split("/").map(encodeURIComponent).join("/");
        const existing = await fetch(
            `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${GITHUB_BRANCH}`,
            { headers: { "Accept": "application/vnd.github+json" } }
        );

        if (existing.ok) {
            throw new Error("A file with that name already exists. Use Replace File instead.");
        }
    }

    const action = replaceMode ? "Replace" : "Upload";
    const defaultMessage = `${action} ${path}`;
    const message = window.prompt("Commit message:", defaultMessage);

    if (!message?.trim()) return;

    const response = await fetch(
        `${SUPABASE_URL}/functions/v1/github-save`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                path,
                content: encodedContent,
                encoding: "base64",
                message: message.trim(),
                sha,
                mode: replaceMode ? "replace" : "create"
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || `Upload failed (HTTP ${response.status})`);
    }

    return result;
}

async function chooseAndUpload(replaceMode = false) {
    if (!filesUploadInput) return;

    filesUploadInput.value = "";
    filesUploadInput.accept = "";

    if (replaceMode) {
        const path = window.prompt(
            "Enter the existing repository file path to replace:",
            currentFilesPath ? `${currentFilesPath}/` : ""
        );

        if (!path?.trim()) return;

        const cleanPath = path.trim().replace(/^\\/+|\\/+$/g, "");
        const existing = await fetch(
            `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${cleanPath.split("/").map(encodeURIComponent).join("/")}?ref=${GITHUB_BRANCH}`,
            { headers: { "Accept": "application/vnd.github+json" } }
        );

        if (!existing.ok) {
            throw new Error(existing.status === 404
                ? "That repository file was not found."
                : `Could not find the repository file (HTTP ${existing.status}).`);
        }

        const existingData = await existing.json();

        if (existingData.type !== "file") {
            throw new Error("That path is a folder, not a file.");
        }

        filesUploadInput.dataset.replacePath = cleanPath;
    } else {
        filesUploadInput.dataset.replacePath = "";
    }

    filesUploadInput.click();
}

if (filesUploadInput) {
    filesUploadInput.addEventListener("change", async () => {
        const file = filesUploadInput.files?.[0];
        if (!file) return;

        const replacePath = filesUploadInput.dataset.replacePath || "";
        const replaceMode = Boolean(replacePath);

        if (replaceMode) {
            const originalName = file.name;
            const targetName = replacePath.split("/").pop();

            if (originalName !== targetName) {
                const proceed = window.confirm(
                    `You selected "${originalName}" but the target file is "${targetName}". Replace it with the selected file anyway?`
                );
                if (!proceed) return;
            }
        }

        if (filesUploadButton) filesUploadButton.disabled = true;
        if (filesReplaceButton) filesReplaceButton.disabled = true;

        try {
            let result;

            if (replaceMode) {
                // Send the target path selected by the owner.
                const targetPath = replacePath;
                const bytes = new Uint8Array(await file.arrayBuffer());
                let binary = "";
                const chunkSize = 0x8000;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
                }

                const encodedContent = btoa(binary);
                const { data: { session } } = await supabaseClient.auth.getSession();

                if (!session?.access_token) {
                    throw new Error("Your Owner Panel session has expired. Please log in again.");
                }

                const existing = await fetch(
                    `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${targetPath.split("/").map(encodeURIComponent).join("/")}?ref=${GITHUB_BRANCH}`,
                    { headers: { "Accept": "application/vnd.github+json" } }
                );
                const existingData = await existing.json();
                if (!existing.ok || !existingData.sha) {
                    throw new Error("Could not get the current file version for replacement.");
                }

                const message = window.prompt("Commit message:", `Replace ${targetPath}`);
                if (!message?.trim()) return;

                const response = await fetch(
                    `${SUPABASE_URL}/functions/v1/github-save`,
                    {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${session.access_token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            path: targetPath,
                            content: encodedContent,
                            encoding: "base64",
                            message: message.trim(),
                            sha: existingData.sha,
                            mode: "replace"
                        })
                    }
                );

                result = await response.json();
                if (!response.ok) throw new Error(result.error || "Replace failed.");
            } else {
                result = await githubFileMutation(file, false);
            }

            alert(`${replaceMode ? "File replaced" : "File uploaded"} successfully!\n\nCommit: ${result.commit || "created"}`);
            await loadGithubFiles(currentFilesPath);
        } catch (error) {
            console.error("GitHub file upload/replace error:", error);
            alert(`Could not ${replaceMode ? "replace" : "upload"} file:\n\n${error.message}`);
        } finally {
            if (filesUploadButton) filesUploadButton.disabled = false;
            if (filesReplaceButton) filesReplaceButton.disabled = false;
            filesUploadInput.dataset.replacePath = "";
            filesUploadInput.value = "";
        }
    });
}

if (filesUploadButton) {
    filesUploadButton.addEventListener("click", () => {
        chooseAndUpload(false).catch(error => alert(`Could not start upload:\n\n${error.message}`));
    });
}

if (filesReplaceButton) {
    filesReplaceButton.addEventListener("click", () => {
        chooseAndUpload(true).catch(error => alert(`Could not start replacement:\n\n${error.message}`));
    });
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
// CODE EDITOR
// ================================

const editorSection = document.getElementById("editorSection");
const codeEditor = document.getElementById("codeEditor");
const editorFile = document.getElementById("editorFile");
const editorStatus = document.getElementById("editorStatus");
const editorSaveButton = document.getElementById("editorSaveButton");
const editorReloadButton = document.getElementById("editorReloadButton");
const editorCloseButton = document.getElementById("editorCloseButton");

let currentEditorPath = "";
let currentEditorSha = "";
let currentEditorContent = "";

function showEditor() {
    if (dashboardTopbar) dashboardTopbar.style.display = "none";
    if (dashboardCards) dashboardCards.style.display = "none";
    if (dashboardWelcome) dashboardWelcome.style.display = "none";
    if (filesSection) filesSection.style.display = "none";
    if (editorSection) editorSection.style.display = "block";

    setActiveNav("code-editor");
}

function closeEditor() {
    if (editorSection) editorSection.style.display = "none";
    showFiles();
    setActiveNav("files");
}

function setActiveNav(sectionName) {
    document.querySelectorAll(".nav-button").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.section === sectionName
        );
    });
}

async function openGithubFile(path) {
    showEditor();

    if (editorFile) {
        editorFile.textContent = `Loading: ${path}`;
    }

    if (editorStatus) {
        editorStatus.textContent = "Loading file from GitHub...";
    }

    if (codeEditor) {
        codeEditor.value = "";
    }

    if (editorSaveButton) {
        editorSaveButton.disabled = true;
    }

    try {
        const response = await fetch(
            `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
            {
                headers: {
                    "Accept": "application/vnd.github+json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub returned HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.type !== "file") {
            throw new Error("That item is not a text file.");
        }

        if (!data.content) {
            throw new Error("GitHub did not return file content.");
        }

        const decoded = atob(
            data.content.replace(/\\s/g, "")
        );

        const bytes = Uint8Array.from(
            decoded,
            (character) => character.charCodeAt(0)
        );

        const content = new TextDecoder("utf-8").decode(bytes);

        currentEditorPath = path;
        currentEditorSha = data.sha;
        currentEditorContent = content;

        if (editorFile) {
            editorFile.textContent =
                `${GITHUB_REPO} / ${path}`;
        }

        if (codeEditor) {
            codeEditor.value = content;
        }

        if (editorSaveButton) {
            editorSaveButton.disabled = false;
        }

        if (editorStatus) {
            editorStatus.textContent =
                "File loaded. Changes can be saved securely to GitHub.";
        }

    } catch (error) {
        console.error("Code Editor error:", error);

        if (editorStatus) {
            editorStatus.textContent =
                `Could not open file: ${error.message}`;
        }
    }
}

function refreshEditor() {
    if (!currentEditorPath) return;
    openGithubFile(currentEditorPath);
}

if (editorCloseButton) {
    editorCloseButton.addEventListener("click", closeEditor);
}

if (editorReloadButton) {
    editorReloadButton.addEventListener("click", refreshEditor);
}

if (codeEditor) {
    codeEditor.addEventListener("input", () => {
        const changed =
            codeEditor.value !== currentEditorContent;

        if (editorStatus) {
            editorStatus.textContent =
                changed
                    ? "Unsaved changes"
                    : "No changes";
        }
    });

    codeEditor.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
            event.preventDefault();

            const start = codeEditor.selectionStart;
            const end = codeEditor.selectionEnd;

            codeEditor.value =
                codeEditor.value.substring(0, start) +
                "    " +
                codeEditor.value.substring(end);

            codeEditor.selectionStart =
                codeEditor.selectionEnd =
                    start + 4;

            codeEditor.dispatchEvent(new Event("input"));
        }
    });
}

if (editorSaveButton) {
    editorSaveButton.addEventListener("click", async () => {
        if (!currentEditorPath || !codeEditor) return;

        const newContent = codeEditor.value;

        if (newContent === currentEditorContent) {
            if (editorStatus) {
                editorStatus.textContent = "No changes to save.";
            }
            return;
        }

        const message = window.prompt(
            "Commit message:",
            `Update ${currentEditorPath}`
        );

        if (!message || !message.trim()) {
            return;
        }

        editorSaveButton.disabled = true;

        if (editorStatus) {
            editorStatus.textContent = "Saving to GitHub...";
        }

        try {
            const { data: { session } } =
                await supabaseClient.auth.getSession();

            if (!session?.access_token) {
                throw new Error("Your Owner Panel session has expired. Please log in again.");
            }

            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/github-save`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${session.access_token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        path: currentEditorPath,
                        content: newContent,
                        message: message.trim(),
                        sha: currentEditorSha
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Save failed (HTTP ${response.status})`);
            }

            currentEditorContent = newContent;
            currentEditorSha = "";

            if (editorStatus) {
                editorStatus.textContent =
                    `Saved successfully. Commit: ${result.commit || "created"}`;
            }

            // Refresh the file's SHA/content metadata after the commit.
            await openGithubFile(currentEditorPath);

        } catch (error) {
            console.error("GitHub save error:", error);

            if (editorStatus) {
                editorStatus.textContent =
                    `Could not save: ${error.message}`;
            }
        } finally {
            editorSaveButton.disabled = false;
        }
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

        if (section === "code-editor") {
            showEditor();
            return;
        }

        showDashboard();
    });
});

// Make sure the dashboard is the initial view.
showDashboard();
