// nav-handler.js - Centralized navigation and authentication state management

document.addEventListener("DOMContentLoaded", () => {
    console.log("Nav handler initialized")
  
    // Initialize Supabase client if available
    const supabaseClient = window.supabaseClient
  
    // Check authentication status
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null")
    const isAdmin = sessionStorage.getItem("isAdmin") === "true"
  
    console.log("Auth status:", { isLoggedIn, isAdmin })
  
    // Current page
    const currentPath = window.location.pathname
    const currentPage = currentPath.split("/").pop() || "index.html"
  
    // Pages that require authentication
    const authRequiredPages = ["profile.html", "dashboard.html"]
  
    // Check if current page requires authentication
    if (authRequiredPages.includes(currentPage) && !isLoggedIn) {
      // Store the page they were trying to access for redirect after login
      sessionStorage.setItem("redirectAfterLogin", currentPage)
      // Redirect to login page
      window.location.href = "login.html"
      return
    }
  
    // Update navigation based on authentication status
    updateNavigation(isLoggedIn, isAdmin, currentUser, currentPage)
  
    // Handle logout clicks
    document.addEventListener("click", (e) => {
      if (e.target && (e.target.id === "logout-btn" || e.target.id === "logout-link")) {
        e.preventDefault()
        logout()
      }
    })
  
    // Function to update navigation
    function updateNavigation(isLoggedIn, isAdmin, currentUser, currentPage) {
      // Get all navigation containers across different pages
      const navContainers = document.querySelectorAll("#nav-links, .nav-links, nav ul")
  
      if (navContainers.length === 0) {
        console.warn("No navigation containers found")
        return
      }
  
      navContainers.forEach((navContainer) => {
        // Clear existing navigation to rebuild it consistently
        navContainer.innerHTML = ""
  
        // Add standard navigation items that appear on all pages
        const standardLinks = [
          { href: "index.html", text: "Home" },
          { href: "pathways.html", text: "Education Pathways" },
          { href: "resources.html", text: "Resources" },
          { href: "faq.html", text: "FAQ" },
          { href: "contact.html", text: "Contact" },
          { href: "about.html", text: "About Us" },
        ]
  
        // Add standard links
        standardLinks.forEach((link) => {
          const li = document.createElement("li")
          const a = document.createElement("a")
          a.href = link.href
          a.textContent = link.text
  
          // Mark current page as active
          if (currentPage === link.href) {
            a.classList.add("active")
          }
  
          li.appendChild(a)
          navContainer.appendChild(li)
        })
  
        // Add authentication links based on login status
        if (isLoggedIn) {
          // User is logged in - show logout
          const logoutLi = document.createElement("li")
          const logoutLink = document.createElement("a")
          logoutLink.href = "#"
          logoutLink.id = "logout-link"
          logoutLink.textContent = "Logout"
          logoutLi.appendChild(logoutLink)
          navContainer.appendChild(logoutLi)
  
          // Add admin link if user is admin
          if (isAdmin) {
            const adminLi = document.createElement("li")
            const adminLink = document.createElement("a")
            adminLink.href = "admin.html"
            adminLink.textContent = "Admin"
            if (currentPage === "admin.html") {
              adminLink.classList.add("active")
            }
            adminLi.appendChild(adminLink)
            navContainer.appendChild(adminLi)
          }
        } else {
          // User is not logged in - show login and register
          const loginLi = document.createElement("li")
          const loginLink = document.createElement("a")
          loginLink.href = "login.html"
          loginLink.textContent = "Login"
          if (currentPage === "login.html") {
            loginLink.classList.add("active")
          }
          loginLi.appendChild(loginLink)
          navContainer.appendChild(loginLi)
  
          const registerLi = document.createElement("li")
          const registerLink = document.createElement("a")
          registerLink.href = "register.html"
          registerLink.textContent = "Register"
          if (currentPage === "register.html") {
            registerLink.classList.add("active")
          }
          registerLi.appendChild(registerLink)
          navContainer.appendChild(registerLi)
        }
      })
    }
  
    // Function to handle logout
    async function logout() {
      try {
        // Sign out from Supabase if available
        if (supabaseClient) {
          await supabaseClient.auth.signOut()
        }
  
        // Clear session data
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("isAdmin")
        sessionStorage.removeItem("redirectAfterLogin")
  
        console.log("User logged out successfully")
        window.location.href = "index.html"
      } catch (error) {
        console.error("Error during logout:", error)
        alert("Failed to log out. Please try again.")
      }
    }
  })
  