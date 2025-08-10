// Epoch Converter Class
class EpochConverter {
    constructor() {
        this.isGMT = false;
        this.currentTimeInterval = null;
        this.currentMsInterval = null;
        this.copyTimeout = null;

        this.initializeElements();
        this.bindEvents();
        this.startCurrentTimeUpdates();
        this.initializeDateInput();
    }

    initializeElements() {
        // Toggle elements
        this.timezoneToggle = document.getElementById('timezone-toggle');
        this.localLabel = document.getElementById('local-label');
        this.gmtLabel = document.getElementById('gmt-label');

        // Current time elements
        this.currentEpochSec = document.getElementById('current-epoch-sec');
        this.currentEpochMs = document.getElementById('current-epoch-ms');
        this.currentTimeFormatted = document.getElementById('current-time-formatted');

        // Converter elements
        this.epochInput = document.getElementById('epoch-input');
        this.dateInput = document.getElementById('date-input');
        this.setNowBtn = document.getElementById('set-now-btn');
        this.epochResults = document.getElementById('epoch-results');
        this.dateResults = document.getElementById('date-results');

        // Toast
        this.copyToast = document.getElementById('copy-toast');

        // Copy buttons
        this.copyButtons = document.querySelectorAll('.copy-btn');
    }

    bindEvents() {
        // Timezone toggle
        if (this.timezoneToggle) {
            this.timezoneToggle.addEventListener('click', () => this.toggleTimezone());
            this.timezoneToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTimezone();
                }
            });
        }

        // Epoch input
        if (this.epochInput) {
            this.epochInput.addEventListener('input', (e) => this.handleEpochInput(e));
            this.epochInput.addEventListener('paste', (e) => {
                // Handle paste events
                setTimeout(() => {
                    this.handleEpochInput(e);
                }, 10);
            });
        }

        // Date input
        if (this.dateInput) {
            this.dateInput.addEventListener('input', (e) => this.handleDateInput(e));
        }

        // Set now button
        if (this.setNowBtn) {
            this.setNowBtn.addEventListener('click', () => this.setDateToNow());
        }

        // Copy buttons - use event delegation for dynamically created buttons
        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) {
                const copyTarget = copyBtn.dataset.copy;
                const element = document.getElementById(copyTarget);
                if (element) {
                    this.copyToClipboard(element.textContent, copyBtn);
                }
            }
        });

        // Listen for theme changes to update datetime input color scheme
        window.addEventListener('themechange', (e) => {
            this.updateDateInputColorScheme(e.detail.theme);
        });
    }

    toggleTimezone() {
        this.isGMT = !this.isGMT;
        this.timezoneToggle.setAttribute('aria-checked', this.isGMT);

        // Update label states
        this.localLabel.classList.toggle('active', !this.isGMT);
        this.gmtLabel.classList.toggle('active', this.isGMT);

        // Update all displays
        this.updateCurrentTime();
        if (this.epochInput.value) {
            this.handleEpochInput({ target: this.epochInput });
        }
        if (this.dateInput.value) {
            this.handleDateInput({ target: this.dateInput });
        }
    }

    startCurrentTimeUpdates() {
        this.updateCurrentTime();
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTime();
        }, 1000);

        // Update milliseconds more frequently for real-time ms display
        this.currentMsInterval = setInterval(() => {
            if (this.currentEpochMs) {
                this.currentEpochMs.textContent = Date.now();
            }
        }, 50);
    }

    updateCurrentTime() {
        const now = new Date();
        const epochSec = Math.floor(now.getTime() / 1000);
        const epochMs = now.getTime();

        // Update values
        if (this.currentEpochSec) {
            this.currentEpochSec.textContent = epochSec;
        }
        if (this.currentEpochMs) {
            this.currentEpochMs.textContent = epochMs;
        }

        // Format current time
        if (this.currentTimeFormatted) {
            const timeOptions = {
                weekday: 'short',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: this.isGMT ? 'UTC' : undefined,
            };

            const formattedTime = now.toLocaleString(undefined, timeOptions);
            this.currentTimeFormatted.textContent = formattedTime;
        }
    }

    initializeDateInput() {
        if (!this.dateInput) return;

        // Set initial date to current time
        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
        this.dateInput.value = localISOTime.slice(0, 16);
        this.handleDateInput({ target: this.dateInput });

        // Set initial color scheme
        this.updateDateInputColorScheme(window.themeToggle?.getCurrentTheme() || 'dark');
    }

    updateDateInputColorScheme(theme) {
        if (this.dateInput) {
            this.dateInput.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
        }
    }

    handleEpochInput(e) {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;

        if (!value) {
            if (this.epochResults) {
                this.epochResults.classList.add('hidden');
            }
            return;
        }

        const parsedEpoch = this.parseEpochInput(value);
        if (parsedEpoch) {
            this.displayEpochResults(parsedEpoch);
            if (this.epochResults) {
                this.epochResults.classList.remove('hidden');
            }
        } else {
            if (this.epochResults) {
                this.epochResults.classList.add('hidden');
            }
        }
    }

    parseEpochInput(value) {
        const num = parseInt(value);
        if (isNaN(num)) return null;

        // Determine if it's seconds or milliseconds based on length
        // Timestamps after year 2001 (978307200) in seconds are 10 digits
        // Timestamps in milliseconds are 13 digits
        if (value.length > 10) {
            // Treat as milliseconds, convert to seconds
            return num / 1000;
        } else {
            // Treat as seconds
            return num;
        }
    }

    displayEpochResults(epochSeconds) {
        if (!this.epochResults) return;

        const date = new Date(epochSeconds * 1000);

        const timeOptions = {
            weekday: 'short',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: this.isGMT ? 'UTC' : undefined,
        };

        const formattedTime = date.toLocaleString(undefined, timeOptions);
        const relativeTime = this.getRelativeTime(date.getTime());

        this.epochResults.innerHTML = `
            <div class="result-item">
                <span class="result-item__label">Converted Time:</span>
                <code class="result-item__value">${formattedTime}</code>
                <button class="copy-btn" data-copy="epoch-converted-time" title="Copy to clipboard">
                    <span class="copy-icon">📋</span>
                </button>
            </div>
            <div class="result-item__relative">Relative: ${relativeTime}</div>
            <div style="display: none;" id="epoch-converted-time">${formattedTime}</div>
        `;
    }

    handleDateInput(e) {
        const value = e.target.value;

        if (!value) {
            if (this.dateResults) {
                this.dateResults.classList.add('hidden');
            }
            return;
        }

        const date = new Date(this.isGMT ? value + 'Z' : value);
        if (isNaN(date.getTime())) {
            if (this.dateResults) {
                this.dateResults.classList.add('hidden');
            }
            return;
        }

        this.displayDateResults(date);
        if (this.dateResults) {
            this.dateResults.classList.remove('hidden');
        }
    }

    displayDateResults(date) {
        if (!this.dateResults) return;

        const epochSec = Math.floor(date.getTime() / 1000);
        const epochMs = date.getTime();

        this.dateResults.innerHTML = `
            <div class="result-item">
                <span class="result-item__label">Epoch (seconds):</span>
                <code class="result-item__value">${epochSec}</code>
                <button class="copy-btn" data-copy="date-epoch-sec" title="Copy to clipboard">
                    <span class="copy-icon">📋</span>
                </button>
            </div>
            <div class="result-item">
                <span class="result-item__label">Epoch (milliseconds):</span>
                <code class="result-item__value">${epochMs}</code>
                <button class="copy-btn" data-copy="date-epoch-ms" title="Copy to clipboard">
                    <span class="copy-icon">📋</span>
                </button>
            </div>
            <div style="display: none;" id="date-epoch-sec">${epochSec}</div>
            <div style="display: none;" id="date-epoch-ms">${epochMs}</div>
        `;
    }

    setDateToNow() {
        if (!this.dateInput) return;

        const now = new Date();
        const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
        this.dateInput.value = localISOTime.slice(0, 16);
        this.handleDateInput({ target: this.dateInput });
    }

    getRelativeTime(timestamp) {
        const diff = timestamp - Date.now();
        const seconds = Math.floor(Math.abs(diff) / 1000);

        if (seconds < 60) {
            return diff >= 0 ? `in ${seconds} seconds` : `${seconds} seconds ago`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return diff >= 0 ? `in ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return diff >= 0 ? `in ${hours} hour${hours !== 1 ? 's' : ''}` : `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(seconds / 86400);
            return diff >= 0 ? `in ${days} day${days !== 1 ? 's' : ''}` : `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    }

    async copyToClipboard(text, buttonElement) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(buttonElement);
            this.showCopyToast();
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(text, buttonElement);
        }
    }

    fallbackCopyTextToClipboard(text, buttonElement) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess(buttonElement);
                this.showCopyToast();
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }

    showCopySuccess(buttonElement) {
        buttonElement.classList.add('copied');
        setTimeout(() => {
            buttonElement.classList.remove('copied');
        }, 1200);
    }

    showCopyToast() {
        if (!this.copyToast) return;

        this.copyToast.classList.add('show');

        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
        }

        this.copyTimeout = setTimeout(() => {
            this.copyToast.classList.remove('show');
        }, 3000);
    }

    destroy() {
        if (this.currentTimeInterval) {
            clearInterval(this.currentTimeInterval);
        }
        if (this.currentMsInterval) {
            clearInterval(this.currentMsInterval);
        }
        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
        }
    }
}

// Initialize the epoch converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.epochConverter = new EpochConverter();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.epochConverter) {
        window.epochConverter.destroy();
    }
});