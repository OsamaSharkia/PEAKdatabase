document.addEventListener("DOMContentLoaded", () => {
  // Get Supabase client from window
  const supabaseClient = window.supabaseClient

  // Check authentication status first
  if (!window.authService.isLoggedIn()) {
    console.log("User not authenticated, redirecting to login page")
    window.location.href = "login.html"
    return
  }

  // Continue with profile initialization for authenticated users
  initializeProfile(supabaseClient)

  // Initialize profile functionality
  function initializeProfile(supabaseClient) {
    console.log("Initializing profile with Supabase client:", !!supabaseClient)

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
    const preferredLanguageSelect = document.getElementById("preferred-language")
    const notifyEducationalCheckbox = document.getElementById("notify-educational")
    const notifyResourcesCheckbox = document.getElementById("notify-resources")
    const notifyEventsCheckbox = document.getElementById("notify-events")

    // Button loading states
    const saveProfileBtn = document.getElementById("save-profile-btn")
    const saveNotificationsBtn = document.getElementById("save-notifications-btn")
    const changePasswordBtn = document.getElementById("change-password-btn")

    // Current user data
    const currentUser = window.authService.getCurrentUser()
    console.log("Current user from auth service:", currentUser)
    let userProfile = null

    // Load user profile data
    async function loadUserProfile() {
      try {
        // Check network connectivity
        if (!navigator.onLine) {
          throw new Error("You appear to be offline. Please check your internet connection.")
        }

        // Set email from session storage
        if (currentUser && currentUser.email) {
          profileEmail.textContent = currentUser.email
          emailAddressInput.value = currentUser.email
        }

        // Get user ID from session storage
        const userId = currentUser?.id
        if (!userId) {
          showNotification("User ID not found. Please try logging in again.", "error")
          setTimeout(() => {
            window.location.href = "login.html"
          }, 3000)
          return
        }

        // First try to get profile from Supabase
        let profileData = null
        let profileError = null

        if (supabaseClient) {
          console.log("Fetching profile from Supabase for user ID:", userId)
          const { data, error } = await supabaseClient.from("user_profiles").select("*").eq("id", userId).single()

          profileData = data
          profileError = error

          if (error) {
            console.warn("Error fetching from Supabase:", error)
          }
        }

        // If Supabase failed or isn't available, try localStorage as fallback
        if (!profileData) {
          console.log("Using localStorage fallback for profile data")
          const localProfile = localStorage.getItem(`profile_${userId}`)
          if (localProfile) {
            profileData = JSON.parse(localProfile)
          }
        }

        // If we still don't have profile data, create a basic one from currentUser
        if (!profileData) {
          console.log("Creating basic profile from currentUser")
          profileData = {
            id: userId,
            name: currentUser.name || "",
            email: currentUser.email,
            created_at: currentUser.created_at || new Date().toISOString(),
          }
        }

        userProfile = profileData
        console.log("Loaded user profile:", userProfile)

        // Set form values
        fullNameInput.value = userProfile.name || currentUser.name || ""
        phoneNumberInput.value = userProfile.phone || ""

        // Handle preferred language
        // Remove these lines:
        // if (preferredLanguageSelect) {
        //   // Check if the value exists in the options
        //   const languageValue = userProfile.preferred_language || "English";
        //   const optionExists = Array.from(preferredLanguageSelect.options).some(
        //     (option) => option.value === languageValue,
        //   );

        //   preferredLanguageSelect.value = optionExists ? languageValue : "English";
        // }

        // Set notification preferences
        if (notifyEducationalCheckbox) {
          notifyEducationalCheckbox.checked = userProfile.notify_educational !== false
        }

        if (notifyResourcesCheckbox) {
          notifyResourcesCheckbox.checked = userProfile.notify_resources !== false
        }

        if (notifyEventsCheckbox) {
          notifyEventsCheckbox.checked = userProfile.notify_events !== false
        }

        // Update profile display
        updateProfileDisplay()

        // Format and set creation date if available
        if (profileDate) {
          if (userProfile.created_at || currentUser.created_at) {
            const createdAt = new Date(userProfile.created_at || currentUser.created_at)
            profileDate.textContent = createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error)
        let errorMessage = "An error occurred while loading your profile"

        // Provide more specific error messages
        if (!navigator.onLine) {
          errorMessage = "You appear to be offline. Please check your internet connection."
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again later."
        }

        showNotification(errorMessage, "error")
      }
    }

    // Update profile display elements
    function updateProfileDisplay() {
      const name = userProfile?.name || currentUser?.name || "User"

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

    // Set button loading state
    function setButtonLoading(button, isLoading) {
      if (!button) return

      const textSpan = button.querySelector(".btn-text")
      const loadingSpan = button.querySelector(".btn-loading")

      if (!textSpan || !loadingSpan) {
        console.warn("Button spans not found:", button.id)
        return
      }

      if (isLoading) {
        textSpan.hidden = true
        loadingSpan.hidden = false
        button.disabled = true
      } else {
        textSpan.hidden = false
        loadingSpan.hidden = true
        button.disabled = false
      }
    }

    // Save profile data to both Supabase and localStorage
    async function saveProfileData(profileData) {
      let success = false
      let error = null

      // Try to save to Supabase first
      if (
        supabaseClient &&
        window.authService &&
        window.authService.db &&
        typeof window.authService.db.updateUserProfile === "function"
      ) {
        try {
          console.log("Saving profile to Supabase:", profileData)
          const result = await window.authService.db.updateUserProfile(profileData)
          success = result.success
          if (!result.success) {
            error = result.error
          }
        } catch (err) {
          console.error("Error saving to Supabase:", err)
          error = err
        }
      }

      // If Supabase failed or isn't available, save to localStorage
      if (!success) {
        try {
          console.log("Saving profile to localStorage:", profileData)
          localStorage.setItem(
            `profile_${profileData.id}`,
            JSON.stringify({
              ...userProfile,
              ...profileData,
              updated_at: new Date().toISOString(),
            }),
          )
          success = true
        } catch (err) {
          console.error("Error saving to localStorage:", err)
          if (!error) error = err
        }
      }

      return { success, error }
    }

    // Handle profile form submission
    if (profileForm) {
      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        setButtonLoading(saveProfileBtn, true)

        try {
          // Check network connectivity
          if (!navigator.onLine) {
            console.warn("User is offline")
          }

          // In the profileForm submit handler, change the updatedProfile object to:
          const updatedProfile = {
            id: currentUser.id,
            name: fullNameInput.value.trim(),
            phone: phoneNumberInput.value.trim(),
            updated_at: new Date().toISOString(),
          }

          console.log("Submitting profile update:", updatedProfile)
          const result = await saveProfileData(updatedProfile)

          if (!result.success) throw new Error(result.error || "Failed to update profile")

          // Update local data
          userProfile = { ...userProfile, ...updatedProfile }

          // Update session storage
          currentUser.name = updatedProfile.name
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser))

          updateProfileDisplay()

          showNotification("Profile updated successfully", "success")
        } catch (error) {
          console.error("Error updating profile:", error)

          let errorMessage = "Failed to update profile"

          // Provide more specific error messages
          if (!navigator.onLine) {
            errorMessage = "You appear to be offline. Changes saved locally and will sync when you're back online."
            showNotification(errorMessage, "warning")
          } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again."
            showNotification(errorMessage, "error")
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again later."
            showNotification(errorMessage, "error")
          } else if (error.code === "23505") {
            errorMessage = "This phone number is already in use by another account."
            showNotification(errorMessage, "error")
          } else {
            showNotification(errorMessage, "error")
          }
        } finally {
          setButtonLoading(saveProfileBtn, false)
        }
      })
    }

    // Handle notification preferences form submission
    if (notificationForm) {
      notificationForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        setButtonLoading(saveNotificationsBtn, true)

        try {
          // Check network connectivity
          if (!navigator.onLine) {
            console.warn("User is offline")
          }

          const updatedPreferences = {
            id: currentUser.id,
            notify_educational: notifyEducationalCheckbox.checked,
            notify_resources: notifyResourcesCheckbox.checked,
            notify_events: notifyEventsCheckbox.checked,
            updated_at: new Date().toISOString(),
          }

          console.log("Submitting notification preferences:", updatedPreferences)
          const result = await saveProfileData(updatedPreferences)

          if (!result.success) throw new Error(result.error || "Failed to update notification preferences")

          // Update local data
          userProfile = { ...userProfile, ...updatedPreferences }

          showNotification("Notification preferences updated successfully", "success")
        } catch (error) {
          console.error("Error updating notification preferences:", error)

          let errorMessage = "Failed to update notification preferences"

          // Provide more specific error messages
          if (!navigator.onLine) {
            errorMessage = "You appear to be offline. Changes saved locally and will sync when you're back online."
            showNotification(errorMessage, "warning")
          } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again."
            showNotification(errorMessage, "error")
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again later."
            showNotification(errorMessage, "error")
          } else {
            showNotification(errorMessage, "error")
          }
        } finally {
          setButtonLoading(saveNotificationsBtn, false)
        }
      })
    }

    // Handle password form submission
    if (passwordForm) {
      passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        setButtonLoading(changePasswordBtn, true)

        const currentPassword = document.getElementById("current-password").value
        const newPassword = document.getElementById("new-password").value
        const confirmPassword = document.getElementById("confirm-password").value

        // Validate passwords match
        if (newPassword !== confirmPassword) {
          showNotification("New passwords do not match", "error")
          setButtonLoading(changePasswordBtn, false)
          return
        }

        // Validate password strength
        if (newPassword.length < 6) {
          showNotification("Password must be at least 6 characters long", "error")
          setButtonLoading(changePasswordBtn, false)
          return
        }

        try {
          // Check network connectivity
          if (!navigator.onLine) {
            throw new Error("You appear to be offline. Please check your internet connection.")
          }

          if (!supabaseClient) {
            throw new Error("Authentication service not available")
          }

          // Update password
          const { error } = await supabaseClient.auth.updateUser({
            password: newPassword,
          })

          if (error) throw error

          // Clear form
          passwordForm.reset()

          showNotification("Password updated successfully", "success")
        } catch (error) {
          console.error("Error updating password:", error)

          let errorMessage = "Failed to update password. Make sure your current password is correct."

          // Provide more specific error messages
          if (!navigator.onLine) {
            errorMessage = "You appear to be offline. Please check your internet connection."
          } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again."
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again later."
          } else if (error.message.includes("weak")) {
            errorMessage = "Password is too weak. Please choose a stronger password."
          } else if (error.message.includes("auth")) {
            errorMessage = "Authentication error. Please try logging in again."
          }

          showNotification(errorMessage, "error")
        } finally {
          setButtonLoading(changePasswordBtn, false)
        }
      })
    }

    // Handle delete account button
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", () => {
        deleteModal.classList.add("active")
      })
    }

    // Handle close delete modal
    if (closeDeleteModal) {
      closeDeleteModal.addEventListener("click", () => {
        deleteModal.classList.remove("active")
        deleteConfirmationInput.value = ""
        confirmDeleteBtn.disabled = true
      })
    }

    // Handle cancel delete
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", () => {
        deleteModal.classList.remove("active")
        deleteConfirmationInput.value = ""
        confirmDeleteBtn.disabled = true
      })
    }

    // Handle delete confirmation input
    if (deleteConfirmationInput) {
      deleteConfirmationInput.addEventListener("input", function () {
        confirmDeleteBtn.disabled = this.value !== "delete my account"
      })
    }

    // Handle confirm delete
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async () => {
        if (deleteConfirmationInput.value !== "delete my account") {
          return
        }

        try {
          // Check network connectivity
          if (!navigator.onLine) {
            throw new Error("You appear to be offline. Please check your internet connection.")
          }

          if (!supabaseClient) {
            throw new Error("Authentication service not available")
          }

          // First delete profile
          const { error: profileError } = await supabaseClient.from("user_profiles").delete().eq("id", currentUser.id)

          if (profileError) {
            console.error("Error deleting profile:", profileError)
            throw profileError
          }

          // Sign out
          await window.authService.logout()

          showNotification("Your account has been deleted", "success")

          // Redirect to home page
          setTimeout(() => {
            window.location.href = "index.html"
          }, 2000)
        } catch (error) {
          console.error("Error deleting account:", error)

          let errorMessage = "Failed to delete account"

          // Provide more specific error messages
          if (!navigator.onLine) {
            errorMessage = "You appear to be offline. Please check your internet connection."
          } else if (error.message.includes("network")) {
            errorMessage = "Network error. Please check your connection and try again."
          } else if (error.message.includes("timeout")) {
            errorMessage = "Request timed out. Please try again later."
          } else if (error.message.includes("permission")) {
            errorMessage = "You do not have permission to delete this account."
          }

          showNotification(errorMessage, "error")
          deleteModal.classList.remove("active")
        }
      })
    }

    // Handle tab switching
    profileMenuItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Remove active class from all buttons and panes
        profileMenuItems.forEach((btn) => btn.classList.remove("active"))
        profileTabs.forEach((pane) => pane.classList.remove("active"))

        // Add active class to clicked button and corresponding pane
        this.classList.add("active")
        const tabId = this.getAttribute("data-tab")
        document.getElementById(tabId).classList.add("active")
      })
    })

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

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === deleteModal) {
        deleteModal.classList.remove("active")
        deleteConfirmationInput.value = ""
        confirmDeleteBtn.disabled = true
      }
    })

    // Initialize
    loadUserProfile()
  }
})
