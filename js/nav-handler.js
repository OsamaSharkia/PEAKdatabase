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
        // Find existing auth-related links
        const existingLinks = navContainer.querySelectorAll("li a")
        let loginLink, registerLink, profileLink, logoutLink, adminLink
        let authLinksContainer = null
  
        // Find auth-related links and their container
        existingLinks.forEach(link => {
          const text = link.textContent.trim()
          if (text === "Login") {
            loginLink = link
            authLinksContainer = link.parentElement.parentElement
          }
          if (text === "Register") registerLink = link
          if (text === "My Profile" || text === "Profile") profileLink = link
          if (text === "Logout") logoutLink = link
          if (text === "Admin") adminLink = link
        })
  
        // Standard links to ensure they exist
        const standardLinks = [
          { href: "index.html", text: "Home" },
          { href: "pathways.html", text: "Education Pathways" },
          { href: "resources.html", text: "Resources" },
          { href: "faq.html", text: "FAQ" },
          { href: "contact.html", text: "Contact" },
          { href: "about.html", text: "About Us" },
        ]
  
        // Add any missing standard links
        standardLinks.forEach(linkData => {
          let linkExists = false
          existingLinks.forEach(link => {
            if (link.textContent.trim() === linkData.text || 
                link.href.endsWith(linkData.href)) {
              linkExists = true
              // Mark current page as active
              if (currentPage === linkData.href) {
                link.classList.add("active")
              } else {
                link.classList.remove("active")
              }
            }
          })
  
          if (!linkExists) {
            const li = document.createElement("li")
            const a = document.createElement("a")
            a.href = linkData.href
            a.textContent = linkData.text
            if (currentPage === linkData.href) {
              a.classList.add("active")
            }
            li.appendChild(a)
            navContainer.appendChild(li)
          }
        })
  
        // Update auth links based on login status
        if (isLoggedIn) {
          // User is logged in
          if (loginLink) {
            loginLink.textContent = "My Profile"
            loginLink.href = "profile.html"
            if (currentPage === "profile.html") {
              loginLink.classList.add("active")
            } else {
              loginLink.classList.remove("active")
            }
          }
  
          if (registerLink) {
            registerLink.textContent = "Logout"
            registerLink.href = "#"
            registerLink.id = "logout-link"
            registerLink.classList.remove("active")
          }
  
          // Add admin link if user is admin and it doesn't exist
          if (isAdmin && !adminLink && authLinksContainer) {
            const adminLi = document.createElement("li")
            const adminA = document.createElement("a")
            adminA.href = "admin.html"
            adminA.textContent = "Admin"
            if (currentPage === "admin.html") {
              adminA.classList.add("active")
            }
            adminLi.appendChild(adminA)
            authLinksContainer.appendChild(adminLi)
          } else if (adminLink && !isAdmin) {
            // Remove admin link if it exists but user is not admin
            adminLink.parentElement.remove()
          } else if (adminLink && isAdmin) {
            // Update active state
            if (currentPage === "admin.html") {
              adminLink.classList.add("active")
            } else {
              adminLink.classList.remove("active")
            }
          }
        } else {
          // User is not logged in
          if (profileLink) {
            profileLink.textContent = "Login"
            profileLink.href = "login.html"
            if (currentPage === "login.html") {
              profileLink.classList.add("active")
            } else {
              profileLink.classList.remove("active")
            }
          }
  
          if (logoutLink) {
            logoutLink.textContent = "Register"
            logoutLink.href = "register.html"
            logoutLink.id = ""
            if (currentPage === "register.html") {
              logoutLink.classList.add("active")
            } else {
              logoutLink.classList.remove("active")
            }
          }
  
          // Remove admin link if it exists
          if (adminLink) {
            adminLink.parentElement.remove()
          }
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