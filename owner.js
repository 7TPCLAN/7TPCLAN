// ==========================================
// 7TPCLAN OWNER PANEL
// Authentication + Panel Control
// ==========================================

// 🔐 NEW OWNER PANEL SUPABASE PROJECT
const SUPABASE_URL = "https://hzmupvsednhmwzvytysd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_8z_0Mmt332ZqWHm-Wa2iOQ_O4cgDq40";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTS
// ==========================================

const loginScreen = document.getElementById("loginScreen");
const panel = document.getElementById("panel");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");

const loginStatus = document.getElementById("loginStatus");


// ==========================================
// SHOW OWNER PANEL
// ==========================================

function showPanel() {
    loginScreen.style.display = "none";
    panel.style.display = "block";
}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {
    panel.style.display = "none";
    loginScreen.style.display = "flex";
}


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener("click", async () => {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        loginStatus.textContent =
            "Please enter your email and password.";

        return;
    }


    loginStatus.textContent =
        "Signing in...";


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


    if (error) {

        console.error(error);

        loginStatus.textContent =
            "Login failed.";

        return;
    }


    console.log("Logged in:", data.user.email);

    loginStatus.textContent = "";

    showPanel();

});


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    showLogin();

    document.getElementById("password").value = "";

});


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        console.log(
            "Existing session found:",
            session.user.email
        );

        showPanel();

    } else {

        showLogin();

    }
}


// ==========================================
// START OWNER PANEL
// ==========================================

checkSession();
