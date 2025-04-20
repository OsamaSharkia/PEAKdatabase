// Initialize Supabase client
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

// Make supabaseClient globally available
window.supabaseClient = supabaseClient

// Check if user is logged in on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Auth handler initialized")

    // Get current session
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession()

    if (error) {
      console.error("Error checking auth status:", error)
      return
    }

    // Current page
    const currentPath = window.location.pathname
    const currentPage = currentPath.split("/").pop() || "index.html"

    console.log("Current page:", currentPage)
    console.log("Session exists:", !!session)

    // Handle login/logout specific logic
    if (session) {
      // User is logged in
      console.log("User is logged in:", session.user.email)

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (!profileError && profile) {
        // Store user data in sessionStorage only
        sessionStorage.setItem("isLoggedIn", "true")
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: profile.name || "User",
            isAdmin: profile.is_admin || false,
          }),
        )

        if (profile.is_admin) {
          sessionStorage.setItem("isAdmin", "true")
        }
      } else {
        // Still store basic user data even if profile not found
        sessionStorage.setItem("isLoggedIn", "true")
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: "User",
            isAdmin: false,
          }),
        )
      }

      // If on login page, redirect to profile
      if (currentPage === "login.html" || currentPage === "register.html") {
        window.location.href = "profile.html"
      }
    } else {
      // User is not logged in
      console.log("User is not logged in")

      // Clear any stored session data
      sessionStorage.removeItem("isLoggedIn")
      sessionStorage.removeItem("currentUser")
      sessionStorage.removeItem("isAdmin")

      // Pages that require authentication
      const authRequiredPages = ["profile.html", "dashboard.html"]

      // If on a page that requires auth, redirect to login
      if (authRequiredPages.includes(currentPage)) {
        console.log("Redirecting to login page")
        window.location.href = "login.html"
        return
      }
    }

    // Update navigation based on login status
    updateNavigation(!!session)
  } catch (err) {
    console.error("Unexpected error in auth check:", err)
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'auth-error-message';
    errorMessage.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin: 10px 0; text-align: center;';
    errorMessage.innerHTML = '<p>There was a problem connecting to the authentication service. Please try refreshing the page.</p>';
    
    // Insert at the top of the body
    document.body.insertBefore(errorMessage, document.body.firstChild);
  }
})

// Update navigation based on auth status - Centralized function
function updateNavigation(isLoggedIn) {
  const navLinks = document.getElementById("nav-links")
  if (!navLinks) return

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}")
  const isAdmin = sessionStorage.getItem("isAdmin") === "true"

  // Find all links
  const links = navLinks.getElementsByTagName("a")
  let loginLink, registerLink, profileLink, logoutLink, adminLink

  // Find relevant links
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    const linkText = link.textContent.trim()
    if (linkText === "Login") loginLink = link
    if (linkText === "Register") registerLink = link
    if (linkText === "My Profile" || linkText === "Profile") profileLink = link
    if (linkText === "Logout") logoutLink = link
    if (linkText === "Admin") adminLink = link
  }

  if (isLoggedIn) {
    // User is logged in - show profile and logout
    if (loginLink) {
      loginLink.textContent = "My Profile"
      loginLink.href = "profile.html"
    }

    if (registerLink) {
      registerLink.textContent = "Logout"
      registerLink.href = "#"
      registerLink.id = "logout-btn"

      // Add logout functionality
      registerLink.addEventListener("click", async (e) => {
        e.preventDefault()
        try {
          await supabaseClient.auth.signOut()
          
          // Clear session data
          sessionStorage.removeItem("isLoggedIn")
          sessionStorage.removeItem("currentUser")
          sessionStorage.removeItem("isAdmin")

          window.location.href = "index.html"
        } catch (error) {
          console.error("Error during logout:", error)
          alert("Failed to log out. Please try again.")
        }
      })
    }

    // Add admin link if user is admin
    if (isAdmin && !adminLink) {
      const adminLi = document.createElement('li')
      adminLi.innerHTML = `<a href="admin.html">Admin</a>`
      navLinks.appendChild(adminLi)
    }
  } else {
    // User is logged out - show login and register
    if (profileLink) {
      profileLink.textContent = "Login"
      profileLink.href = "login.html"
    }

    if (logoutLink) {
      logoutLink.textContent = "Register"
      logoutLink.href = "register.html"
      logoutLink.id = ""
    }

    // Remove admin link if it exists
    if (adminLink) {
      adminLink.parentElement.remove()
    }
  }
}

// Handle login form submission
if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const errorElement = document.getElementById("login-error")
    const loginButton = document.querySelector('#login-form button[type="submit"]')

    try {
      // Disable button and show loading state
      if (loginButton) {
        loginButton.disabled = true
        loginButton.textContent = "Logging in..."
      }

      if (errorElement) errorElement.style.display = "none"

      // Check network connectivity first
      if (!navigator.onLine) {
        throw new Error("You appear to be offline. Please check your internet connection and try again.")
      }

      // Attempt login
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        throw error
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.warn("Could not fetch user profile:", profileError)
        // Continue anyway, as this is not critical
      }

      // Store user data in sessionStorage only
      sessionStorage.setItem("isLoggedIn", "true")

      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || "User",
        isAdmin: profile?.is_admin || false,
      }

      sessionStorage.setItem("currentUser", JSON.stringify(userData))

      if (profile?.is_admin) {
        sessionStorage.setItem("isAdmin", "true")
      }

      console.log("Login successful, redirecting to profile page")

      // Redirect to profile page after successful login
      window.location.href = "profile.html"
    } catch (err) {
      console.error("Login error:", err)
      
      let errorMessage = "An unexpected error occurred. Please try again."
      
      // Handle specific error cases
      if (err.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again."
      } else if (err.message.includes("offline")) {
        errorMessage = err.message
      } else if (err.status === 429) {
        errorMessage = "Too many login attempts. Please try again later."
      }
      
      if (errorElement) {
        errorElement.textContent = errorMessage
        errorElement.style.display = "block"
      } else {
        alert(errorMessage)
      }
    } finally {
      // Reset button state
      if (loginButton) {
        loginButton.disabled = false
        loginButton.textContent = "Login"
      }
    }
  })
}

// Add event listener for logout button
document.addEventListener("click", async (e) => {
  if (e.target && (e.target.id === "logout-btn" || e.target.id === "logout-link")) {
    e.preventDefault()
    try {
      await supabaseClient.auth.signOut()

      // Clear session data
      sessionStorage.removeItem("isLoggedIn")
      sessionStorage.removeItem("currentUser")
      sessionStorage.removeItem("isAdmin")

      console.log("User logged out successfully")
      window.location.href = "index.html"
    } catch (err) {
      console.error("Error during logout:", err)
      alert("Failed to log out. Please try again.")
    }
  }
})

// Export the updateNavigation function for use in other scripts
window.updateNavigation = updateNavigation
