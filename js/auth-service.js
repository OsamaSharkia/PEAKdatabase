/**
 * auth-service.js - Centralized authentication and Supabase client management
 */

// Initialize Supabase client
// NOTE: In production, these values should be environment variables
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0";

// Create and export the Supabase client
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

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
      await window.supabaseClient.auth.signOut();
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
    
    // Get all navigation containers
    const navContainers = document.querySelectorAll("#nav-links, .nav-links, nav ul");
    
    if (navContainers.length === 0) {
      console.warn("No navigation containers found");
      return;
    }
    
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    
    navContainers.forEach(navContainer => {
      // Find existing links
      const links = navContainer.getElementsByTagName("a");
      let loginLink, registerLink, profileLink, logoutLink, adminLink;
      
      // Find relevant links
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const linkText = link.textContent.trim();
        if (linkText === "Login") loginLink = link;
        if (linkText === "Register") registerLink = link;
        if (linkText === "My Profile" || linkText === "Profile") profileLink = link;
        if (linkText === "Logout") logoutLink = link;
        if (linkText === "Admin") adminLink = link;
      }
      
      if (isLoggedIn) {
        // User is logged in - show profile and logout
        if (loginLink) {
          loginLink.textContent = "My Profile";
          loginLink.href = "profile.html";
        }
        
        if (registerLink) {
          registerLink.textContent = "Logout";
          registerLink.href = "#";
          registerLink.id = "logout-btn";
        }
        
        // Add admin link if user is admin
        if (isAdmin && !adminLink) {
          const adminLi = document.createElement("li");
          adminLi.innerHTML = `<a href="admin.html">Admin</a>`;
          navContainer.appendChild(adminLi);
        }
      } else {
        // User is logged out - show login and register
        if (profileLink) {
          profileLink.textContent = "Login";
          profileLink.href = "login.html";
        }
        
        if (logoutLink) {
          logoutLink.textContent = "Register";
          logoutLink.href = "register.html";
          logoutLink.id = "";
        }
        
        // Remove admin link if it exists
        if (adminLink) {
          adminLink.parentElement.remove();
        }
      }
    });
  },
  
  // Database utility functions
  db: {
    // Record login activity
    async recordLoginActivity() {
      try {
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
        if (!resourceId) return;
        await window.supabaseClient.rpc("increment_resource_view", { resource_id: resourceId });
      } catch (error) {
        console.error("Error recording resource view:", error);
      }
    },
    
    // Get user profile
    async getUserProfile() {
      try {
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
  authService.updateNavigation();
  
  // Check if current page requires authentication
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const authRequiredPages = ["profile.html", "dashboard.html"];
  
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