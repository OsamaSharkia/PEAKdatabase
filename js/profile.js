// Initialize Supabase client
document.addEventListener("DOMContentLoaded", function() {
  // Get Supabase client from window (initialized in auth-handler.js)
  const supabaseClient = window.supabaseClient;
  
  // Check authentication status first
  checkAuthStatus().then(isAuthenticated => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login page");
      window.location.href = "login.html";
      return;
    }
    
    // Continue with profile initialization for authenticated users
    initializeProfile(supabaseClient);
  }).catch(error => {
    console.error("Error checking authentication status:", error);
    showNotification("Authentication error. Please try logging in again.", "error");
    // Redirect after showing the error
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);
  });
  
  // Function to check authentication status
  async function checkAuthStatus() {
    // First check sessionStorage
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      return true;
    }
    
    // If Supabase client is available, verify with Supabase
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        // If session exists, update sessionStorage and return true
        if (data.session) {
          sessionStorage.setItem("isLoggedIn", "true");
          return true;
        }
      } catch (err) {
        console.error("Error verifying session with Supabase:", err);
      }
    }
    
    return false;
  }
  
  // Initialize profile functionality
  function initializeProfile(supabaseClient) {
    if (!supabaseClient) {
      showNotification("Error initializing database connection", "error");
      return;
    }

    // DOM Elements
    const profileForm = document.getElementById('profile-form');
    const notificationForm = document.getElementById('notification-form');
    const passwordForm = document.getElementById('password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const deleteConfirmationInput = document.getElementById('delete-confirmation');
    const notificationArea = document.getElementById('notification-area');
    const profileMenuItems = document.querySelectorAll('.profile-menu-item');
    const profileTabs = document.querySelectorAll('.profile-tab');

    // Profile elements
    const profileInitials = document.getElementById('profile-initials');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileDate = document.getElementById('profile-date');

    // Form fields
    const fullNameInput = document.getElementById('full-name');
    const emailAddressInput = document.getElementById('email-address');
    const phoneNumberInput = document.getElementById('phone-number');
    const preferredLanguageSelect = document.getElementById('preferred-language');
    const notifyEducationalCheckbox = document.getElementById('notify-educational');
    const notifyResourcesCheckbox = document.getElementById('notify-resources');
    const notifyEventsCheckbox = document.getElementById('notify-events');

    // Button loading states
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const saveNotificationsBtn = document.getElementById('save-notifications-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');

    // Current user data
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "{}");
    let userProfile = null;

    // Load user profile data
    async function loadUserProfile() {
      try {
        // Set email from session storage
        if (currentUser && currentUser.email) {
          profileEmail.textContent = currentUser.email;
          emailAddressInput.value = currentUser.email;
        }
        
        // Get user ID from session storage
        const userId = currentUser?.id;
        if (!userId) {
          showNotification("User ID not found", "error");
          return;
        }

        // Get profile data from database
        const { data, error } = await supabaseClient
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error loading profile:', error);
          showNotification('Failed to load profile data', 'error');
          return;
        }
        
        userProfile = data || {};
        
        // Set form values
        fullNameInput.value = userProfile.name || currentUser.name || '';
        phoneNumberInput.value = userProfile.phone || '';
        preferredLanguageSelect.value = userProfile.preferred_language || 'English';
        
        // Set notification preferences
        notifyEducationalCheckbox.checked = userProfile.notify_educational !== false;
        notifyResourcesCheckbox.checked = userProfile.notify_resources !== false;
        notifyEventsCheckbox.checked = userProfile.notify_events !== false;
        
        // Update profile display
        updateProfileDisplay();

        // Format and set creation date if available
        if (userProfile.created_at || currentUser.created_at) {
          const createdAt = new Date(userProfile.created_at || currentUser.created_at);
          profileDate.textContent = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (error) {
        console.error('Error in loadUserProfile:', error);
        showNotification('An error occurred while loading your profile', 'error');
      }
    }

    // Update profile display elements
    function updateProfileDisplay() {
      const name = userProfile?.name || currentUser?.name || 'User';
      profileName.textContent = name;

      // Set initials
      if (name && name !== 'User') {
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        profileInitials.textContent = initials;
      } else {
        profileInitials.textContent = 'U';
      }
    }

    // Set button loading state
    function setButtonLoading(button, isLoading) {
      const textSpan = button.querySelector('.btn-text');
      const loadingSpan = button.querySelector('.btn-loading');

      if (isLoading) {
        textSpan.hidden = true;
        loadingSpan.hidden = false;
        button.disabled = true;
      } else {
        textSpan.hidden = false;
        loadingSpan.hidden = true;
        button.disabled = false;
      }
    }

    // Handle profile form submission
    if (profileForm) {
      profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        setButtonLoading(saveProfileBtn, true);

        try {
          const updatedProfile = {
            id: currentUser.id,
            name: fullNameInput.value.trim(),
            phone: phoneNumberInput.value.trim(),
            preferred_language: preferredLanguageSelect.value,
            updated_at: new Date().toISOString()
          };
          
          const { error } = await supabaseClient
            .from('user_profiles')
            .upsert(updatedProfile);
            
          if (error) throw error;
          
          // Update local data
          userProfile = { ...userProfile, ...updatedProfile };
          
          // Update session storage
          currentUser.name = updatedProfile.name;
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
          
          updateProfileDisplay();
          
          showNotification('Profile updated successfully', 'success');
        } catch (error) {
          console.error('Error updating profile:', error);
          showNotification('Failed to update profile', 'error');
        } finally {
          setButtonLoading(saveProfileBtn, false);
        }
      });
    }

    // Handle notification preferences form submission
    if (notificationForm) {
      notificationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        setButtonLoading(saveNotificationsBtn, true);

        try {
          const updatedPreferences = {
            id: currentUser.id,
            notify_educational: notifyEducationalCheckbox.checked,
            notify_resources: notifyResourcesCheckbox.checked,
            notify_events: notifyEventsCheckbox.checked,
            updated_at: new Date().toISOString()
          };
          
          const { error } = await supabaseClient
            .from('user_profiles')
            .upsert(updatedPreferences);
            
          if (error) throw error;
          
          // Update local data
          userProfile = { ...userProfile, ...updatedPreferences };
          
          showNotification('Notification preferences updated successfully', 'success');
        } catch (error) {
          console.error('Error updating notification preferences:', error);
          showNotification('Failed to update notification preferences', 'error');
        } finally {
          setButtonLoading(saveNotificationsBtn, false);
        }
      });
    }

    // Handle password form submission
    if (passwordForm) {
      passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        setButtonLoading(changePasswordBtn, true);

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
          showNotification('New passwords do not match', 'error');
          setButtonLoading(changePasswordBtn, false);
          return;
        }

        try {
          // Update password
          const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
          });
          
          if (error) throw error;
          
          // Clear form
          passwordForm.reset();
          
          showNotification('Password updated successfully', 'success');
        } catch (error) {
          console.error('Error updating password:', error);
          showNotification('Failed to update password. Make sure your current password is correct.', 'error');
        } finally {
          setButtonLoading(changePasswordBtn, false);
        }
      });
    }

    // Handle delete account button
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function() {
        deleteModal.classList.add('active');
      });
    }

    // Handle close delete modal
    if (closeDeleteModal) {
      closeDeleteModal.addEventListener('click', function() {
        deleteModal.classList.remove('active');
        deleteConfirmationInput.value = '';
        confirmDeleteBtn.disabled = true;
      });
    }

    // Handle cancel delete
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('active');
        deleteConfirmationInput.value = '';
        confirmDeleteBtn.disabled = true;
      });
    }

    // Handle delete confirmation input
    if (deleteConfirmationInput) {
      deleteConfirmationInput.addEventListener('input', function() {
        confirmDeleteBtn.disabled = this.value !== 'delete my account';
      });
    }

    // Handle confirm delete
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', async function() {
        if (deleteConfirmationInput.value !== 'delete my account') {
          return;
        }

        try {
          // First delete profile
          const { error: profileError } = await supabaseClient
            .from('user_profiles')
            .delete()
            .eq('id', currentUser.id);
            
          if (profileError) {
            console.error('Error deleting profile:', profileError);
          }
          
          // Sign out
          await supabaseClient.auth.signOut();
          
          // Clear session data
          sessionStorage.removeItem("isLoggedIn");
          sessionStorage.removeItem("currentUser");
          sessionStorage.removeItem("isAdmin");
          
          showNotification('Your account has been deleted', 'success');
          
          // Redirect to home page
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        } catch (error) {
          console.error('Error deleting account:', error);
          showNotification('Failed to delete account', 'error');
          deleteModal.classList.remove('active');
        }
      });
    }

    // Handle tab switching
    profileMenuItems.forEach(item => {
      item.addEventListener('click', function() {
        // Remove active class from all buttons and panes
        profileMenuItems.forEach(btn => btn.classList.remove('active'));
        profileTabs.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Show notification
    function showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;

      const icon = document.createElement('i');
      icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

      const text = document.createElement('span');
      text.textContent = message;

      notification.appendChild(icon);
      notification.appendChild(text);

      notificationArea.appendChild(notification);

      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 5000);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
      if (event.target === deleteModal) {
        deleteModal.classList.remove('active');
        deleteConfirmationInput.value = '';
        confirmDeleteBtn.disabled = true;
      }
    });

    // Initialize
    loadUserProfile();
  }
});
