/**
 * auth-service.js - Centralized authentication and Supabase client management
 */

// Initialize Supabase client
// NOTE: In production, these values should be environment variables
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0";

// Create and export the Supabase client if available
if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase library not loaded. Authentication features will be limited.");
}

// Authentication state management
const authService = {
  // Check if user is logged in
  isLoggedIn() {
    return sessionStorage.getItem("isLoggedIn") === "true";
  },

  // Get current user data
  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("currentUser") || "null");
  },

  // Check if user is admin
  isAdmin() {
    return sessionStorage.getItem("isAdmin") === "true";
  },

  // Initialize authentication on page load
  async initialize() {
    try {
      console.log("Auth service initializing");
      
      // If Supabase client is not available, just use session storage
      if (!window.supabaseClient) {
        console.warn("Supabase client not available, using session storage only");
        return this.isLoggedIn();
      }
      
      // Get current session
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      
      if (error) {
        console.error("Error checking auth status:", error);
        return false;
      }
      
      if (session) {
        // User is logged in
        console.log("User is logged in:", session.user.email);
        
        // Get user profile
        const { data: profile, error: profileError } = await window.supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (!profileError && profile) {
          // Store user data in sessionStorage
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("currentUser", JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: profile.name || "User",
            isAdmin: profile.is_admin || false
          }));
          
          if (profile.is_admin) {
            sessionStorage.setItem("isAdmin", "true");
          }
        } else {
          // Store basic user data even if profile not found
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("currentUser", JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: "User",
            isAdmin: false
          }));
        }
        
        return true;
      } else {
        // User is not logged in
        this.clearSession();
        return false;
      }
    } catch (err) {
      console.error("Unexpected error in auth initialization:", err);
      return false;
    }
  },
  
  // Sign in user
  async login(email, password) {
    try {
      if (!window.supabaseClient) {
        return { success: false, error: { message: "Authentication service not available" } };
      }
      
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Get user profile
      const { data: profile, error: profileError } = await window.supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      // Store user data
      sessionStorage.setItem("isLoggedIn", "true");
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || "User",
        isAdmin: profile?.is_admin || false
      };
      
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      
      if (profile?.is_admin) {
        sessionStorage.setItem("isAdmin", "true");
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  },
  
  // Register new user
  async register(email, password, name) {
    try {
      if (!window.supabaseClient) {
        return { success: false, error: { message: "Authentication service not available" } };
      }
      
      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error };
    }
  },
  
  // Sign out user
  async logout() {
    try {
      if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
      }
      this.clearSession();
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
  },
  
  // Clear session data
  clearSession() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("redirectAfterLogin");
  },
  
  // Update navigation based on auth status
  updateNavigation() {
    const isLoggedIn = this.isLoggedIn();
    const isAdmin = this.isAdmin();
    const currentUser = this.getCurrentUser();
    
    // Get navigation container
    const navContainer = document.querySelector("#nav-links, .nav-links, nav ul");
    
    if (!navContainer) {
      console.warn("Navigation container not found");
      return;
    }
    
    console.log("Updating navigation. Login status:", isLoggedIn);
    
    // First, ensure the standard navigation items exist
    const standardLinks = [
      { href: "index.html", text: "Home" },
      { href: "pathways.html", text: "Education Pathways" },
      { href: "resources.html", text: "Resources" },
      { href: "faq.html", text: "FAQ" },
      { href: "contact.html", text: "Contact" },
      { href: "about.html", text: "About Us" }
    ];
    
    // Check if standard links exist, add them if they don't
    if (navContainer.children.length === 0) {
      console.log("Adding standard navigation links");
      standardLinks.forEach(link => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        li.appendChild(a);
        navContainer.appendChild(li);
      });
    }
    
    // Now handle auth links
    // First, check if auth links already exist
    let loginLi = null;
    let registerLi = null;
    let adminLi = null;
    
    // Find existing auth links
    Array.from(navContainer.children).forEach(li => {
      const a = li.querySelector("a");
      if (!a) return;
      
      const href = a.getAttribute("href");
      const text = a.textContent;
      
      if (href === "login.html" || href === "profile.html" || text === "Login" || text === "My Profile") {
        loginLi = li;
      } else if (href === "register.html" || href === "#" && text === "Logout") {
        registerLi = li;
      } else if (href === "admin.html") {
        adminLi = li;
      }
    });
    
    // Add or update login/profile link
    if (!loginLi) {
      loginLi = document.createElement("li");
      loginLi.className = "auth-link";
      navContainer.appendChild(loginLi);
    }
    
    const loginLink = loginLi.querySelector("a") || document.createElement("a");
    loginLink.href = isLoggedIn ? "profile.html" : "login.html";
    loginLink.textContent = isLoggedIn ? "My Profile" : "Login";
    if (!loginLink.parentNode) {
      loginLi.appendChild(loginLink);
    }
    
    // Add or update register/logout link
    if (!registerLi) {
      registerLi = document.createElement("li");
      registerLi.className = "auth-link";
      navContainer.appendChild(registerLi);
    }
    
    const registerLink = registerLi.querySelector("a") || document.createElement("a");
    registerLink.href = isLoggedIn ? "#" : "register.html";
    registerLink.textContent = isLoggedIn ? "Logout" : "Register";
    registerLink.id = isLoggedIn ? "logout-link" : "";
    if (!registerLink.parentNode) {
      registerLi.appendChild(registerLink);
    }
    
    // Add logout event listener
    if (isLoggedIn && registerLink) {
      registerLink.onclick = async (e) => {
        e.preventDefault();
        await this.logout();
        window.location.href = "index.html";
      };
    }
    
    // Handle admin link
    if (isLoggedIn && isAdmin) {
      if (!adminLi) {
        adminLi = document.createElement("li");
        adminLi.className = "auth-link";
        const adminLink = document.createElement("a");
        adminLink.href = "admin.html";
        adminLink.textContent = "Admin";
        adminLi.appendChild(adminLink);
        navContainer.appendChild(adminLi);
      }
    } else if (adminLi) {
      adminLi.remove();
    }
    
    console.log("Navigation updated successfully");
  },
  
  // Database utility functions
  db: {
    // Record login activity
    async recordLoginActivity() {
      try {
        if (!window.supabaseClient) return;
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
          await window.supabaseClient.rpc("record_login_activity");
        }
      } catch (error) {
        console.error("Error recording login activity:", error);
      }
    },
    
    // Record resource view
    async recordResourceView(resourceId) {
      try {
        if (!window.supabaseClient || !resourceId) return;
        
        await window.supabaseClient.rpc("increment_resource_view", { resource_id: resourceId });
      } catch (error) {
        console.error("Error recording resource view:", error);
      }
    },
    
    // Get user profile
    async getUserProfile() {
      try {
        if (!window.supabaseClient) return null;
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return null;
        
        const { data, error } = await window.supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error getting user profile:", error);
        return null;
      }
    },
    
    // Update user profile
    async updateUserProfile(profileData) {
      try {
        if (!window.supabaseClient) return { success: false, error: "Supabase client not initialized" };
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) return { success: false, error: "User not authenticated" };
        
        const updatedProfile = {
          ...profileData,
          id: user.id,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await window.supabaseClient
          .from("user_profiles")
          .upsert(updatedProfile);
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error("Error updating user profile:", error);
        return { success: false, error: error.message || "Failed to update profile" };
      }
    }
  }
};

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", async () => {
  await authService.initialize();
  
  // Update navigation after a short delay to ensure DOM is fully loaded
  setTimeout(() => {
    authService.updateNavigation();
  }, 100);
  
  // Check if current page requires authentication
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const authRequiredPages = ["profile.html", "dashboard.html", "admin.html"];
  
  if (authRequiredPages.includes(currentPage) && !authService.isLoggedIn()) {
    // Store the page they were trying to access for redirect after login
    sessionStorage.setItem("redirectAfterLogin", currentPage);
    // Redirect to login page
    window.location.href = "login.html";
    return;
  }
  
  // Handle logout clicks
  document.addEventListener("click", async (e) => {
    if (e.target && (e.target.id === "logout-btn" || e.target.id === "logout-link")) {
      e.preventDefault();
      const result = await authService.logout();
      if (result.success) {
        window.location.href = "index.html";
      } else {
        alert("Failed to log out. Please try again.");
      }
    }
  });
});

// Make auth service globally available
window.authService = authService;