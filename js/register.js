document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    if (window.authService.isLoggedIn()) {
      // Redirect to home page if already logged in
      window.location.href = "index.html";
      return;
    }
    
    // Handle registration form submission
    const registerForm = document.getElementById("register-form");
    const alreadyLoggedIn = document.getElementById("already-logged-in");
    
    // Hide already logged in message since we've already checked
    if (alreadyLoggedIn) {
      alreadyLoggedIn.style.display = "none";
    }
    
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const errorElement = document.getElementById("register-error");
        
        // Validate passwords match
        if (password !== confirmPassword) {
          if (errorElement) {
            errorElement.textContent = "Passwords do not match";
            errorElement.style.display = "block";
          }
          return;
        }
        
        try {
          // Register with auth service
          const result = await window.authService.register(email, password, name);
          
          if (!result.success) throw result.error;
          
          // Show success message
          alert("Registration successful! Please check your email to confirm your account.");
          window.location.href = "login.html";
        } catch (error) {
          console.error("Registration error:", error);
          if (errorElement) {
            errorElement.textContent = error.message || "Registration failed. Please try again.";
            errorElement.style.display = "block";
          }
        }
      });
    }
  });