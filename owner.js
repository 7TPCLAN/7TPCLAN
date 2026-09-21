const SUPABASE_URL = "https://hzmupvsednhmwzvytysd.supabase.co";
const SUPABASE_KEY = "sb_publishable_8z_0Mmt332ZqWHm-Wa2iOQ_O4cgDq40";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginScreen = document.getElementById("loginScreen");
const ownerPanel = document.getElementById("ownerPanel");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

async function loginOwner() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    loginError.textContent = "";

    if (!username || !password) {
        loginError.textContent = "Enter your username and password.";
        return;
    }

    // Convert username → Supabase Auth email
    const authEmail = `${username.toLowerCase()}@7tpclan.com`;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: authEmail,
            password: password
        });

    if (error) {
        console.error(error);
        loginError.textContent = "Invalid username or password.";
        return;
    }

    // Verify the authenticated user's profile
    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("id, username, role")
            .eq("id", data.user.id)
            .single();

    if (profileError || !profile) {
        await supabaseClient.auth.signOut();
        loginError.textContent = "Owner profile not found.";
        return;
    }

    if (
        profile.username.toLowerCase() !== username.toLowerCase() ||
        profile.role !== "owner"
    ) {
        await supabaseClient.auth.signOut();
        loginError.textContent = "You don't have Owner access.";
        return;
    }

    showOwnerPanel();
}

function showOwnerPanel() {
    loginScreen.style.display = "none";
    ownerPanel.style.display = "block";
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loginOwner();
});

async function checkSession() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) return;

    const { data: profile, error } =
        await supabaseClient
            .from("profiles")
            .select("id, username, role")
            .eq("id", session.user.id)
            .single();

    if (
        error ||
        !profile ||
        profile.role !== "owner"
    ) {
        await supabaseClient.auth.signOut();
        return;
    }

    showOwnerPanel();
}

checkSession();
