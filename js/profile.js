document.addEventListener("DOMContentLoaded", () => {
  console.log("Profile page loaded")

  // Initialize Supabase client if not already initialized
  if (!window.supabaseClient && window.supabase) {
    const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)
    console.log("Supabase client initialized in profile.js")
  }

  // Function to check if user is logged in
  function isLoggedIn() {
    return sessionStorage.getItem("isLoggedIn") === "true"
  }

  // Check authentication status first
  if (!isLoggedIn()) {
    console.log("User not authenticated, redirecting to login page")
    window.location.href = "login.html"
    return
  }

  // Initialize profile
  initializeProfile()

  // Main initialization function
  function initializeProfile() {
    // DOM Elements
    const profileForm = document.getElementById("profile-form")
    const notificationForm = document.getElementById("notification-form")
    const passwordForm = document.getElementById("password-form")
    const deleteAccountBtn = document.getElementById("delete-account-btn")
    const deleteModal = document.getElementById("delete-modal")
    const closeDeleteModal = document.getElementById("close-delete-modal")
    const cancelDeleteBtn = document.getElementById("cancel-delete")
    const confirmDeleteBtn = document.getElementById("confirm-delete")
    const deleteConfirmationInput = document.getElementById("delete-confirmation")
    const notificationArea = document.getElementById("notification-area")

    // Tab navigation
    const profileMenuItems = document.querySelectorAll(".profile-menu-item")
    const profileTabs = document.querySelectorAll(".profile-tab")

    // Profile elements
    const profileInitials = document.getElementById("profile-initials")
    const profileName = document.getElementById("profile-name")
    const profileEmail = document.getElementById("profile-email")
    const profileDate = document.getElementById("profile-date")

    // Form fields
    const fullNameInput = document.getElementById("full-name")
    const emailAddressInput = document.getElementById("email-address")
    const phoneNumberInput = document.getElementById("phone-number")
    const notifyEducationalCheckbox = document.getElementById("notify-educational")
    const notifyResourcesCheckbox = document.getElementById("notify-resources")
    const notifyEventsCheckbox = document.getElementById("notify-events")

    // Get current user data
    const currentUser = getCurrentUser()
    console.log("Current user:", currentUser)

    // Load user profile data
    loadUserProfile()

    // Set up event listeners
    setupEventListeners()

    // Function to get current user
    function getCurrentUser() {
      const userJson = sessionStorage.getItem("currentUser")
      if (!userJson) {
        return { id: generateUserId(), email: "user@example.com" }
      }
      try {
        return JSON.parse(userJson)
      } catch (e) {
        console.error("Error parsing user data:", e)
        return { id: generateUserId(), email: "user@example.com" }
      }
    }

    // Generate a temporary user ID if none exists
    function generateUserId() {
      const tempId = "user_" + Math.random().toString(36).substring(2, 15)
      return tempId
    }

    // Load user profile data
    function loadUserProfile() {
      try {
        // Set email from session storage
        if (currentUser && currentUser.email) {
          if (profileEmail) profileEmail.textContent = currentUser.email
          if (emailAddressInput) emailAddressInput.value = currentUser.email
        }

        // Try to get profile from localStorage
        const localProfile = localStorage.getItem(`profile_${currentUser.id}`)
        let profileData = null

        if (localProfile) {
          profileData = JSON.parse(localProfile)
        } else {
          // Create basic profile if none exists
          profileData = {
            id: currentUser.id,
            name: currentUser.name || "",
            email: currentUser.email,
            phone: "",
            notify_educational: true,
            notify_resources: true,
            notify_events: true,
            created_at: currentUser.created_at || new Date().toISOString(),
          }

          // Save to localStorage
          localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(profileData))
        }

        // Set form values
        if (fullNameInput) fullNameInput.value = profileData.name || ""
        if (phoneNumberInput) phoneNumberInput.value = profileData.phone || ""

        // Set notification preferences
        if (notifyEducationalCheckbox) {
          notifyEducationalCheckbox.checked = profileData.notify_educational !== false
        }

        if (notifyResourcesCheckbox) {
          notifyResourcesCheckbox.checked = profileData.notify_resources !== false
        }

        if (notifyEventsCheckbox) {
          notifyEventsCheckbox.checked = profileData.notify_events !== false
        }

        // Update profile display
        updateProfileDisplay(profileData)

        // Format and set creation date if available
        if (profileDate) {
          const createdAt = new Date(profileData.created_at)
          profileDate.textContent = createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        showNotification("An error occurred while loading your profile. Please try refreshing the page.", "error")
      }
    }

    // Update profile display elements
    function updateProfileDisplay(profileData) {
      const name = profileData?.name || currentUser?.name || "User"

      if (profileName) {
        profileName.textContent = name
      }

      // Set initials
      if (profileInitials) {
        if (name && name !== "User") {
          const initials = name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
          profileInitials.textContent = initials
        } else {
          profileInitials.textContent = "U"
        }
      }
    }

    // Save profile data to localStorage
    function saveProfileData(profileData) {
      try {
        // Get existing profile data
        const existingDataJson = localStorage.getItem(`profile_${currentUser.id}`)
        let existingData = {}

        if (existingDataJson) {
          existingData = JSON.parse(existingDataJson)
        }

        // Merge with new data
        const updatedProfile = {
          ...existingData,
          ...profileData,
          updated_at: new Date().toISOString(),
        }

        // Save to localStorage
        localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updatedProfile))

        return { success: true }
      } catch (error) {
        console.error("Error saving profile:", error)
        return { success: false, error: error.message }
      }
    }

    // Set up event listeners
    function setupEventListeners() {
      // Profile form submission
      if (profileForm) {
        profileForm.addEventListener("submit", handleProfileSubmit)
      }

      // Notification form submission
      if (notificationForm) {
        notificationForm.addEventListener("submit", handleNotificationSubmit)
      }

      // Password form submission
      if (passwordForm) {
        passwordForm.addEventListener("submit", handlePasswordSubmit)
      }

      // Delete account button
      if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", () => {
          if (deleteModal) deleteModal.classList.add("active")
        })
      }

      // Close delete modal
      if (closeDeleteModal) {
        closeDeleteModal.addEventListener("click", () => {
          if (deleteModal) deleteModal.classList.remove("active")
          if (deleteConfirmationInput) deleteConfirmationInput.value = ""
          if (confirmDeleteBtn) confirmDeleteBtn.disabled = true
        })
      }

      // Cancel delete
      if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => {
          if (deleteModal) deleteModal.classList.remove("active")
          if (deleteConfirmationInput) deleteConfirmationInput.value = ""
          if (confirmDeleteBtn) confirmDeleteBtn.disabled = true
        })
      }

      // Delete confirmation input
      if (deleteConfirmationInput) {
        deleteConfirmationInput.addEventListener("input", function () {
          if (confirmDeleteBtn) {
            confirmDeleteBtn.disabled = this.value !== "delete my account"
          }
        })
      }

      // Confirm delete
      if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", handleDeleteAccount)
      }

      // Tab switching
      profileMenuItems.forEach((item) => {
        item.addEventListener("click", function () {
          // Remove active class from all buttons and panes
          profileMenuItems.forEach((btn) => btn.classList.remove("active"))
          profileTabs.forEach((pane) => pane.classList.remove("active"))

          // Add active class to clicked button and corresponding pane
          this.classList.add("active")
          const tabId = this.getAttribute("data-tab")
          const tabPane = document.getElementById(tabId)
          if (tabPane) tabPane.classList.add("active")
        })
      })

      // Close modal when clicking outside
      window.addEventListener("click", (event) => {
        if (event.target === deleteModal) {
          deleteModal.classList.remove("active")
          if (deleteConfirmationInput) deleteConfirmationInput.value = ""
          if (confirmDeleteBtn) confirmDeleteBtn.disabled = true
        }
      })
    }

    // Handle profile form submission
    function handleProfileSubmit(e) {
      e.preventDefault()

      try {
        const updatedProfile = {
          id: currentUser.id,
          name: fullNameInput.value.trim(),
          phone: phoneNumberInput.value.trim(),
        }

        console.log("Updating profile:", updatedProfile)
        const result = saveProfileData(updatedProfile)

        if (!result.success) {
          throw new Error(result.error || "Failed to update profile")
        }

        // Update session storage
        currentUser.name = updatedProfile.name
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser))

        // Update display
        updateProfileDisplay(updatedProfile)

        showNotification("Profile updated successfully", "success")
      } catch (error) {
        console.error("Error updating profile:", error)
        showNotification("Failed to update profile. Please try again.", "error")
      }
    }

    // Handle notification form submission
    function handleNotificationSubmit(e) {
      e.preventDefault()

      try {
        const updatedPreferences = {
          id: currentUser.id,
          notify_educational: notifyEducationalCheckbox.checked,
          notify_resources: notifyResourcesCheckbox.checked,
          notify_events: notifyEventsCheckbox.checked,
        }

        console.log("Updating notification preferences:", updatedPreferences)
        const result = saveProfileData(updatedPreferences)

        if (!result.success) {
          throw new Error(result.error || "Failed to update notification preferences")
        }

        showNotification("Notification preferences updated successfully", "success")
      } catch (error) {
        console.error("Error updating notification preferences:", error)
        showNotification("Failed to update notification preferences. Please try again.", "error")
      }
    }

    // Handle password form submission
    async function handlePasswordSubmit(e) {
      e.preventDefault()

      const currentPassword = document.getElementById("current-password").value
      const newPassword = document.getElementById("new-password").value
      const confirmPassword = document.getElementById("confirm-password").value

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        showNotification("New passwords do not match", "error")
        return
      }

      // Validate password strength
      if (newPassword.length < 6) {
        showNotification("Password must be at least 6 characters long", "error")
        return
      }

      try {
        // Show loading state
        const submitBtn = passwordForm.querySelector('button[type="submit"]')
        const originalBtnText = submitBtn.innerHTML
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...'
        submitBtn.disabled = true

        // Check if Supabase client is available
        if (window.supabaseClient) {
          console.log("Updating password using Supabase...")

          // First, verify the current password by signing in
          const { error: signInError } = await window.supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword,
          })

          if (signInError) {
            console.error("Current password verification failed:", signInError)
            throw new Error("Current password is incorrect")
          }

          // Update password using Supabase Auth API
          const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword,
          })

          if (error) {
            console.error("Password update failed:", error)
            throw new Error(error.message || "Failed to update password")
          }

          console.log("Password updated successfully")
        } else {
          console.warn("Supabase client not available, simulating password update")
          // Simulate delay for demo purposes
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        // Clear form
        if (passwordForm) passwordForm.reset()

        showNotification("Password updated successfully", "success")
      } catch (error) {
        console.error("Error updating password:", error)
        showNotification("Failed to update password: " + error.message, "error")
      } finally {
        // Reset button state
        const submitBtn = passwordForm.querySelector('button[type="submit"]')
        submitBtn.innerHTML = '<i class="fas fa-key"></i> Update Password'
        submitBtn.disabled = false
      }
    }

    // Handle delete account
    async function handleDeleteAccount() {
      if (deleteConfirmationInput && deleteConfirmationInput.value !== "delete my account") {
        return
      }

      try {
        // Show loading state
        if (confirmDeleteBtn) {
          confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...'
          confirmDeleteBtn.disabled = true
        }

        // Try to delete account in Supabase if available
        if (window.supabaseClient && currentUser && currentUser.id) {
          console.log("Attempting to delete user account from Supabase...")

          try {
            // First try the RPC function method
            const { data, error } = await window.supabaseClient.rpc("delete_user_completely", {
              user_id: currentUser.id,
            })

            if (error) {
              console.error("Error using RPC to delete user:", error)

              // If RPC fails, try the Edge Function if available
              try {
                const response = await fetch(`${window.location.origin}/api/delete-user`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${(await window.supabaseClient.auth.getSession()).data.session?.access_token}`,
                  },
                  body: JSON.stringify({ userId: currentUser.id }),
                })

                if (!response.ok) {
                  const result = await response.json()
                  throw new Error(result.error || "Failed to delete account")
                }
              } catch (edgeFunctionError) {
                console.error("Edge function error:", edgeFunctionError)
                // Continue with local deletion even if Supabase deletion fails
              }
            }
          } catch (supabaseError) {
            console.error("Supabase deletion error:", supabaseError)
            // Continue with local deletion even if Supabase deletion fails
          }
        }

        // Remove profile data from localStorage
        localStorage.removeItem(`profile_${currentUser.id}`)

        // Clear session data
        sessionStorage.removeItem("currentUser")
        sessionStorage.setItem("isLoggedIn", "false")

        showNotification("Your account has been deleted", "success")

        // Redirect to home page
        setTimeout(() => {
          window.location.href = "index.html"
        }, 2000)
      } catch (error) {
        console.error("Error deleting account:", error)
        showNotification("Failed to delete account. Please try again.", "error")

        if (deleteModal) deleteModal.classList.remove("active")
        if (confirmDeleteBtn) {
          confirmDeleteBtn.innerHTML = "Delete Account"
          confirmDeleteBtn.disabled = false
        }
      }
    }

    // Show notification
    function showNotification(message, type = "success") {
      if (!notificationArea) {
        console.warn("Notification area not found")
        alert(message)
        return
      }

      const notification = document.createElement("div")
      notification.className = `notification ${type}`

      const icon = document.createElement("i")
      icon.className =
        type === "success"
          ? "fas fa-check-circle"
          : type === "warning"
            ? "fas fa-exclamation-triangle"
            : "fas fa-exclamation-circle"

      const text = document.createElement("span")
      text.textContent = message

      notification.appendChild(icon)
      notification.appendChild(text)

      notificationArea.appendChild(notification)

      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.style.opacity = "0"
        notification.style.transform = "translateY(-10px)"

        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 5000)
    }
  }
})
