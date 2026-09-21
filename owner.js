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
