/**
 * Supabase Client Initialization
 * This file initializes the Supabase client with the project URL and public API key.
 * It makes the client available globally as window.supabaseClient for use in other scripts.
 */

// Import the Supabase client library
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = "https://znyoofmcjiknvevezbhb.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0"

// Create the Supabase client and make it available globally
window.supabaseClient = createClient(supabaseUrl, supabaseKey)

// Check for existing session on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get session from local storage
    const {
      data: { session },
      error,
    } = await window.supabaseClient.auth.getSession()

    if (error) {
      console.error("Error checking session:", error.message)
      return
    }

    if (session) {
      // User is logged in
      sessionStorage.setItem("isLoggedIn", "true")

      // Get user data
      const {
        data: { user },
        error: userError,
      } = await window.supabaseClient.auth.getUser()

      if (userError) {
        console.error("Error getting user data:", userError.message)
        return
      }

      if (user) {
        // Store user data in session storage
        sessionStorage.setItem("userId", user.id)
        sessionStorage.setItem("userEmail", user.email)

        // Store user metadata if available
        if (user.user_metadata && user.user_metadata.name) {
          sessionStorage.setItem("userName", user.user_metadata.name)
        }
      }
    } else {
      // User is not logged in
      sessionStorage.removeItem("isLoggedIn")
      sessionStorage.removeItem("userId")
      sessionStorage.removeItem("userEmail")
      sessionStorage.removeItem("userName")
    }

    // Update navigation based on login status
    updateNavigation()
  } catch (error) {
    console.error("Unexpected error checking session:", error)
  }
})

/**
 * Updates the navigation menu based on user login status
 */
function updateNavigation() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
  const navLinks = document.getElementById("nav-links")

  if (!navLinks) return

  // Get all nav items
  const navItems = Array.from(navLinks.querySelectorAll("li"))

  if (isLoggedIn) {
    // User is logged in

    // Hide login and register links
    navItems.forEach((item) => {
      const link = item.querySelector("a")
      if (link && (link.href.includes("login.html") || link.href.includes("register.html"))) {
        item.style.display = "none"
      }
    })

    // Add profile and logout links if they don't exist
    if (!navItems.some((item) => item.querySelector("a")?.href.includes("profile.html"))) {
      const profileItem = document.createElement("li")
      profileItem.innerHTML = '<a href="profile.html">My Profile</a>'
      navLinks.appendChild(profileItem)
    }

    if (!navItems.some((item) => item.querySelector("a")?.id === "logout-btn")) {
      const logoutItem = document.createElement("li")
      const logoutLink = document.createElement("a")
      logoutLink.href = "#"
      logoutLink.id = "logout-btn"
      logoutLink.textContent = "Logout"
      logoutItem.appendChild(logoutLink)
      navLinks.appendChild(logoutItem)

      // Add logout event listener
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault()
        try {
          await window.supabaseClient.auth.signOut()
          sessionStorage.removeItem("isLoggedIn")
          sessionStorage.removeItem("userId")
          sessionStorage.removeItem("userEmail")
          sessionStorage.removeItem("userName")
          window.location.href = "index.html"
        } catch (error) {
          console.error("Error signing out:", error)
        }
      })
    }
  } else {
    // User is not logged in

    // Hide profile and logout links
    navItems.forEach((item) => {
      const link = item.querySelector("a")
      if (link && (link.href.includes("profile.html") || link.id === "logout-btn")) {
        item.style.display = "none"
      }
    })

    // Show login and register links
    navItems.forEach((item) => {
      const link = item.querySelector("a")
      if (link && (link.href.includes("login.html") || link.href.includes("register.html"))) {
        item.style.display = ""
      }
    })
  }
}

// Function to record login activity
async function recordLoginActivity() {
  try {
    if (!window.supabaseClient) return

    const {
      data: { user },
    } = await window.supabaseClient.auth.getUser()

    if (user) {
      await window.supabaseClient.rpc("record_login_activity")
    }
  } catch (error) {
    console.error("Error recording login activity:", error)
  }
}

// Function to record resource view
async function recordResourceView(resourceId) {
  try {
    if (!window.supabaseClient || !resourceId) return

    await window.supabaseClient.rpc("increment_resource_view", { resource_id: resourceId })
  } catch (error) {
    console.error("Error recording resource view:", error)
  }
}

// Function to get user profile
async function getUserProfile() {
  try {
    if (!window.supabaseClient) return null

    const {
      data: { user },
    } = await window.supabaseClient.auth.getUser()

    if (!user) return null

    const { data, error } = await window.supabaseClient.from("user_profiles").select("*").eq("id", user.id).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Function to update user profile
async function updateUserProfile(profileData) {
  try {
    if (!window.supabaseClient) return { success: false, error: "Supabase client not initialized" }

    const {
      data: { user },
    } = await window.supabaseClient.auth.getUser()

    if (!user) return { success: false, error: "User not authenticated" }

    // Add user ID and updated timestamp
    const updatedProfile = {
      ...profileData,
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    const { error } = await window.supabaseClient.from("user_profiles").upsert(updatedProfile)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message || "Failed to update profile" }
  }
}

// Export functions for use in other scripts
window.peakDB = {
  recordLoginActivity,
  recordResourceView,
  getUserProfile,
  updateUserProfile,
}
