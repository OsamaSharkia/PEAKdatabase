document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Supabase client
    const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
    const supabaseAnonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
    const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey)
  
    // Check if user is logged in
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
  
    if (sessionError || !session) {
      // Redirect to login page if not logged in
      window.location.href = "login.html"
      return
    }
  
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
  
    if (profileError) {
      console.error("Error fetching profile:", profileError)
      showNotification("Error loading profile data. Please try again later.", "error")
      return
    }
  
    // Populate profile data
    populateProfileData(profile, session)
  
    // Set up tab navigation
    setupTabs()
  
    // Set up form submissions
    setupForms(supabase, session, profile)
  
    // Set up account deletion
    setupAccountDeletion(supabase, session)
  
    // Load activity data
    loadActivityData(supabase, session.user.id)
  
    // Load saved resources
    loadSavedResources(supabase, session.user.id)
  })
  
  function populateProfileData(profile, session) {
    // Set profile name and initials for avatar
    const profileName = document.getElementById("profile-name")
    const profileEmail = document.getElementById("profile-email")
    const profileDate = document.getElementById("profile-date")
    const profileAvatar = document.getElementById("profile-avatar")
  
    const name = profile.name || "User"
    profileName.textContent = name
    profileEmail.textContent = session.user.email
  
    // Format date
    const createdAt = new Date(profile.created_at || session.user.created_at)
    profileDate.textContent = createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  
    // Set avatar initials
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    profileAvatar.textContent = initials
  
    // Populate form fields
    document.getElementById("name").value = profile.name || ""
    document.getElementById("email").value = session.user.email
    document.getElementById("phone").value = profile.phone || ""
  
    if (profile.language) {
      document.getElementById("language").value = profile.language
    }
  
    // Populate notification preferences if they exist
    if (profile.preferences) {
      try {
        const preferences = JSON.parse(profile.preferences)
        document.getElementById("notify-updates").checked = preferences.updates !== false
        document.getElementById("notify-resources").checked = preferences.resources !== false
        document.getElementById("notify-events").checked = preferences.events !== false
      } catch (e) {
        console.error("Error parsing preferences:", e)
      }
    }
  }
  
  function setupTabs() {
    const tabs = document.querySelectorAll(".profile-tab")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs and contents
        tabs.forEach((t) => t.classList.remove("active"))
        tabContents.forEach((c) => c.classList.remove("active"))
  
        // Add active class to clicked tab
        tab.classList.add("active")
  
        // Show corresponding content
        const tabId = tab.getAttribute("data-tab")
        document.getElementById(tabId).classList.add("active")
      })
    })
  }
  
  function setupForms(supabase, session, profile) {
    // Profile form submission
    const profileForm = document.getElementById("profile-form")
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const name = document.getElementById("name").value.trim()
      const phone = document.getElementById("phone").value.trim()
      const language = document.getElementById("language").value
  
      try {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            name,
            phone,
            language,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id)
  
        if (error) throw error
  
        // Update profile display
        document.getElementById("profile-name").textContent = name
  
        // Update avatar initials
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
        document.getElementById("profile-avatar").textContent = initials
  
        showNotification("Profile updated successfully", "success")
  
        // Update session storage
        const userData = JSON.parse(sessionStorage.getItem("currentUser") || "{}")
        userData.name = name
        sessionStorage.setItem("currentUser", JSON.stringify(userData))
      } catch (error) {
        console.error("Error updating profile:", error)
        showNotification("Failed to update profile. Please try again.", "error")
      }
    })
  
    // Preferences form submission
    const preferencesForm = document.getElementById("preferences-form")
    preferencesForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const preferences = {
        updates: document.getElementById("notify-updates").checked,
        resources: document.getElementById("notify-resources").checked,
        events: document.getElementById("notify-events").checked,
      }
  
      try {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            preferences: JSON.stringify(preferences),
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id)
  
        if (error) throw error
  
        showNotification("Preferences updated successfully", "success")
      } catch (error) {
        console.error("Error updating preferences:", error)
        showNotification("Failed to update preferences. Please try again.", "error")
      }
    })
  
    // Password form submission
    const passwordForm = document.getElementById("password-form")
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const currentPassword = document.getElementById("current-password").value
      const newPassword = document.getElementById("new-password").value
      const confirmPassword = document.getElementById("confirm-password").value
  
      // Validate passwords
      if (newPassword !== confirmPassword) {
        showNotification("New passwords do not match", "error")
        return
      }
  
      if (newPassword.length < 6) {
        showNotification("Password must be at least 6 characters", "error")
        return
      }
  
      try {
        // First verify the current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword,
        })
  
        if (signInError) {
          showNotification("Current password is incorrect", "error")
          return
        }
  
        // Update the password
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        })
  
        if (error) throw error
  
        // Clear the form
        passwordForm.reset()
  
        showNotification("Password updated successfully", "success")
      } catch (error) {
        console.error("Error updating password:", error)
        showNotification("Failed to update password. Please try again.", "error")
      }
    })
  
    // Logout all sessions button
    const logoutAllBtn = document.getElementById("logout-all-btn")
    logoutAllBtn.addEventListener("click", async () => {
      try {
        const { error } = await supabase.auth.signOut({ scope: "global" })
  
        if (error) throw error
  
        // Clear session storage
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("isAdmin")
  
        // Redirect to login page
        window.location.href = "login.html"
      } catch (error) {
        console.error("Error signing out:", error)
        showNotification("Failed to sign out. Please try again.", "error")
      }
    })
  }
  
  function setupAccountDeletion(supabase, session) {
    const deleteBtn = document.getElementById("delete-account-btn")
    const deleteModal = document.getElementById("delete-modal")
    const closeModal = document.getElementById("close-delete-modal")
    const cancelDelete = document.getElementById("cancel-delete")
    const confirmDelete = document.getElementById("confirm-delete")
    const deleteConfirmation = document.getElementById("delete-confirmation")
  
    // Open modal
    deleteBtn.addEventListener("click", () => {
      deleteModal.classList.add("active")
      deleteConfirmation.value = ""
      confirmDelete.disabled = true
    })
  
    // Close modal
    closeModal.addEventListener("click", () => {
      deleteModal.classList.remove("active")
    })
  
    cancelDelete.addEventListener("click", () => {
      deleteModal.classList.remove("active")
    })
  
    // Check confirmation text
    deleteConfirmation.addEventListener("input", () => {
      confirmDelete.disabled = deleteConfirmation.value.toLowerCase() !== "delete my account"
    })
  
    // Handle account deletion
    confirmDelete.addEventListener("click", async () => {
      try {
        // First delete user profile data to avoid the infinite recursion issue
        const { error: profileError } = await supabase.from("user_profiles").delete().eq("id", session.user.id)
  
        if (profileError) {
          console.error("Error deleting profile:", profileError)
          showNotification("Error deleting account. Please contact support.", "error")
          return
        }
  
        // Then delete the user authentication record
        const { error: authError } = await supabase.auth.admin.deleteUser(session.user.id)
  
        if (authError) {
          // If we can't delete the auth user, try the alternative approach
          const { error: signOutError } = await supabase.auth.signOut()
  
          if (signOutError) {
            throw signOutError
          }
  
          showNotification(
            "Your profile has been deleted. Please contact support to complete account deletion.",
            "success",
          )
          window.location.href = "index.html"
          return
        }
  
        // Clear session storage
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("isAdmin")
  
        // Redirect to home page
        window.location.href = "index.html"
      } catch (error) {
        console.error("Error deleting account:", error)
        showNotification("Failed to delete account. Please try again or contact support.", "error")
      } finally {
        deleteModal.classList.remove("active")
      }
    })
  }
  
  async function loadActivityData(supabase, userId) {
    try {
      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)
  
      if (error) throw error
  
      const activityList = document.getElementById("activity-list")
      const emptyState = document.getElementById("activity-empty")
  
      if (!data || data.length === 0) {
        activityList.style.display = "none"
        emptyState.style.display = "block"
        return
      }
  
      activityList.style.display = "block"
      emptyState.style.display = "none"
  
      // Clear existing items
      activityList.innerHTML = ""
  
      // Add activity items
      data.forEach((activity) => {
        const item = document.createElement("li")
        item.className = "activity-item"
  
        let iconClass = "fas fa-info-circle"
  
        // Set icon based on activity type
        switch (activity.type) {
          case "login":
            iconClass = "fas fa-sign-in-alt"
            break
          case "resource_view":
            iconClass = "fas fa-book"
            break
          case "profile_update":
            iconClass = "fas fa-user-edit"
            break
          case "password_change":
            iconClass = "fas fa-key"
            break
        }
  
        const date = new Date(activity.created_at)
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
  
        item.innerHTML = `
                  <div class="activity-icon">
                      <i class="${iconClass}"></i>
                  </div>
                  <div class="activity-content">
                      <h4>${activity.description || "Activity"}</h4>
                      <div class="activity-meta">${formattedDate}</div>
                  </div>
              `
  
        activityList.appendChild(item)
      })
    } catch (error) {
      console.error("Error loading activity:", error)
    }
  }
  
  async function loadSavedResources(supabase, userId) {
    try {
      const { data, error } = await supabase
        .from("saved_resources")
        .select("*, resources(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
  
      if (error) throw error
  
      const resourcesContainer = document.getElementById("resources-container")
      const emptyState = document.getElementById("resources-empty")
  
      if (!data || data.length === 0) {
        resourcesContainer.style.display = "none"
        emptyState.style.display = "block"
        return
      }
  
      resourcesContainer.style.display = "block"
      emptyState.style.display = "none"
  
      // Clear existing items
      resourcesContainer.innerHTML = ""
  
      // Create resource cards grid
      const resourceGrid = document.createElement("div")
      resourceGrid.className = "resource-cards"
      resourcesContainer.appendChild(resourceGrid)
  
      // Add resource cards
      data.forEach((item) => {
        const resource = item.resources
        if (!resource) return
  
        const card = document.createElement("div")
        card.className = "resource-card"
  
        card.innerHTML = `
                  <div class="resource-card-header">
                      <h3>${resource.title}</h3>
                      <span class="resource-tag">${resource.category || "Resource"}</span>
                  </div>
                  <div class="resource-card-body">
                      <p>${resource.description || "No description available."}</p>
                      <a href="resources.html#${resource.id}" class="btn-text">
                          View Resource <i class="fas fa-arrow-right"></i>
                      </a>
                  </div>
              `
  
        resourceGrid.appendChild(card)
      })
    } catch (error) {
      console.error("Error loading saved resources:", error)
    }
  }
  
  function showNotification(message, type = "success") {
    // Check if notification container exists, create if not
    let notificationContainer = document.getElementById("notification-container")
  
    if (!notificationContainer) {
      notificationContainer = document.createElement("div")
      notificationContainer.id = "notification-container"
      notificationContainer.style.position = "fixed"
      notificationContainer.style.top = "20px"
      notificationContainer.style.right = "20px"
      notificationContainer.style.zIndex = "9999"
      document.body.appendChild(notificationContainer)
    }
  
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.style.backgroundColor = type === "success" ? "#d4edda" : "#f8d7da"
    notification.style.color = type === "success" ? "#155724" : "#721c24"
    notification.style.padding = "15px 20px"
    notification.style.marginBottom = "10px"
    notification.style.borderRadius = "4px"
    notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"
    notification.style.transition = "all 0.3s ease"
    notification.style.opacity = "0"
    notification.style.transform = "translateY(-10px)"
  
    notification.textContent = message
  
    // Add to container
    notificationContainer.appendChild(notification)
  
    // Trigger animation
    setTimeout(() => {
      notification.style.opacity = "1"
      notification.style.transform = "translateY(0)"
    }, 10)
  
    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0"
      notification.style.transform = "translateY(-10px)"
  
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 5000)
  }
  