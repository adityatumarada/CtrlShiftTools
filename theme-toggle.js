// Theme Toggle System
class ThemeToggle {
    constructor() {
        this.currentTheme = 'dark'; // Default theme
        this.themeToggleBtn = null;

        this.init();
    }

    init() {
        // Get theme toggle button
        this.themeToggleBtn = document.getElementById('theme-toggle');

        if (!this.themeToggleBtn) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Load saved theme preference or use default
        this.loadSavedTheme();

        // Bind events
        this.bindEvents();

        // Apply initial theme
        this.applyTheme();
    }

    bindEvents() {
        // Click event
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard support
        this.themeToggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme-preference')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
    }

    loadSavedTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme-preference');

        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // No saved preference, check system preference
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = systemPrefersDark ? 'dark' : 'light';
        }
    }

    toggleTheme() {
        // Switch to opposite theme
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';

        // Apply the new theme
        this.applyTheme();

        // Save preference
        this.saveThemePreference();

        // Add visual feedback
        this.addToggleAnimation();
    }

    applyTheme() {
        // Set theme on document element
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Update toggle button state
        this.updateToggleButton();

        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: this.currentTheme }
        }));
    }

    updateToggleButton() {
        if (!this.themeToggleBtn) return;

        // Update aria-label for accessibility
        const label = this.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        this.themeToggleBtn.setAttribute('aria-label', label);
        this.themeToggleBtn.setAttribute('title', label);
    }

    saveThemePreference() {
        try {
            localStorage.setItem('theme-preference', this.currentTheme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    addToggleAnimation() {
        // Add a subtle animation to the toggle button
        this.themeToggleBtn.style.transform = 'scale(0.9)';

        setTimeout(() => {
            this.themeToggleBtn.style.transform = '';
        }, 150);
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to set theme programmatically
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveThemePreference();
        }
    }
}

// Utility function to get theme preference before DOM is ready
function getInitialTheme() {
    try {
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            return savedTheme;
        }

        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
    } catch {
        return 'dark'; // fallback
    }
}

// Apply theme immediately to prevent flash
(function() {
    const theme = getInitialTheme();
    document.documentElement.setAttribute('data-theme', theme);
})();

// Initialize theme toggle when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});

// Example of how other components can listen to theme changes
window.addEventListener('themechange', (e) => {
    console.log('Theme changed to:', e.detail.theme);

    // You can add any theme-specific logic here
    // For example, updating chart colors, reloading images, etc.
});