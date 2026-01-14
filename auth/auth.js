// auth.js - Shared authentication utilities

// Check authentication status
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Get current user profile
async function getCurrentUserProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    
    return data;
}

// Logout function
async function logout() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
        return false;
    }
    
    // Clear any stored data
    localStorage.removeItem('rememberMe');
    
    // Redirect to home
    window.location.href = '../index.html';
    return true;
}

// Require authentication (redirect if not logged in)
async function requireAuth() {
    const session = await checkAuth();
    
    if (!session) {
        // Store the current page to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '../auth/login.html';
        return false;
    }
    
    return true;
}

// Check if username is available
async function isUsernameAvailable(username) {
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
    
    if (error && error.code === 'PGRST116') {
        // No rows returned = username is available
        return true;
    }
    
    return !data;
}

// Update user profile
async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    
    return data;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
        // Check if there's a redirect URL stored
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        }
    } else if (event === 'SIGNED_OUT') {
        // Only redirect if we're on a protected page
        const protectedPages = ['/community/', '/admin/', '/profile/'];
        const currentPath = window.location.pathname;
        
        if (protectedPages.some(page => currentPath.includes(page))) {
            window.location.href = '../auth/login.html';
        }
    }
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuth,
        getCurrentUserProfile,
        logout,
        requireAuth,
        isUsernameAvailable,
        updateUserProfile,
        formatDate
    };
}