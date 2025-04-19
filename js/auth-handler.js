// Supabase client initialization
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0";

// Create Supabase client
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Handle authentication state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event);
    
    if (event === 'SIGNED_IN') {
        // Get user profile after sign in
        if (session && session.user) {
            getUserProfile(session.user.id);
        }
    } else if (event === 'SIGNED_OUT') {
        // Clear session storage on sign out
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("isAdmin");
    }
});

// Function to get user profile and store in session
async function getUserProfile(userId) {
    try {
        const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        
        if (profile) {
            // Store user data in session storage
            sessionStorage.setItem("isLoggedIn", "true");
            
            const userData = {
                id: userId,
                name: profile.name,
                email: profile.email,
                isAdmin: profile.is_admin
            };
            
            sessionStorage.setItem("currentUser", JSON.stringify(userData));
            
            if (profile.is_admin) {
                sessionStorage.setItem("isAdmin", "true");
            }
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

// Check for existing session on page load
async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Session check error:", error);
        return;
    }
    
    if (data.session) {
        // Session exists, get user profile
        getUserProfile(data.session.user.id);
    }
}

// Initialize session check
checkSession();

// Function to handle sign out
async function signOut() {
    try {
        await supabaseClient.auth.signOut();
        
        // Clear session storage
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("isAdmin");
        
        // Redirect to home page
        window.location.href = "index.html";
    } catch (error) {
        console.error("Sign out error:", error);
    }
}

// Export functions for use in other scripts
window.authHandler = {
    signOut,
    supabaseClient
};