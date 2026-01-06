// Search Agent Application
class SearchAgent {
    constructor() {
        this.currentEngine = 'google';
        this.searchHistory = [];
        this.favorites = [];
        this.settings = {
            defaultEngine: 'google',
            saveHistory: true,
            voiceSearch: true,
            darkMode: false,
            language: 'ar'
        };
        
        this.searchEngines = {
            google: {
                name: 'Google',
                url: 'https://www.google.com/search?q=',
                imageUrl: 'https://www.google.com/search?tbm=isch&q=',
                videoUrl: 'https://www.google.com/search?tbm=vid&q=',
                newsUrl: 'https://news.google.com/search?q=',
                mapsUrl: 'https://www.google.com/maps/search/'
            },
            bing: {
                name: 'Bing',
                url: 'https://www.bing.com/search?q=',
                imageUrl: 'https://www.bing.com/images/search?q=',
                videoUrl: 'https://www.bing.com/videos/search?q=',
                newsUrl: 'https://www.bing.com/news/search?q=',
                mapsUrl: 'https://www.bing.com/maps?q='
            },
            duckduckgo: {
                name: 'DuckDuckGo',
                url: 'https://duckduckgo.com/?q=',
                imageUrl: 'https://duckduckgo.com/?q=',
                videoUrl: 'https://duckduckgo.com/?q=',
                newsUrl: 'https://duckduckgo.com/?q=',
                mapsUrl: 'https://duckduckgo.com/?q='
            },
            yahoo: {
                name: 'Yahoo',
                url: 'https://search.yahoo.com/search?p=',
                imageUrl: 'https://images.search.yahoo.com/search/images?p=',
                videoUrl: 'https://video.search.yahoo.com/search/video?p=',
                newsUrl: 'https://news.search.yahoo.com/search?p=',
                mapsUrl: 'https://www.yahoo.com/maps?q='
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadHistory();
        this.loadFavorites();
        this.setupEventListeners();
        this.applySettings();
        this.renderHistory();
        this.renderFavorites();
    }
    
    // Local Storage Management
    loadSettings() {
        const saved = localStorage.getItem('searchAgentSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('searchAgentSettings', JSON.stringify(this.settings));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
        }
    }
    
    saveHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    loadFavorites() {
        const saved = localStorage.getItem('searchFavorites');
        if (saved) {
            this.favorites = JSON.parse(saved);
        } else {
            // Default favorites
            this.favorites = [
                { title: 'YouTube', url: 'https://www.youtube.com', icon: '🎥' },
                { title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
                { title: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
                { title: 'Reddit', url: 'https://www.reddit.com', icon: '🤖' },
                { title: 'GitHub', url: 'https://github.com', icon: '💻' },
                { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '📝' }
            ];
            this.saveFavorites();
        }
    }
    
    saveFavorites() {
        localStorage.setItem('searchFavorites', JSON.stringify(this.favorites));
    }
    
    // Event Listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearBtn');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.classList.remove('visible');
            searchInput.focus();
        });
        
        // Voice search
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.addEventListener('click', () => {
            this.startVoiceSearch();
        });
        
        // Engine selector
        const engineBtns = document.querySelectorAll('.engine-btn');
        engineBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectEngine(btn.dataset.engine);
            });
        });
        
        // Quick actions
        document.getElementById('imageSearchBtn').addEventListener('click', () => {
            this.performSpecialSearch('image');
        });
        
        document.getElementById('videoSearchBtn').addEventListener('click', () => {
            this.performSpecialSearch('video');
        });
        
        document.getElementById('newsSearchBtn').addEventListener('click', () => {
            this.performSpecialSearch('news');
        });
        
        document.getElementById('mapsSearchBtn').addEventListener('click', () => {
            this.performSpecialSearch('maps');
        });
        
        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        
        settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });
        
        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('visible');
        });
        
        saveSettingsBtn.addEventListener('click', () => {
            this.saveSettingsFromModal();
        });
        
        // History
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Voice modal
        const cancelVoiceBtn = document.getElementById('cancelVoiceBtn');
        cancelVoiceBtn.addEventListener('click', () => {
            this.stopVoiceSearch();
        });
        
        // Click outside modal to close
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('visible');
            }
        });
    }
    
    // Search Functions
    handleSearchInput(value) {
        const clearBtn = document.getElementById('clearBtn');
        if (value.length > 0) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    }
    
    performSearch(query, type = 'web') {
        if (!query || query.trim() === '') {
            this.showToast('الرجاء إدخال كلمة بحث');
            return;
        }
        
        query = query.trim();
        
        // Add to history
        if (this.settings.saveHistory) {
            this.addToHistory(query, this.currentEngine);
        }
        
        // Get search URL
        const engine = this.searchEngines[this.currentEngine];
        let searchUrl;
        
        switch (type) {
            case 'image':
                searchUrl = engine.imageUrl + encodeURIComponent(query);
                break;
            case 'video':
                searchUrl = engine.videoUrl + encodeURIComponent(query);
                break;
            case 'news':
                searchUrl = engine.newsUrl + encodeURIComponent(query);
                break;
            case 'maps':
                searchUrl = engine.mapsUrl + encodeURIComponent(query);
                break;
            default:
                searchUrl = engine.url + encodeURIComponent(query);
        }
        
        // Open in new tab
        window.open(searchUrl, '_blank');
        
        // Clear input
        document.getElementById('searchInput').value = '';
        document.getElementById('clearBtn').classList.remove('visible');
    }
    
    performSpecialSearch(type) {
        const query = document.getElementById('searchInput').value;
        if (!query || query.trim() === '') {
            this.showToast('الرجاء إدخال كلمة بحث');
            return;
        }
        this.performSearch(query, type);
    }
    
    selectEngine(engine) {
        this.currentEngine = engine;
        
        // Update UI
        const engineBtns = document.querySelectorAll('.engine-btn');
        engineBtns.forEach(btn => {
            if (btn.dataset.engine === engine) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Voice Search
    startVoiceSearch() {
        if (!this.settings.voiceSearch) {
            this.showToast('البحث الصوتي معطل في الإعدادات');
            return;
        }
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showToast('البحث الصوتي غير مدعوم في هذا المتصفح');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.lang = this.settings.language === 'ar' ? 'ar-SA' : 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onstart = () => {
            document.getElementById('voiceModal').classList.add('visible');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('searchInput').value = transcript;
            document.getElementById('clearBtn').classList.add('visible');
            this.stopVoiceSearch();
            this.performSearch(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopVoiceSearch();
            this.showToast('حدث خطأ في البحث الصوتي');
        };
        
        this.recognition.onend = () => {
            this.stopVoiceSearch();
        };
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showToast('تعذر بدء البحث الصوتي');
        }
    }
    
    stopVoiceSearch() {
        if (this.recognition) {
            this.recognition.stop();
        }
        document.getElementById('voiceModal').classList.remove('visible');
    }
    
    // History Management
    addToHistory(query, engine) {
        const historyItem = {
            id: Date.now(),
            query: query,
            engine: engine,
            timestamp: new Date().toISOString()
        };
        
        // Remove duplicates
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift(historyItem);
        
        // Limit to 50 items
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveHistory();
        this.renderHistory();
    }
    
    removeFromHistory(id) {
        this.searchHistory = this.searchHistory.filter(item => item.id !== id);
        this.saveHistory();
        this.renderHistory();
    }
    
    clearHistory() {
        if (confirm('هل تريد مسح سجل البحث بالكامل؟')) {
            this.searchHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('تم مسح سجل البحث');
        }
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const historySection = document.getElementById('historySection');
        
        if (this.searchHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">لا يوجد سجل بحث</div>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.searchHistory.map(item => {
            const timeAgo = this.getTimeAgo(new Date(item.timestamp));
            return `
                <div class="history-item" data-query="${item.query}">
                    <div class="history-icon">🔍</div>
                    <div class="history-content">
                        <div class="history-query">${this.escapeHtml(item.query)}</div>
                        <div class="history-time">${timeAgo} • ${this.searchEngines[item.engine].name}</div>
                    </div>
                    <button class="history-delete" data-id="${item.id}" aria-label="حذف">🗑️</button>
                </div>
            `;
        }).join('');
        
        // Add event listeners
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('history-delete')) {
                    const query = item.dataset.query;
                    document.getElementById('searchInput').value = query;
                    document.getElementById('clearBtn').classList.add('visible');
                    this.performSearch(query);
                }
            });
        });
        
        historyList.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromHistory(parseInt(btn.dataset.id));
            });
        });
    }
    
    // Favorites Management
    renderFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        
        if (this.favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⭐</div>
                    <div class="empty-text">لا توجد مفضلة</div>
                </div>
            `;
            return;
        }
        
        favoritesGrid.innerHTML = this.favorites.map(item => `
            <a href="${item.url}" target="_blank" class="favorite-item">
                <div class="favorite-icon">${item.icon}</div>
                <div class="favorite-title">${this.escapeHtml(item.title)}</div>
            </a>
        `).join('');
    }
    
    // Settings Management
    openSettings() {
        const modal = document.getElementById('settingsModal');
        
        // Populate settings
        document.getElementById('defaultEngineSelect').value = this.settings.defaultEngine;
        document.getElementById('saveHistoryCheckbox').checked = this.settings.saveHistory;
        document.getElementById('voiceSearchCheckbox').checked = this.settings.voiceSearch;
        document.getElementById('darkModeCheckbox').checked = this.settings.darkMode;
        document.getElementById('languageSelect').value = this.settings.language;
        
        modal.classList.add('visible');
    }
    
    saveSettingsFromModal() {
        this.settings.defaultEngine = document.getElementById('defaultEngineSelect').value;
        this.settings.saveHistory = document.getElementById('saveHistoryCheckbox').checked;
        this.settings.voiceSearch = document.getElementById('voiceSearchCheckbox').checked;
        this.settings.darkMode = document.getElementById('darkModeCheckbox').checked;
        this.settings.language = document.getElementById('languageSelect').value;
        
        this.saveSettings();
        this.applySettings();
        
        document.getElementById('settingsModal').classList.remove('visible');
        this.showToast('تم حفظ الإعدادات');
    }
    
    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Apply default engine
        this.selectEngine(this.settings.defaultEngine);
        
        // Apply language
        if (this.settings.language === 'en') {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
        } else {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
        }
    }
    
    // Utility Functions
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('visible');
        
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'الآن';
        if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
        if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
        if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.searchAgent = new SearchAgent();
    });
} else {
    window.searchAgent = new SearchAgent();
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
