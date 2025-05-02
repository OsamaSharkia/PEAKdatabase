import { createClient } from "@supabase/supabase-js"

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  if (window.authService && window.authService.isLoggedIn()) {
    // Redirect to home page if already logged in
    window.location.href = "index.html"
    return
  }

  // Initialize Supabase client if not already available
  const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
  if (!window.supabaseClient) {
    window.supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  // Handle login form submission
  const loginForm = document.getElementById("login-form")
  const resendBtn = document.getElementById("resend-btn")
  const emailInput = document.getElementById("email")
  const forgotPasswordLink = document.getElementById("forgot-password")
  const errorElement = document.getElementById("login-error")
  const resendConfirmation = document.getElementById("resend-confirmation")

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value
      const loginButton = document.querySelector('#login-form button[type="submit"]')

      try {
        // Disable button and show loading state
        if (loginButton) {
          loginButton.disabled = true
          loginButton.textContent = "Logging in..."
        }

        if (errorElement) errorElement.style.display = "none"
        if (resendConfirmation) resendConfirmation.style.display = "none"

        // Check network connectivity
        if (!navigator.onLine) {
          throw new Error("You appear to be offline. Please check your internet connection and try again.")
        }

        // Direct login with Supabase to get the exact error message
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("Login error:", error)

          // Check if the error is related to email verification
          if (
            error.message &&
            (error.message.toLowerCase().includes("email not confirmed") ||
              error.message.toLowerCase().includes("not verified") ||
              error.message.toLowerCase().includes("email verification") ||
              error.message.toLowerCase().includes("not confirmed") ||
              error.message.toLowerCase().includes("user is not confirmed"))
          ) {
            // Show specific message for unverified accounts
            if (errorElement) {
              errorElement.innerHTML = `
                <strong>Your account email is not verified.</strong><br>
                Please check your inbox and click the verification link to activate your account.
              `
              errorElement.style.display = "block"
            }

            // Show resend confirmation section
            if (resendConfirmation) {
              resendConfirmation.style.display = "block"
            }
          } else if (error.message && error.message.includes("Invalid login credentials")) {
            if (errorElement) {
              errorElement.textContent = "Invalid email or password. Please check your credentials and try again."
              errorElement.style.display = "block"
            }
          } else {
            if (errorElement) {
              errorElement.textContent = error.message || "An unexpected error occurred. Please try again."
              errorElement.style.display = "block"
            }
          }
          return
        }

        // If login successful
        console.log("Login successful, redirecting to profile page")

        // Store user session
        sessionStorage.setItem("isLoggedIn", "true")
        if (data && data.user) {
          sessionStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || "User",
            }),
          )
        }

        // Check if there's a redirect after login
        const redirectPage = sessionStorage.getItem("redirectAfterLogin")
        if (redirectPage) {
          sessionStorage.removeItem("redirectAfterLogin")
          window.location.href = redirectPage
        } else {
          window.location.href = "profile.html"
        }
      } catch (err) {
        console.error("Login error:", err)

        let errorMessage = "An unexpected error occurred. Please try again."

        // Handle specific error cases
        if (err.message && err.message.includes("offline")) {
          errorMessage = err.message
        } else if (err.status === 429) {
          errorMessage = "Too many login attempts. Please try again later."
        }

        if (errorElement) {
          errorElement.textContent = errorMessage
          errorElement.style.display = "block"
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

  // Handle resend confirmation email
  if (resendBtn && emailInput) {
    resendBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim()
      const resendButton = resendBtn

      if (!email) {
        if (errorElement) {
          errorElement.textContent = "Please enter your email address"
          errorElement.style.display = "block"
        }
        return
      }

      try {
        // Show loading state
        resendButton.disabled = true
        resendButton.textContent = "Sending..."

        const { error } = await window.supabaseClient.auth.resend({
          type: "signup",
          email: email,
        })

        if (error) throw error

        alert("Verification email resent! Please check your inbox and spam folder.")
      } catch (error) {
        console.error("Resend error:", error)
        if (errorElement) {
          errorElement.textContent = error.message || "Failed to resend verification email"
          errorElement.style.display = "block"
        }
      } finally {
        // Reset button state
        resendButton.disabled = false
        resendButton.textContent = "Resend Verification Email"
      }
    })
  }

  // Handle forgot password
  if (forgotPasswordLink && emailInput) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault()

      const email = emailInput.value.trim()

      if (!email) {
        if (errorElement) {
          errorElement.textContent = "Please enter your email address"
          errorElement.style.display = "block"
        }
        return
      }

      try {
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password.html",
        })

        if (error) throw error

        alert("Password reset email sent! Please check your inbox.")
      } catch (error) {
        console.error("Password reset error:", error)
        if (errorElement) {
          errorElement.textContent = error.message || "Failed to send password reset email"
          errorElement.style.display = "block"
        }
      }
    })
  }
})
