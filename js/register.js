document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
  
    if (isLoggedIn) {
      // Redirect to home page if already logged in, not profile
      window.location.href = "index.html"
      return
    }
  
    // Handle registration form submission
    const registerForm = document.getElementById("register-form")
    const alreadyLoggedIn = document.getElementById("already-logged-in")
    const logoutLink = document.getElementById("logout-link")
  
    // Hide already logged in message since we've already checked
    if (alreadyLoggedIn) {
      alreadyLoggedIn.style.display = "none"
    }
  
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()
  
        const name = document.getElementById("name").value.trim()
        const email = document.getElementById("email").value.trim()
        const password = document.getElementById("password").value
        const confirmPassword = document.getElementById("confirm-password").value
        const errorElement = document.getElementById("register-error")
  
        // Validate passwords match
        if (password !== confirmPassword) {
          if (errorElement) {
            errorElement.textContent = "Passwords do not match"
            errorElement.style.display = "block"
          }
          return
        }
  
        try {
          // Sign up with Supabase
          const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          })
  
          if (error) throw error
  
          // Show success message
          alert("Registration successful! Please check your email to confirm your account.")
          window.location.href = "login.html"
        } catch (error) {
          console.error("Registration error:", error)
          if (errorElement) {
            errorElement.textContent = error.message || "Registration failed. Please try again."
            errorElement.style.display = "block"
          }
        }
      })
    }
  
    // Add logout functionality to the logout link if it exists
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Get Supabase client if available
        const supabaseClient = window.supabaseClient
        if (supabaseClient) {
          // Sign out from Supabase
          supabaseClient.auth.signOut().then(() => {
            // Clear session storage
            sessionStorage.removeItem("isLoggedIn")
            sessionStorage.removeItem("currentUser")
            sessionStorage.removeItem("isAdmin")
  
            // Reload the page
            window.location.reload()
          })
        } else {
          // If Supabase client is not available, just clear session and reload
          sessionStorage.removeItem("isLoggedIn")
          sessionStorage.removeItem("currentUser")
          sessionStorage.removeItem("isAdmin")
          window.location.reload()
        }
      })
    }
  })
  