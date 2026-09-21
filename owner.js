// ==========================================
// 7TPCLAN OWNER PANEL
// Authentication + Panel Control
// ==========================================

// 🔐 NEW OWNER PANEL SUPABASE PROJECT
const SUPABASE_URL = "https://hzmupvsednhmwzvytysd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_8z_0Mmt332ZqWHm-Wa2iOQ_O4cgDq40";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// ELEMENTS
// ==========================================

const loginScreen =
    document.getElementById("loginScreen");

const panel =
    document.getElementById("panel");

const loginButton =
    document.getElementById("loginButton");

const logoutButton =
    document.getElementById("logoutButton");

const loginStatus =
    document.getElementById("loginStatus");

const userRole =
    document.getElementById("userRole");


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
// SHOW STATUS
// ==========================================

function setStatus(message) {

    loginStatus.textContent = message;
}


// ==========================================
// LOGIN
// ==========================================

loginButton.addEventListener("click", async () => {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    // --------------------------------------
    // CHECK INPUT
    // --------------------------------------

    if (!username || !password) {

        setStatus(
            "Please enter your username and password."
        );

        return;
    }


    setStatus("Checking username...");


    try {

        // ----------------------------------
        // FIND PROFILE
        // ----------------------------------

        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("id, username, email, role")
                .eq("username", username)
                .single();


        // ----------------------------------
        // PROFILE NOT FOUND
        // ----------------------------------

        if (profileError || !profile) {

            console.error(
                "PROFILE LOOKUP ERROR:",
                profileError
            );

            setStatus("Username not found.");

            return;
        }


        // ----------------------------------
        // CHECK PROFILE EMAIL
        // ----------------------------------

        if (!profile.email) {

            console.error(
                "PROFILE HAS NO EMAIL"
            );

            setStatus(
                "This account is not configured correctly."
            );

            return;
        }


        // ----------------------------------
        // CHECK ROLE
        // ----------------------------------

        if (profile.role !== "owner") {

            console.warn(
                "Unauthorized role:",
                profile.role
            );

            setStatus(
                "You do not have Owner Panel access."
            );

            return;
        }


        setStatus("Signing in...");


        // ----------------------------------
        // SUPABASE AUTH LOGIN
        // ----------------------------------

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: profile.email,

                    password: password

                });


        // ----------------------------------
        // AUTH ERROR
        // ----------------------------------

        if (error) {

            console.error(
                "SUPABASE LOGIN ERROR:",
                error
            );

            setStatus(error.message);

            return;
        }


        // ----------------------------------
        // VERIFY USER
        // ----------------------------------

        if (!data.user) {

            setStatus(
                "Login succeeded but no user was returned."
            );

            return;
        }


        // ----------------------------------
        // VERIFY UUID
        // ----------------------------------

        if (data.user.id !== profile.id) {

            console.error(
                "UUID MISMATCH",
                {
                    authUser: data.user.id,
                    profileUser: profile.id
                }
            );

            await supabaseClient.auth.signOut();

            setStatus(
                "Account verification failed."
            );

            return;
        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        console.log(
            "Owner logged in:",
            profile.username
        );


        console.log(
            "Role:",
            profile.role
        );


        userRole.textContent =
            profile.role.toUpperCase();


        setStatus("");

        showPanel();

    }

    catch (error) {

        console.error(
            "UNEXPECTED LOGIN ERROR:",
            error
        );

        setStatus(
            "Something went wrong. Check the console."
        );

    }

});


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        document
            .getElementById("password")
            .value = "";

        document
            .getElementById("username")
            .value = "";

        setStatus("");

        showLogin();

    }
);


// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


    // --------------------------------------
    // NO SESSION
    // --------------------------------------

    if (!session) {

        showLogin();

        return;
    }


    // --------------------------------------
    // SESSION EXISTS
    // --------------------------------------

    console.log(
        "Existing session found:",
        session.user.email
    );


    // --------------------------------------
    // GET PROFILE
    // --------------------------------------

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("id, username, role")
            .eq("id", session.user.id)
            .single();


    if (error || !profile) {

        console.error(
            "SESSION PROFILE ERROR:",
            error
        );

        await supabaseClient.auth.signOut();

        showLogin();

        return;
    }


    // --------------------------------------
    // ROLE CHECK
    // --------------------------------------

    if (profile.role !== "owner") {

        console.warn(
            "Unauthorized session role:",
            profile.role
        );

        await supabaseClient.auth.signOut();

        showLogin();

        return;
    }


    // --------------------------------------
    // SHOW OWNER PANEL
    // --------------------------------------

    userRole.textContent =
        profile.role.toUpperCase();

    showPanel();

}


// ==========================================
// START OWNER PANEL
// ==========================================

checkSession();
