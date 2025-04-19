// Initialize Supabase client
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Check if user is logged in on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error checking auth status:", error)
      return
    }

    // Current page
    const currentPath = window.location.pathname
    const currentPage = currentPath.split("/").pop() || "index.html"

    // Update navigation based on login status
    updateNavigation(session)

    // Handle login/logout specific logic
    if (session) {
      // User is logged in
      console.log("User is logged in:", session.user.email)

      // If on login page, redirect to home
      if (currentPage === "login.html" || currentPage === "register.html") {
        window.location.href = "index.html"
      }
    } else {
      // User is not logged in
      console.log("User is not logged in")

      // Pages that require authentication
      const authRequiredPages = ["profile.html", "dashboard.html"]

      // If on a page that requires auth, redirect to login
      if (authRequiredPages.includes(currentPage)) {
        window.location.href = "login.html"
      }
    }
  } catch (err) {
    console.error("Unexpected error in auth check:", err)
  }
})

// Update navigation based on auth status
function updateNavigation(session) {
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

  if (session) {
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
        await supabase.auth.signOut()
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
      const { data, error } = await supabase.auth.signInWithPassword({
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

      console.log("Login successful, redirecting to home page")
      // Store login state in localStorage as a backup
      localStorage.setItem("isLoggedIn", "true")

      // Redirect to home page after successful login
      window.location.href = "index.html"
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

// Handle registration form submission
if (document.getElementById("register-form")) {
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value
    const errorElement = document.getElementById("register-error")

    // Validate passwords match
    if (password !== confirmPassword) {
      errorElement.textContent = "Passwords do not match"
      errorElement.style.display = "block"
      return
    }

    try {
      // Register user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        errorElement.textContent = error.message
        errorElement.style.display = "block"
        return
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from("user_profiles").insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            created_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }
      }

      // Show success message and redirect
      alert("Registration successful! Please check your email to confirm your account.")
      window.location.href = "index.html"
    } catch (err) {
      errorElement.textContent = "An unexpected error occurred"
      errorElement.style.display = "block"
      console.error(err)
    }
  })
}

// Add event listener for logout button
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "logout-btn") {
    e.preventDefault()
    try {
      await supabase.auth.signOut()
      localStorage.removeItem("isLoggedIn")
      window.location.href = "index.html"
    } catch (err) {
      console.error("Error during logout:", err)
      alert("Failed to log out. Please try again.")
    }
  }
})
