// Initialize Supabase client
const supabaseUrl = 'https://znyoofmcjiknvevezbhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW9vZm1jamlrbnZldmV6YmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjc1MjMsImV4cCI6MjA2MDY0MzUyM30.BG07ZfmdfEOhwJDcFkXVe3JHYB1GkcWceyn7nW9hGr0';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const profileForm = document.getElementById('profile-form');
const notificationForm = document.getElementById('notification-form');
const passwordForm = document.getElementById('password-form');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const deleteConfirmationInput = document.getElementById('delete-confirmation');
const notificationArea = document.getElementById('notification-area');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');
const logoutLink = document.getElementById('logout-link');
const logoutButton = document.getElementById('logout-button');

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
const updatePasswordBtn = document.getElementById('update-password-btn');

// Current user data
let currentUser = null;
let userProfile = null;

// Check if user is logged in
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error checking auth:', error);
            showNotification('Authentication error. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
        
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        
        currentUser = session.user;
        await loadUserProfile();
    } catch (error) {
        console.error('Error in checkAuth:', error);
        showNotification('Authentication error. Please login again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        // Set email from auth
        profileEmail.textContent = currentUser.email;
        emailAddressInput.value = currentUser.email;
        
        // Format and set creation date
        const createdAt = new Date(currentUser.created_at);
        profileDate.textContent = createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Get profile data from database
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
        if (error && error.code !== 'PGRST116') {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile data', 'error');
            return;
        }
        
        userProfile = data || {};
        
        // Set form values
        fullNameInput.value = userProfile.full_name || '';
        phoneNumberInput.value = userProfile.phone || '';
        preferredLanguageSelect.value = userProfile.preferred_language || 'English';
        
        // Set notification preferences
        notifyEducationalCheckbox.checked = userProfile.notify_educational_opportunities !== false;
        notifyResourcesCheckbox.checked = userProfile.notify_new_resources !== false;
        notifyEventsCheckbox.checked = userProfile.notify_events !== false;
        
        // Update profile display
        updateProfileDisplay();
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
        showNotification('An error occurred while loading your profile', 'error');
    }
}

// Update profile display elements
function updateProfileDisplay() {
    const name = userProfile.full_name || 'User';
    profileName.textContent = name;

    // Set initials
    if (userProfile.full_name) {
        const initials = userProfile.full_name
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
profileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    setButtonLoading(saveProfileBtn, true);

    try {
        const updatedProfile = {
            id: currentUser.id,
            full_name: fullNameInput.value,
            phone: phoneNumberInput.value,
            preferred_language: preferredLanguageSelect.value,
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('user_profiles')
            .upsert(updatedProfile, { onConflict: 'id' });
            
        if (error) throw error;
        
        // Update local data
        userProfile = { ...userProfile, ...updatedProfile };
        updateProfileDisplay();
        
        showNotification('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    } finally {
        setButtonLoading(saveProfileBtn, false);
    }
});

// Handle notification preferences form submission
notificationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    setButtonLoading(saveNotificationsBtn, true);

    try {
        const updatedPreferences = {
            id: currentUser.id,
            notify_educational_opportunities: notifyEducationalCheckbox.checked,
            notify_new_resources: notifyResourcesCheckbox.checked,
            notify_events: notifyEventsCheckbox.checked,
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('user_profiles')
            .upsert(updatedPreferences, { onConflict: 'id' });
            
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

// Handle password form submission
passwordForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    setButtonLoading(updatePasswordBtn, true);

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        setButtonLoading(updatePasswordBtn, false);
        return;
    }

    try {
        // First verify current password by signing in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });
        
        if (signInError) {
            showNotification('Current password is incorrect', 'error');
            setButtonLoading(updatePasswordBtn, false);
            return;
        }
        
        // Update password
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        // Clear form
        passwordForm.reset();
        
        showNotification('Password updated successfully', 'success');
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Failed to update password', 'error');
    } finally {
        setButtonLoading(updatePasswordBtn, false);
    }
});

// Handle delete account button
deleteAccountBtn.addEventListener('click', function() {
    deleteModal.classList.add('active');
});

// Handle cancel delete
cancelDeleteBtn.addEventListener('click', function() {
    deleteModal.classList.remove('active');
    deleteConfirmationInput.value = '';
    confirmDeleteBtn.disabled = true;
});

// Handle delete confirmation input
deleteConfirmationInput.addEventListener('input', function() {
    confirmDeleteBtn.disabled = this.value !== 'delete my account';
});

// Handle confirm delete
confirmDeleteBtn.addEventListener('click', async function() {
    if (deleteConfirmationInput.value !== 'delete my account') {
        return;
    }

    try {
        // First delete profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', currentUser.id);
            
        if (profileError) {
            console.error('Error deleting profile:', profileError);
        }
        
        // Sign out
        await supabase.auth.signOut();
        
        showNotification('Your account has been deleted', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error deleting account:', error);
        showNotification('Failed to delete account', 'error');
        deleteModal.classList.remove('active');
    }
});

// Handle tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        this.classList.add('active');
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Handle logout
function handleLogout(e) {
    e.preventDefault();

    supabase.auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Error signing out:', error);
        showNotification('Failed to sign out', 'error');
    });
}

if (logoutLink) logoutLink.addEventListener('click', handleLogout);
if (logoutButton) logoutButton.addEventListener('click', handleLogout);

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
        notification.remove();
    }, 5000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize menu toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Check authentication
    checkAuth();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === deleteModal) {
        deleteModal.classList.remove('active');
        deleteConfirmationInput.value = '';
        confirmDeleteBtn.disabled = true;
    }
});
