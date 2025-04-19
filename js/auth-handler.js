// Initialize Supabase client
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Check if user is logged in on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Skip auth check on login and register pages
  const currentPage = window.location.pathname.split("/").pop()
  if (currentPage === "login.html" || currentPage === "register.html") {
    return
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error checking auth status:", error)
    return
  }

  // If not logged in and not on public pages, redirect to login
  if (!session) {
    const publicPages = ["index.html", "about.html", "contact.html", "faq.html"]
    if (!publicPages.includes(currentPage) && currentPage !== "") {
      window.location.href = "login.html"
    }
    return
  }

  // Update UI for logged in users
  updateNavForLoggedInUser(session)
})

// Handle login form submission
if (document.getElementById("login-form")) {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const errorElement = document.getElementById("login-error")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        errorElement.textContent = error.message
        errorElement.style.display = "block"
        return
      }

      // Redirect to home page after successful login
      window.location.href = "index.html"
    } catch (err) {
      errorElement.textContent = "An unexpected error occurred"
      errorElement.style.display = "block"
      console.error(err)
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

// Update navigation for logged in users
function updateNavForLoggedInUser(session) {
  const navLinks = document.getElementById("nav-links")
  if (!navLinks) return

  // Find login/register links and replace with profile/logout
  const loginLink = Array.from(navLinks.querySelectorAll("a")).find((a) => a.textContent === "Login")
  const registerLink = Array.from(navLinks.querySelectorAll("a")).find((a) => a.textContent === "Register")

  if (loginLink) {
    const li = loginLink.parentElement
    li.innerHTML = '<a href="profile.html">My Profile</a>'
  }

  if (registerLink) {
    const li = registerLink.parentElement
    li.innerHTML = '<a href="#" id="logout-link">Logout</a>'

    // Add logout functionality
    document.getElementById("logout-link").addEventListener("click", async (e) => {
      e.preventDefault()
      await supabase.auth.signOut()
      window.location.href = "index.html"
    })
  }
}
