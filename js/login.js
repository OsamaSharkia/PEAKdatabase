document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    if (window.authService.isLoggedIn()) {
      // Redirect to home page if already logged in
      window.location.href = "index.html";
      return;
    }
    
    // Handle login form submission
    const loginForm = document.getElementById("login-form");
    const resendBtn = document.getElementById("resend-btn");
    const emailInput = document.getElementById("email");
    const forgotPasswordLink = document.getElementById("forgot-password");
    const errorElement = document.getElementById("login-error");
    
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const loginButton = document.querySelector('#login-form button[type="submit"]');
        
        try {
          // Disable button and show loading state
          if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
          }
          
          if (errorElement) errorElement.style.display = "none";
          
          // Check network connectivity
          if (!navigator.onLine) {
            throw new Error("You appear to be offline. Please check your internet connection and try again.");
          }
          
          // Attempt login
          const result = await window.authService.login(email, password);
          
          if (!result.success) throw result.error;
          
          console.log("Login successful, redirecting to profile page");
          
          // Check if there's a redirect after login
          const redirectPage = sessionStorage.getItem("redirectAfterLogin");
          if (redirectPage) {
            sessionStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectPage;
          } else {
            window.location.href = "profile.html";
          }
        } catch (err) {
          console.error("Login error:", err);
          
          let errorMessage = "An unexpected error occurred. Please try again.";
          
          // Handle specific error cases
          if (err.message.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          } else if (err.message.includes("offline")) {
            errorMessage = err.message;
          } else if (err.status === 429) {
            errorMessage = "Too many login attempts. Please try again later.";
          }
          
          if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = "block";
          } else {
            alert(errorMessage);
          }
        } finally {
          // Reset button state
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
          }
        }
      });
    }
    
    // Handle resend confirmation email
    if (resendBtn && emailInput) {
      resendBtn.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        
        if (!email) {
          if (errorElement) {
            errorElement.textContent = "Please enter your email address";
            errorElement.style.display = "block";
          }
          return;
        }
        
        try {
          const { error } = await window.supabaseClient.auth.resend({
            type: "signup",
            email: email,
          });
          
          if (error) throw error;
          
          alert("Confirmation email resent! Please check your inbox.");
        } catch (error) {
          console.error("Resend error:", error);
          if (errorElement) {
            errorElement.textContent = error.message || "Failed to resend confirmation email";
            errorElement.style.display = "block";
          }
        }
      });
    }
    
    // Handle forgot password
    if (forgotPasswordLink && emailInput) {
      forgotPasswordLink.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
          if (errorElement) {
            errorElement.textContent = "Please enter your email address";
            errorElement.style.display = "block";
          }
          return;
        }
        
        try {
          const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/reset-password.html",
          });
          
          if (error) throw error;
          
          alert("Password reset email sent! Please check your inbox.");
        } catch (error) {
          console.error("Password reset error:", error);
          if (errorElement) {
            errorElement.textContent = error.message || "Failed to send password reset email";
            errorElement.style.display = "block";
          }
        }
      });
    }
  });