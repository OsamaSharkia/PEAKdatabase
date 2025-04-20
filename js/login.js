document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
  
    if (isLoggedIn) {
      // Redirect to home page if already logged in, not profile
      window.location.href = "index.html"
      return
    }
  
    // Show login form since user is not logged in
    const loginForm = document.getElementById("login-form")
    const resendConfirmation = document.getElementById("resend-confirmation")
    const resendBtn = document.getElementById("resend-btn")
    const emailInput = document.getElementById("email")
    const forgotPasswordLink = document.getElementById("forgot-password")
    const errorElement = document.getElementById("login-error")
  
    // Handle resend confirmation email
    if (resendBtn && emailInput) {
      resendBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim()
  
        if (!email) {
          if (errorElement) {
            errorElement.textContent = "Please enter your email address"
            errorElement.style.display = "block"
          }
          return
        }
  
        try {
          const { error } = await window.supabaseClient.auth.resend({
            type: "signup",
            email: email,
          })
  
          if (error) throw error
  
          alert("Confirmation email resent! Please check your inbox.")
        } catch (error) {
          console.error("Resend error:", error)
          if (errorElement) {
            errorElement.textContent = error.message || "Failed to resend confirmation email"
            errorElement.style.display = "block"
          }
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
  