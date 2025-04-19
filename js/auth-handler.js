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
        // Store user data in sessionStorage
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
  }
})

// Update navigation based on auth status
function updateNavigation(isLoggedIn) {
  const navLinks = document.getElementById("nav-links")
  if (!navLinks) return

  // Find all links
  const links = navLinks.getElementsByTagName("a")
  let loginLink, registerLink, profileLink, logoutLink

  // Find relevant links
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (link.textContent.trim() === "Login") loginLink = link
    if (link.textContent.trim() === "Register") registerLink = link
    if (link.textContent.trim() === "My Profile") profileLink = link
    if (link.textContent.trim() === "Logout") logoutLink = link
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
        await supabaseClient.auth.signOut()

        // Clear session data
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("isAdmin")
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("currentUser")
        localStorage.removeItem("isAdmin")

        window.location.href = "index.html"
      })
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

      // Attempt login
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        if (errorElement) {
          errorElement.textContent = error.message || "Login failed. Please check your credentials."
          errorElement.style.display = "block"
        } else {
          alert("Login failed: " + (error.message || "Please check your credentials."))
        }
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      // Store user data
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
      console.error("Unexpected error during login:", err)
      if (errorElement) {
        errorElement.textContent = "An unexpected error occurred. Please try again."
        errorElement.style.display = "block"
      } else {
        alert("An unexpected error occurred. Please try again.")
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
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isAdmin")

      console.log("User logged out successfully")
      window.location.href = "index.html"
    } catch (err) {
      console.error("Error during logout:", err)
      alert("Failed to log out. Please try again.")
    }
  }
})
