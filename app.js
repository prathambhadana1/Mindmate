// MindMate Mental Health PWA with REAL Gemini AI Integration
// Enhanced with contextual AI responses, mood insights, and crisis detection
// NEW FEATURES: Enhanced colors, new games, progress charts, gratitude wall, dark mode, smart tips
// NAVIGATION FIXED

import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI Configuration - PRESERVED EXACTLY
const GEMINI_API_KEY = 'AIzaSyDnHXO2l_EJjVnJB0_67hZ20Onz83xjP58';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Global App State - ENHANCED but preserved existing structure
let appState = {
    user: {
        name: 'User',
        age: null, // NEW
        gender: null, // NEW
        goals: 'general'
    },
    currentPage: 'dashboardPage',
    moodEntries: [],
    journalEntries: [],
    chatHistory: [],
    currentPersonality: 'maya',
    achievements: [],
    streakCount: 0,
    settings: {
        reminders: true,
        privacy: false,
        smartCheckins: false // NEW
    },
    lastCheckIn: null,
    installPromptEvent: null,
    gamesPlayed: [],
    aiEnabled: true,
    lastAiError: null,
    gratitudeEntries: [], // NEW
    darkMode: false, // NEW
    currentBreathingPattern: '4-7-8' // NEW
};

// Enhanced Colors - NEW ADDITION
const enhancedColors = {
    mint: '#A8E6CF',
    lavender: '#E6E6FA', 
    peach: '#FFE5B4',
    coral: '#FFB6C1'
};

// Breathing Patterns - NEW ADDITION
const breathingPatterns = {
    '4-7-8': { name: '4-7-8', inhale: 4, hold: 7, exhale: 8 },
    'box': { name: 'Box', inhale: 4, hold: 4, exhale: 4, pause: 4 },
    'simple': { name: 'Simple', inhale: 4, exhale: 6 }
};

// Mood-based Tips - NEW ADDITION
const moodTips = {
    'happy': "Keep nurturing what makes you feel good!",
    'good': "You're doing great! Maintain this positive momentum.",
    'okay': "It's okay to feel neutral. Every day doesn't need to be perfect.",
    'down': "It's okay to feel sad. Be gentle with yourself.",
    'anxious': "Try the 5-4-3-2-1 grounding technique when you feel overwhelmed."
};

// AI Personality System Prompts - PRESERVED EXACTLY
const aiPersonalities = {
    maya: {
        name: "Maya",
        role: "Supportive Friend", 
        avatar: "👩‍🦱",
        systemPrompt: `You are Maya, a warm and empathetic mental health companion. You should respond like a caring friend who listens without judgment. 

IMPORTANT GUIDELINES:
- Keep responses supportive, understanding, and encouraging
- Ask follow-up questions to show you care
- Avoid giving medical advice but offer emotional support and coping strategies
- Be conversational and use a friendly, warm tone
- Keep responses concise (2-3 sentences typically)
- If someone mentions crisis keywords like suicide, self-harm, or hopelessness, express concern and encourage seeking professional help
- Reference their mood or journal entries when relevant for personalized support

You have access to the user's recent mood and journal data for context. Always be compassionate and focus on emotional wellbeing.`
    },
    alex: {
        name: "Dr. Alex",
        role: "Mental Health Professional",
        avatar: "👨‍⚕️",
        systemPrompt: `You are Dr. Alex, a compassionate mental health professional. Provide evidence-based emotional support and coping strategies.

IMPORTANT GUIDELINES:
- Be professional but warm and approachable
- Suggest breathing exercises, mindfulness techniques, and healthy coping strategies
- Always encourage seeking professional help for serious concerns
- Use clinical knowledge but explain in accessible terms
- Keep responses educational and supportive
- If someone mentions crisis keywords, immediately express concern and provide resources
- Reference CBT, DBT, and other evidence-based approaches when appropriate

You have access to the user's mood and journal history for personalized therapeutic support. Focus on practical, evidence-based mental health strategies.`
    },
    sage: {
        name: "Sage", 
        role: "Mindfulness Guide",
        avatar: "🧘‍♀️",
        systemPrompt: `You are Sage, a mindfulness and meditation guide. Focus on present-moment awareness, breathing techniques, and inner peace.

IMPORTANT GUIDELINES:
- Offer gentle wisdom about acceptance, letting go, and finding calm
- Guide users through mindfulness exercises when appropriate
- Use calming, centered language
- Focus on breathing, meditation, and present-moment awareness
- Share simple wisdom about managing difficult emotions
- Encourage self-compassion and non-judgmental awareness
- If crisis keywords are mentioned, respond with compassionate concern and resources

You have access to the user's emotional state for personalized mindfulness guidance. Help them find peace and balance in the present moment.`
    }
};

// Crisis Detection Keywords - PRESERVED EXACTLY
const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'don\'t want to live', 'hurt myself',
    'hopeless', 'no point', 'better off dead', 'can\'t go on', 'self harm',
    'want to die', 'ending it', 'not worth living', 'give up completely'
];

// AI Service Functions - PRESERVED EXACTLY
class MindMateAI {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.conversationHistory = new Map();
    }

    // Build context from user data - PRESERVED EXACTLY
    buildUserContext() {
        const recentMoods = appState.moodEntries.slice(-3);
        const recentJournals = appState.journalEntries.slice(-2);
        
        let context = `User Context:\n`;
        context += `Name: ${appState.user.name}\n`;
        context += `Mental Health Goal: ${appState.user.goals}\n`;
        context += `Streak: ${appState.streakCount} days\n\n`;
        
        if (recentMoods.length > 0) {
            context += `Recent Mood Entries:\n`;
            recentMoods.forEach(mood => {
                const date = new Date(mood.timestamp).toLocaleDateString();
                if (mood.type === 'quick') {
                    context += `- ${date}: Quick mood - ${mood.mood}\n`;
                } else {
                    const moodSummary = Object.entries(mood)
                        .filter(([key, value]) => ['happiness', 'sadness', 'anxiety', 'stress', 'energy'].includes(key))
                        .map(([key, value]) => `${key}: ${value}/10`)
                        .join(', ');
                    context += `- ${date}: ${moodSummary}\n`;
                    if (mood.notes) context += `  Notes: ${mood.notes}\n`;
                }
            });
            context += `\n`;
        }
        
        if (recentJournals.length > 0) {
            context += `Recent Journal Entries:\n`;
            recentJournals.forEach(journal => {
                const date = new Date(journal.timestamp).toLocaleDateString();
                context += `- ${date}: "${journal.title}"\n`;
                context += `  ${journal.content.substring(0, 200)}...\n`;
            });
        }
        
        return context;
    }

    // Check for crisis content - PRESERVED EXACTLY
    detectCrisis(text) {
        const lowerText = text.toLowerCase();
        return crisisKeywords.some(keyword => lowerText.includes(keyword));
    }

    // Generate crisis response - PRESERVED EXACTLY
    getCrisisResponse() {
        return `I'm really concerned about what you've shared. Your life has value and meaning, even when it doesn't feel that way. Please reach out for immediate help - you don't have to go through this alone.

**Crisis Resources (India):**
• National Suicide Prevention: 1800-599-0019 (24/7)
• Vandrevala Foundation: 9999666555 (24/7) 
• AASRA: 022-27546669 (24/7)

Would you like to talk about what's bringing up these feelings? I'm here to listen and support you. 💙`;
    }

    // Main AI chat function - PRESERVED EXACTLY
    async chat(message, personalityId = 'maya') {
        try {
            updateAiStatus('loading', '🤖 AI Thinking...');

            // Crisis detection
            if (this.detectCrisis(message)) {
                updateAiStatus('ready', '🤖 AI Ready');
                return this.getCrisisResponse();
            }

            const personality = aiPersonalities[personalityId];
            const context = this.buildUserContext();
            
            // Get or create conversation history for this personality
            if (!this.conversationHistory.has(personalityId)) {
                this.conversationHistory.set(personalityId, []);
            }
            
            const history = this.conversationHistory.get(personalityId);
            
            // Build full prompt
            let prompt = personality.systemPrompt + '\n\n' + context + '\n\n';
            
            // Add recent conversation history (last 6 messages)
            if (history.length > 0) {
                prompt += 'Recent Conversation:\n';
                history.slice(-6).forEach(msg => {
                    prompt += `${msg.role}: ${msg.content}\n`;
                });
                prompt += '\n';
            }
            
            prompt += `User: ${message}\n\nRespond as ${personality.name} in character. Keep your response conversational, supportive, and under 150 words.`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text().trim();

            // Update conversation history
            history.push({ role: 'User', content: message });
            history.push({ role: personality.name, content: response });

            // Keep only last 10 exchanges
            if (history.length > 20) {
                this.conversationHistory.set(personalityId, history.slice(-20));
            }

            updateAiStatus('ready', '🤖 AI Ready');
            return response;

        } catch (error) {
            console.error('AI Chat Error:', error);
            updateAiStatus('error', '🤖 AI Offline');
            return this.getOfflineResponse(personalityId);
        }
    }

    // Generate mood insights - PRESERVED EXACTLY
    async getMoodInsights(moodData) {
        try {
            const context = this.buildUserContext();
            
            let moodDescription = '';
            if (moodData.type === 'quick') {
                moodDescription = `Quick mood: ${moodData.mood}`;
            } else {
                const scores = ['happiness', 'sadness', 'anxiety', 'stress', 'energy']
                    .map(key => `${key}: ${moodData[key]}/10`)
                    .join(', ');
                moodDescription = scores;
                if (moodData.notes) {
                    moodDescription += `\nNotes: ${moodData.notes}`;
                }
            }

            const prompt = `You are a compassionate AI mental health companion. Analyze this mood entry and provide supportive insights.

${context}

Current Mood Entry: ${moodDescription}

Provide a brief, encouraging analysis (2-3 sentences) that:
- Acknowledges their current emotional state
- Offers gentle insights or observations
- Suggests a small, actionable step for wellbeing
- Is warm and non-judgmental

Keep it personal and supportive, under 100 words.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();

        } catch (error) {
            console.error('Mood Insights Error:', error);
            return "Your mood matters, and tracking it shows self-awareness and courage. Every feeling is valid - both the difficult and joyful ones contribute to your personal growth journey. 💙";
        }
    }

    // Generate journal prompts - PRESERVED EXACTLY
    async generateJournalPrompt() {
        try {
            const context = this.buildUserContext();
            
            const prompt = `You are a compassionate AI mental health companion. Generate a personalized journal prompt based on the user's recent emotional state and history.

${context}

Create ONE thoughtful journal prompt that:
- Is relevant to their recent mood/experiences
- Encourages self-reflection and growth
- Is specific and engaging
- Feels personal and supportive
- Promotes emotional wellness

Just return the prompt question/statement, nothing else. Keep it under 50 words.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();

        } catch (error) {
            console.error('Journal Prompt Error:', error);
            const fallbackPrompts = [
                "What's one thing you learned about yourself today?",
                "How did you show kindness to yourself or others recently?",
                "What emotions did you feel most strongly today, and what might they be telling you?",
                "Describe a moment when you felt truly present today.",
                "What support do you need right now, and how can you ask for it?"
            ];
            return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
        }
    }

    // Generate journal feedback - PRESERVED EXACTLY
    async getJournalFeedback(title, content) {
        try {
            if (!content.trim()) {
                return "I'd love to provide feedback once you've written something. Take your time - there's no pressure. 💙";
            }

            const context = this.buildUserContext();
            
            const prompt = `You are a compassionate AI mental health companion providing supportive feedback on a journal entry.

${context}

Journal Entry:
Title: ${title}
Content: ${content}

Provide gentle, supportive feedback (3-4 sentences) that:
- Acknowledges their courage in sharing/writing
- Highlights positive elements or insights
- Offers gentle encouragement or reflection
- Suggests a follow-up question or thought if appropriate
- Is warm, non-judgmental, and emotionally supportive

Keep it personal and under 120 words.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();

        } catch (error) {
            console.error('Journal Feedback Error:', error);
            return "Thank you for sharing your thoughts with me. Writing takes courage, and you're taking meaningful steps in your mental health journey. Keep exploring your feelings through journaling - it's a powerful tool for self-discovery. 💙";
        }
    }

    // Get daily inspiration with AI - PRESERVED EXACTLY
    async getDailyInspiration() {
        try {
            const context = this.buildUserContext();
            
            const prompt = `Generate a brief, uplifting message for someone on their mental health journey.

${context}

Create a personalized, encouraging message (1-2 sentences) that:
- Is relevant to their current emotional state
- Feels genuine and supportive
- Promotes hope and resilience
- Is warm and understanding

Keep it under 50 words and avoid generic platitudes.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text().trim();

        } catch (error) {
            console.error('Daily Inspiration Error:', error);
            return "Every step you take in caring for your mental health matters. You're stronger than you know, and you're not walking this path alone. 💙";
        }
    }

    // Offline responses - PRESERVED EXACTLY
    getOfflineResponse(personalityId) {
        const personality = aiPersonalities[personalityId];
        const offlineResponses = {
            maya: [
                "I'm having trouble connecting right now, but I want you to know I'm here for you. 💙",
                "Even when I'm offline, remember that your feelings are valid and you're not alone.",
                "Connection issues aside, you're doing great by reaching out. Keep going! ✨"
            ],
            alex: [
                "I'm experiencing technical difficulties, but I encourage you to practice deep breathing while we reconnect.",
                "While I'm offline, remember: you have the strength to get through difficult moments.",
                "Technical issues happen, but your mental health journey continues. You've got this."
            ],
            sage: [
                "Even in this moment of disconnection, you can find peace in your breath. 🧘‍♀️",
                "When technology fails, your inner wisdom remains. Trust yourself.",
                "This pause reminds us that connection comes from within first. Be gentle with yourself."
            ]
        };
        
        const responses = offlineResponses[personalityId] || offlineResponses.maya;
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize AI - PRESERVED EXACTLY
const mindMateAI = new MindMateAI();

// App Data - ENHANCED with new games
const appData = {
    moodCategories: [
        {"id": "happiness", "name": "Happiness", "emoji": "😊", "default": 5},
        {"id": "sadness", "name": "Sadness", "emoji": "😢", "default": 3},
        {"id": "anxiety", "name": "Anxiety", "emoji": "😰", "default": 4},
        {"id": "stress", "name": "Stress", "emoji": "😤", "default": 4},
        {"id": "energy", "name": "Energy", "emoji": "⚡", "default": 5}
    ],

    achievements: [
        {id: "first-entry", name: "First Steps", description: "Wrote your first journal entry", icon: "🌟", points: 10},
        {id: "week-streak", name: "Week Warrior", description: "Maintained a 7-day check-in streak", icon: "🏆", points: 50},
        {id: "mood-tracker", name: "Mood Master", description: "Tracked mood for 30 days", icon: "📊", points: 100},
        {id: "game-player", name: "Wellness Gamer", description: "Played all therapeutic games", icon: "🎮", points: 75},
        {id: "chat-explorer", name: "Chat Champion", description: "Had conversations with all AI personalities", icon: "💬", points: 60},
        {id: "ai-friend", name: "AI Companion", description: "Had meaningful AI conversations", icon: "🤖", points: 40},
        {id: "gratitude-master", name: "Gratitude Master", description: "Added 10 gratitude entries", icon: "🙏", points: 30}, // NEW
        {id: "grounding-expert", name: "Grounding Expert", description: "Completed 5 grounding exercises", icon: "🌱", points: 25} // NEW
    ],
    
    inspirationalQuotes: [
        "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives. - William James",
        "You are not your illness. You have an individual story to tell. You have a name, a history, a personality. Staying yourself is part of the battle. - Julian Seifter",
        "Healing takes time, and asking for help is a courageous step. - Mariska Hargitay",
        "Mental health is not a destination, but a process. It's about how you drive, not where you're going. - Noam Shpancer",
        "Your current situation is not your final destination. The best is yet to come. - Unknown"
    ]
};

// PWA Installation - PRESERVED EXACTLY
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt && !localStorage.getItem('installDismissed')) {
        setTimeout(() => {
            installPrompt.classList.remove('hidden');
        }, 5000);
    }
}

window.installApp = function() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            document.getElementById('installPrompt').classList.add('hidden');
        });
    }
};

window.dismissInstall = function() {
    document.getElementById('installPrompt').classList.add('hidden');
    localStorage.setItem('installDismissed', 'true');
};

window.dismissApiWarning = function() {
    const warning = document.getElementById('apiWarning');
    if (warning) {
        warning.classList.add('hidden');
        setTimeout(() => warning.remove(), 300);
    }
};

// Dark Mode Toggle - NEW FEATURE
window.toggleDarkMode = function() {
    appState.darkMode = !appState.darkMode;
    const body = document.body;
    const toggleBtn = document.getElementById('darkModeToggle');
    
    if (appState.darkMode) {
        body.setAttribute('data-theme', 'dark');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        body.removeAttribute('data-theme');
        if (toggleBtn) toggleBtn.textContent = '🌙';
    }
    
    saveAppState();
    showToast(`${appState.darkMode ? 'Dark' : 'Light'} mode enabled`);
};

// AI Status Management - PRESERVED EXACTLY
function updateAiStatus(status, text) {
    const statusEl = document.getElementById('aiStatus');
    if (statusEl) {
        statusEl.textContent = text;
        statusEl.className = `ai-status ${status}`;
    }
}

// Initialize App - ENHANCED
document.addEventListener('DOMContentLoaded', () => {
    loadAppState();
    initializeApp();
    setupEventListeners();
    setupTouchGestures();
    
    // Test AI connection
    testAiConnection();
    
    // Apply saved dark mode
    if (appState.darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    }
});

async function testAiConnection() {
    try {
        await mindMateAI.model.generateContent("Hello");
        updateAiStatus('ready', '🤖 AI Ready');
        appState.aiEnabled = true;
    } catch (error) {
        console.error('AI Connection Test Failed:', error);
        updateAiStatus('error', '🤖 AI Offline');
        appState.aiEnabled = false;
        appState.lastAiError = error.message;
    }
}

function initializeApp() {
    updateGreeting();
    updateDashboard();
    checkStreak();
    loadMoodHistory();
    loadJournalEntries();
    loadChatHistory();
    loadAchievements();
    setupMoodSliders();
    loadGratitudeEntries(); // NEW
    
    showPage('dashboardPage');
    
    // Auto-dismiss API warning after 10 seconds
    setTimeout(() => {
        dismissApiWarning();
    }, 10000);
}

// Local Storage Management - PRESERVED EXACTLY
function saveAppState() {
    try {
        const stateToSave = { ...appState };
        delete stateToSave.lastAiError; // Don't persist errors
        localStorage.setItem('mindmate_state', JSON.stringify(stateToSave));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadAppState() {
    try {
        const saved = localStorage.getItem('mindmate_state');
        if (saved) {
            const savedState = JSON.parse(saved);
            appState = { ...appState, ...savedState };
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// Navigation - FIXED AND ENHANCED
window.showPage = function(pageId) {
    console.log('Navigating to:', pageId);
    
    // Remove active class from all pages and nav buttons
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page activated:', pageId);
    } else {
        console.error('Page not found:', pageId);
        return;
    }
    
    // Highlight corresponding nav button based on page
    const navMapping = {
        'dashboardPage': 0,
        'moodPage': 1,
        'journalPage': 2,
        'chatPage': 3,
        'profilePage': 4
    };
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const navIndex = navMapping[pageId];
    if (navIndex !== undefined && navButtons[navIndex]) {
        navButtons[navIndex].classList.add('active');
    }
    
    // Update header title
    const titles = {
        'dashboardPage': 'MindMate',
        'moodPage': 'AI Mood Tracker',
        'journalPage': 'AI Journal',
        'chatPage': 'Gemini AI Chat',
        'gamesPage': 'Wellness Games',
        'profilePage': 'Profile',
        'progressPage': 'Your Progress', // NEW
        'resourcesPage': 'Resources Hub' // NEW
    };
    
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
        headerTitle.textContent = titles[pageId] || 'MindMate';
    }
    
    appState.currentPage = pageId;
    
    // Load page-specific data
    switch(pageId) {
        case 'moodPage':
            setupMoodSliders();
            loadMoodHistory();
            break;
        case 'journalPage':
            loadJournalEntries();
            break;
        case 'chatPage':
            loadChatHistory();
            break;
        case 'profilePage':
            loadAchievements();
            break;
        case 'progressPage': // NEW
            loadProgressCharts();
            break;
        case 'resourcesPage': // NEW
            // Resources are static, no loading needed
            break;
        case 'gamesPage':
            // Games load when clicked
            break;
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    saveAppState();
};

// Dashboard Functions - PRESERVED EXACTLY
function updateGreeting() {
    const hour = new Date().getHours();
    const name = appState.user?.name || 'there';
    let greeting, emoji, subtext;
    
    if (hour < 12) {
        greeting = `Good morning, ${name}!`;
        emoji = '🌅';
        subtext = 'Ready to start your day mindfully?';
    } else if (hour < 17) {
        greeting = `Good afternoon, ${name}!`;
        emoji = '☀️';
        subtext = 'How has your day been so far?';
    } else {
        greeting = `Good evening, ${name}!`;
        emoji = '🌙';
        subtext = 'Time to reflect on your day';
    }
    
    const greetingText = document.getElementById('greetingText');
    const greetingSubtext = document.getElementById('greetingSubtext');
    
    if (greetingText) greetingText.textContent = `${greeting} ${emoji}`;
    if (greetingSubtext) greetingSubtext.textContent = subtext;
}

async function updateDashboard() {
    // Update stats
    const streakCount = document.getElementById('streakCount');
    if (streakCount) streakCount.textContent = appState.streakCount;
    
    const journalCount = document.getElementById('journalCount');
    if (journalCount) journalCount.textContent = appState.journalEntries.length;
    
    // Get AI-powered inspiration if enabled
    if (appState.aiEnabled) {
        try {
            const aiInspiration = await mindMateAI.getDailyInspiration();
            const inspirationText = document.getElementById('inspirationText');
            if (inspirationText) inspirationText.textContent = aiInspiration;
        } catch (error) {
            console.error('Failed to get AI inspiration:', error);
            // Fallback to static quotes
            const randomQuote = appData.inspirationalQuotes[Math.floor(Math.random() * appData.inspirationalQuotes.length)];
            const inspirationText = document.getElementById('inspirationText');
            if (inspirationText) inspirationText.textContent = randomQuote;
        }
    } else {
        // Use static quotes when AI is offline
        const randomQuote = appData.inspirationalQuotes[Math.floor(Math.random() * appData.inspirationalQuotes.length)];
        const inspirationText = document.getElementById('inspirationText');
        if (inspirationText) inspirationText.textContent = randomQuote;
    }
}

// Quick Mood Function - ENHANCED with smart tips
window.quickMood = async function(moodType) {
    const moodData = {
        timestamp: Date.now(),
        type: 'quick',
        mood: moodType,
        date: new Date().toDateString()
    };
    
    appState.moodEntries.push(moodData);
    checkStreak();
    saveAppState();
    
    // Visual feedback
    const clickedBtn = event.target.closest('.mood-btn');
    if (clickedBtn) {
        clickedBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            clickedBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
    }
    
    // Show smart tip - NEW FEATURE
    const smartTip = moodTips[moodType];
    if (smartTip) {
        const aiInsightCard = document.getElementById('aiInsightCard');
        const aiInsightText = document.getElementById('aiInsightText');
        
        if (aiInsightCard && aiInsightText) {
            aiInsightCard.style.display = 'block';
            aiInsightText.textContent = `💡 ${smartTip}`;
        }
    }
    
    // Get AI insights for quick mood
    if (appState.aiEnabled) {
        try {
            const aiInsightCard = document.getElementById('aiInsightCard');
            const aiInsightText = document.getElementById('aiInsightText');
            
            if (aiInsightCard && aiInsightText) {
                aiInsightCard.style.display = 'block';
                aiInsightText.textContent = 'Getting personalized insight...';
                
                const insight = await mindMateAI.getMoodInsights(moodData);
                aiInsightText.textContent = insight;
            }
        } catch (error) {
            console.error('Failed to get mood insights:', error);
        }
    }
    
    showToast(`Mood logged: ${moodType}`);
    updateDashboard();
    checkAchievements();
};

// Mood Tracking - PRESERVED EXACTLY
function setupMoodSliders() {
    const sliders = ['happiness', 'sadness', 'anxiety', 'stress', 'energy'];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(`${sliderId}-value`);
        
        if (slider && valueDisplay) {
            const moodCategory = appData.moodCategories.find(m => m.id === sliderId);
            if (moodCategory) {
                slider.value = moodCategory.default;
                valueDisplay.textContent = moodCategory.default;
            }
            
            slider.removeEventListener('input', handleSliderChange);
            slider.addEventListener('input', handleSliderChange);
        }
    });
}

function handleSliderChange(e) {
    const sliderId = e.target.id;
    const value = e.target.value;
    const valueDisplay = document.getElementById(`${sliderId}-value`);
    
    if (valueDisplay) {
        valueDisplay.textContent = value;
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }
}

// Save Mood Entry - ENHANCED with smart tips
window.saveMoodEntry = async function() {
    const sliders = ['happiness', 'sadness', 'anxiety', 'stress', 'energy'];
    const moodData = {
        timestamp: Date.now(),
        date: new Date().toDateString(),
        type: 'detailed'
    };
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            moodData[sliderId] = parseInt(slider.value);
        }
    });
    
    const notesElement = document.getElementById('moodNotes');
    const notes = notesElement ? notesElement.value.trim() : '';
    if (notes) {
        moodData.notes = notes;
    }
    
    appState.moodEntries.push(moodData);
    checkStreak();
    saveAppState();
    
    // Show loading state
    const saveBtn = document.getElementById('saveMoodBtn');
    const saveText = document.getElementById('saveMoodText');
    const spinner = document.getElementById('moodSpinner');
    
    if (saveBtn && saveText && spinner) {
        saveBtn.disabled = true;
        saveText.style.display = 'none';
        spinner.style.display = 'inline-block';
    }
    
    // Show smart tip based on mood - NEW FEATURE
    showSmartTip(moodData);
    
    // Get AI insights
    if (appState.aiEnabled) {
        try {
            const insight = await mindMateAI.getMoodInsights(moodData);
            const aiInsightEl = document.getElementById('moodAiInsight');
            const aiInsightContent = document.getElementById('moodAiInsightContent');
            
            if (aiInsightEl && aiInsightContent) {
                aiInsightContent.textContent = insight;
                aiInsightEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to get mood insights:', error);
        }
    }
    
    // Reset button
    if (saveBtn && saveText && spinner) {
        saveBtn.disabled = false;
        saveText.style.display = 'inline';
        spinner.style.display = 'none';
    }
    
    // Reset form
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(`${sliderId}-value`);
        const moodCategory = appData.moodCategories.find(m => m.id === sliderId);
        if (slider && valueDisplay && moodCategory) {
            slider.value = moodCategory.default;
            valueDisplay.textContent = moodCategory.default;
        }
    });
    if (notesElement) notesElement.value = '';
    
    loadMoodHistory();
    showToast('Mood tracked with AI insights!');
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    checkAchievements();
};

// Smart Tips Function - NEW FEATURE
function showSmartTip(moodData) {
    let tipType = 'okay';
    
    // Determine tip type based on mood scores
    if (moodData.happiness >= 7) {
        tipType = 'happy';
    } else if (moodData.sadness >= 7) {
        tipType = 'down';
    } else if (moodData.anxiety >= 7) {
        tipType = 'anxious';
    }
    
    const tip = moodTips[tipType];
    if (tip) {
        const smartTipsSection = document.getElementById('smartTipsSection');
        const smartTipContent = document.getElementById('smartTipContent');
        
        if (smartTipsSection && smartTipContent) {
            smartTipContent.textContent = tip;
            smartTipsSection.style.display = 'block';
        }
    }
}

function loadMoodHistory() {
    const container = document.getElementById('moodEntries');
    if (!container) return;
    
    const recentEntries = appState.moodEntries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    
    if (recentEntries.length === 0) {
        container.innerHTML = '<p class="text-center">No mood entries yet. Start tracking your mood above!</p>';
        return;
    }
    
    container.innerHTML = recentEntries.map(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (entry.type === 'quick') {
            return `
                <div class="mood-entry">
                    <div class="mood-entry-date">${date} at ${time}</div>
                    <div class="mood-entry-values">
                        <span class="mood-entry-tag">Quick mood: ${entry.mood}</span>
                    </div>
                </div>
            `;
        } else {
            const values = ['happiness', 'sadness', 'anxiety', 'stress', 'energy']
                .map(key => entry[key] ? `<span class="mood-entry-tag">${key}: ${entry[key]}</span>` : '')
                .filter(v => v)
                .join('');
            
            return `
                <div class="mood-entry">
                    <div class="mood-entry-date">${date} at ${time}</div>
                    <div class="mood-entry-values">${values}</div>
                    ${entry.notes ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: var(--color-text-secondary);">${entry.notes}</p>` : ''}
                </div>
            `;
        }
    }).join('');
}

// Progress Charts - NEW FEATURE
function loadProgressCharts() {
    // Update progress stats
    const progressStreakCount = document.getElementById('progressStreakCount');
    const progressMoodEntries = document.getElementById('progressMoodEntries');
    
    if (progressStreakCount) progressStreakCount.textContent = appState.streakCount;
    if (progressMoodEntries) progressMoodEntries.textContent = appState.moodEntries.length;
    
    // Create mood trend chart
    createMoodTrendChart();
    createWeeklyProgressChart();
}

function createMoodTrendChart() {
    const canvas = document.getElementById('moodTrendChart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    const recentMoods = appState.moodEntries.slice(-7);
    
    const labels = recentMoods.map(entry => {
        const date = new Date(entry.timestamp);
        return date.toLocaleDateString('en', { weekday: 'short' });
    });
    
    const happinessData = recentMoods.map(entry => entry.happiness || 0);
    const anxietyData = recentMoods.map(entry => entry.anxiety || 0);
    const energyData = recentMoods.map(entry => entry.energy || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Happiness',
                data: happinessData,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Anxiety',
                data: anxietyData,
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                fill: false,
                tension: 0.4
            }, {
                label: 'Energy',
                data: energyData,
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Mood Trends (Last 7 Days)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

function createWeeklyProgressChart() {
    const canvas = document.getElementById('weeklyProgressChart');
    if (!canvas || !window.Chart) return;
    
    const ctx = canvas.getContext('2d');
    
    // Count entries by day of week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const entryCounts = new Array(7).fill(0);
    
    appState.moodEntries.forEach(entry => {
        const dayOfWeek = new Date(entry.timestamp).getDay();
        entryCounts[dayOfWeek]++;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: daysOfWeek,
            datasets: [{
                label: 'Mood Entries',
                data: entryCounts,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Activity Pattern'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Journal Functions - PRESERVED EXACTLY
window.saveJournalEntry = async function() {
    const titleElement = document.getElementById('journalTitle');
    const contentElement = document.getElementById('journalContent');
    
    const title = titleElement ? titleElement.value.trim() : '';
    const content = contentElement ? contentElement.value.trim() : '';
    
    const entry = {
        id: Date.now(),
        title: title || 'Untitled Entry',
        content: content || '(No content)',
        timestamp: Date.now(),
        date: new Date().toDateString()
    };
    
    appState.journalEntries.push(entry);
    saveAppState();
    
    // Clear form
    if (titleElement) titleElement.value = '';
    if (contentElement) contentElement.value = '';
    
    loadJournalEntries();
    showToast('Journal entry saved!');
    updateDashboard();
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    checkAchievements();
};

window.clearJournalEditor = function() {
    const titleElement = document.getElementById('journalTitle');
    const contentElement = document.getElementById('journalContent');
    
    if (titleElement) titleElement.value = '';
    if (contentElement) contentElement.value = '';
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
};

window.getAiJournalPrompt = async function() {
    if (!appState.aiEnabled) {
        showToast('AI is currently offline');
        return;
    }
    
    try {
        const prompt = await mindMateAI.generateJournalPrompt();
        const contentElement = document.getElementById('journalContent');
        if (contentElement) {
            contentElement.value = prompt + '\n\n';
            contentElement.focus();
        }
        showToast('AI prompt added to journal!');
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    } catch (error) {
        console.error('Failed to get AI prompt:', error);
        showToast('Failed to get AI prompt. Try again.');
    }
};

window.getAiFeedback = async function() {
    if (!appState.aiEnabled) {
        showToast('AI is currently offline');
        return;
    }
    
    const titleElement = document.getElementById('journalTitle');
    const contentElement = document.getElementById('journalContent');
    
    const title = titleElement ? titleElement.value.trim() : '';
    const content = contentElement ? contentElement.value.trim() : '';
    
    if (!content) {
        showToast('Write something first to get AI feedback');
        return;
    }
    
    try {
        const feedbackSection = document.getElementById('aiFeedbackSection');
        const feedbackContent = document.getElementById('aiFeedbackContent');
        
        if (feedbackSection && feedbackContent) {
            feedbackSection.style.display = 'block';
            feedbackContent.textContent = 'AI is reading your entry and preparing feedback...';
            
            const feedback = await mindMateAI.getJournalFeedback(title, content);
            feedbackContent.textContent = feedback;
        }
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    } catch (error) {
        console.error('Failed to get AI feedback:', error);
        showToast('Failed to get AI feedback. Try again.');
    }
};

function loadJournalEntries() {
    const container = document.getElementById('entriesList');
    if (!container) return;
    
    const entries = appState.journalEntries
        .sort((a, b) => b.timestamp - a.timestamp);
    
    if (entries.length === 0) {
        container.innerHTML = '<p class="text-center">No journal entries yet. Start writing your thoughts above!</p>';
        return;
    }
    
    container.innerHTML = entries.map(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
        
        return `
            <div class="journal-entry" onclick="viewJournalEntry(${entry.id})">
                <div class="journal-entry-header">
                    <h4 class="journal-entry-title">${entry.title}</h4>
                    <span class="journal-entry-date">${date}</span>
                </div>
                <p class="journal-entry-preview">${preview}</p>
                <div class="journal-entry-actions" onclick="event.stopPropagation()">
                    <button class="journal-entry-action" onclick="editJournalEntry(${entry.id})">✏️ Edit</button>
                    <button class="journal-entry-action" onclick="deleteJournalEntry(${entry.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

window.viewJournalEntry = function(id) {
    const entry = appState.journalEntries.find(e => e.id === id);
    if (!entry) return;
    
    const titleElement = document.getElementById('journalTitle');
    const contentElement = document.getElementById('journalContent');
    
    if (titleElement) titleElement.value = entry.title;
    if (contentElement) contentElement.value = entry.content;
    
    const journalPage = document.getElementById('journalPage');
    if (journalPage) journalPage.scrollTop = 0;
};

window.editJournalEntry = function(id) {
    const entry = appState.journalEntries.find(e => e.id === id);
    if (!entry) return;
    
    const titleElement = document.getElementById('journalTitle');
    const contentElement = document.getElementById('journalContent');
    
    if (titleElement) titleElement.value = entry.title;
    if (contentElement) contentElement.value = entry.content;
    
    deleteJournalEntry(id, false);
    
    const journalPage = document.getElementById('journalPage');
    if (journalPage) journalPage.scrollTop = 0;
};

window.deleteJournalEntry = function(id, confirm = true) {
    if (confirm && !window.confirm('Are you sure you want to delete this entry?')) {
        return;
    }
    
    appState.journalEntries = appState.journalEntries.filter(e => e.id !== id);
    saveAppState();
    loadJournalEntries();
    updateDashboard();
    
    if (confirm) {
        showToast('Journal entry deleted');
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }
};

// AI Chat Functions - PRESERVED EXACTLY
window.switchPersonality = function() {
    const select = document.getElementById('chatPersonality');
    if (select) {
        appState.currentPersonality = select.value;
        saveAppState();
        
        const personality = aiPersonalities[appState.currentPersonality];
        if (personality) {
            addChatMessage(`Switched to ${personality.name} - ${personality.role} ${personality.avatar}`, 'system');
        }
    }
};

window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const typingIndicator = document.getElementById('typingIndicator');
    
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Disable input while processing
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    if (typingIndicator) {
        typingIndicator.style.display = 'flex';
    }
    
    try {
        // Get AI response
        const response = await mindMateAI.chat(message, appState.currentPersonality);
        
        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // Add AI response
        addChatMessage(response, 'ai');
        
    } catch (error) {
        console.error('Chat Error:', error);
        
        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // Show error message
        const personality = aiPersonalities[appState.currentPersonality];
        const errorMsg = mindMateAI.getOfflineResponse(appState.currentPersonality);
        addChatMessage(errorMsg, 'ai');
    } finally {
        // Re-enable input
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    checkAchievements();
};

function addChatMessage(content, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const contentP = document.createElement('p');
    contentP.className = 'chat-message-content';
    contentP.textContent = content;
    messageDiv.appendChild(contentP);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to chat history
    appState.chatHistory.push({
        content,
        sender,
        timestamp: Date.now(),
        personality: appState.currentPersonality
    });
    
    saveAppState();
}

function loadChatHistory() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    if (appState.chatHistory.length === 0) {
        const personality = aiPersonalities[appState.currentPersonality];
        if (personality) {
            addChatMessage(`Hello! I'm ${personality.name}, your ${personality.role.toLowerCase()}. ${personality.avatar} I have context about your recent mood and journal entries to provide personalized support. How can I help you today?`, 'ai');
        }
    } else {
        const recentMessages = appState.chatHistory.slice(-10);
        recentMessages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.sender}`;
            
            const contentP = document.createElement('p');
            contentP.className = 'chat-message-content';
            contentP.textContent = message.content;
            messageDiv.appendChild(contentP);
            
            messagesContainer.appendChild(messageDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Wellness Games - ENHANCED with new games
window.startGame = function(gameId) {
    const modal = document.getElementById('gameModal');
    const container = document.getElementById('gameContainer');
    const title = document.getElementById('gameModalTitle');
    
    const games = {
        'breathing': 'Breathing Exercise',
        'grounding': '5-4-3-2-1 Grounding', // NEW
        'memory-match': 'Memory Cards', // NEW  
        'bubble-pop': 'Bubble Pop', // NEW
        'doodle-pad': 'Art Therapy', // NEW
        'bubbles': 'Stress Relief Bubbles',
        'gratitude': 'Gratitude Tree',
        'worry-box': 'Digital Worry Box'
    };
    
    if (title) title.textContent = games[gameId] || 'Wellness Game';
    
    if (container) {
        switch(gameId) {
            case 'breathing':
                container.innerHTML = createBreathingGame();
                break;
            case 'grounding': // NEW
                container.innerHTML = createGroundingGame();
                break;
            case 'memory-match': // NEW
                container.innerHTML = createMemoryMatchGame();
                break;
            case 'bubble-pop': // NEW
                container.innerHTML = createBubblePopGame();
                break;
            case 'doodle-pad': // NEW
                container.innerHTML = createDoodlePadGame();
                break;
            case 'bubbles':
                container.innerHTML = createStressBubbles();
                break;
            case 'gratitude':
                container.innerHTML = createGratitudeTree();
                break;
            case 'worry-box':
                container.innerHTML = createWorryBox();
                break;
        }
    }
    
    if (modal) modal.classList.remove('hidden');
    
    // Initialize game-specific functionality
    setTimeout(() => {
        if (gameId === 'doodle-pad') {
            initDoodlePad();
        } else if (gameId === 'bubble-pop') {
            createMoreBubbles();
        } else if (gameId === 'memory-match') {
            initMemoryGame();
        }
    }, 100);
    
    if (!appState.gamesPlayed.includes(gameId)) {
        appState.gamesPlayed.push(gameId);
        saveAppState();
        checkAchievements();
    }
};

// Enhanced Breathing Game - NEW PATTERNS
function createBreathingGame() {
    return `
        <div class="breathing-exercise game-ui">
            <div class="breathing-pattern-selector">
                <h4>Choose Breathing Pattern:</h4>
                <button class="pattern-btn active" onclick="selectBreathingPattern('4-7-8')">4-7-8 Relaxing</button>
                <button class="pattern-btn" onclick="selectBreathingPattern('box')">Box Breathing</button>
                <button class="pattern-btn" onclick="selectBreathingPattern('simple')">Simple</button>
            </div>
            <div class="breathing-instructions">Breathe with the circle</div>
            <div class="breathing-circle" id="breathingCircle">Breathe</div>
            <div class="breathing-controls">
                <button class="btn btn--primary" onclick="startBreathing()">Start</button>
                <button class="btn btn--secondary" onclick="stopBreathing()">Stop</button>
            </div>
        </div>
    `;
}

// Select Breathing Pattern - NEW
window.selectBreathingPattern = function(patternId) {
    appState.currentBreathingPattern = patternId;
    
    // Update button styles
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    saveAppState();
};

// Grounding Exercise Game - NEW
function createGroundingGame() {
    return `
        <div class="game-ui">
            <div style="padding: 20px;">
                <h3>🌱 5-4-3-2-1 Grounding Exercise</h3>
                <p>This technique helps you stay present by focusing on your senses.</p>
                
                <div class="grounding-step" id="step5">
                    <h4>5 Things You Can SEE</h4>
                    <p>Look around and name 5 things you can see</p>
                    <input type="text" class="form-control grounding-input" placeholder="I can see..." maxlength="100">
                </div>
                
                <div class="grounding-step" id="step4" style="display: none;">
                    <h4>4 Things You Can TOUCH</h4>
                    <p>Notice 4 things you can physically feel</p>
                    <input type="text" class="form-control grounding-input" placeholder="I can feel..." maxlength="100">
                </div>
                
                <div class="grounding-step" id="step3" style="display: none;">
                    <h4>3 Things You Can HEAR</h4>
                    <p>Listen carefully for 3 sounds around you</p>
                    <input type="text" class="form-control grounding-input" placeholder="I can hear..." maxlength="100">
                </div>
                
                <div class="grounding-step" id="step2" style="display: none;">
                    <h4>2 Things You Can SMELL</h4>
                    <p>Notice 2 different scents</p>
                    <input type="text" class="form-control grounding-input" placeholder="I can smell..." maxlength="100">
                </div>
                
                <div class="grounding-step" id="step1" style="display: none;">
                    <h4>1 Thing You Can TASTE</h4>
                    <p>Focus on 1 taste in your mouth</p>
                    <input type="text" class="form-control grounding-input" placeholder="I can taste..." maxlength="100">
                </div>
                
                <div id="groundingComplete" style="display: none; text-align: center; padding: 20px;">
                    <h3>🎉 Well Done!</h3>
                    <p>You've completed the grounding exercise. How do you feel now?</p>
                </div>
                
                <button class="btn btn--primary btn--full-width" onclick="nextGroundingStep()">Next Step</button>
            </div>
        </div>
    `;
}

let currentGroundingStep = 5;

window.nextGroundingStep = function() {
    const currentStepEl = document.getElementById(`step${currentGroundingStep}`);
    const input = currentStepEl ? currentStepEl.querySelector('.grounding-input') : null;
    
    if (input && !input.value.trim() && currentGroundingStep > 1) {
        showToast('Please fill in the current step first');
        return;
    }
    
    if (currentStepEl) currentStepEl.style.display = 'none';
    
    currentGroundingStep--;
    
    if (currentGroundingStep >= 1) {
        const nextStepEl = document.getElementById(`step${currentGroundingStep}`);
        if (nextStepEl) nextStepEl.style.display = 'block';
    } else {
        // Show completion
        const completeEl = document.getElementById('groundingComplete');
        const button = document.querySelector('#gameContainer button');
        if (completeEl) completeEl.style.display = 'block';
        if (button) button.style.display = 'none';
        
        // Track achievement
        if (!appState.achievements.includes('grounding-expert')) {
            const count = (appState.gamesPlayed.filter(g => g === 'grounding').length || 0) + 1;
            if (count >= 5) {
                appState.achievements.push('grounding-expert');
                saveAppState();
                showToast('🏆 Achievement: Grounding Expert!');
            }
        }
        
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
};

// Memory Match Game - NEW
function createMemoryMatchGame() {
    return `
        <div class="game-ui">
            <div style="padding: 20px;">
                <h3>🧩 Memory Match</h3>
                <p>Match pairs of cards to exercise your focus and memory</p>
                <div class="memory-grid" id="memoryGrid"></div>
                <div style="text-align: center; margin-top: 16px;">
                    <button class="btn btn--primary" onclick="initMemoryGame()">New Game</button>
                    <span style="margin-left: 16px;">Moves: <span id="moveCount">0</span></span>
                </div>
            </div>
        </div>
    `;
}

let memoryCards = [];
let flippedCards = [];
let moves = 0;

window.initMemoryGame = function() {
    const emojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🍀', '🌿'];
    const gameCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    memoryCards = gameCards.map((emoji, index) => ({
        id: index,
        emoji: emoji,
        flipped: false,
        matched: false
    }));
    
    flippedCards = [];
    moves = 0;
    document.getElementById('moveCount').textContent = '0';
    
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = memoryCards.map(card => `
        <div class="memory-card" onclick="flipCard(${card.id})">
            <div class="card-content">${card.flipped || card.matched ? card.emoji : '?'}</div>
        </div>
    `).join('');
};

window.flipCard = function(cardId) {
    if (flippedCards.length >= 2) return;
    
    const card = memoryCards[cardId];
    if (card.flipped || card.matched) return;
    
    card.flipped = true;
    flippedCards.push(card);
    
    updateMemoryDisplay();
    
    if (flippedCards.length === 2) {
        moves++;
        document.getElementById('moveCount').textContent = moves;
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
};

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.emoji === card2.emoji) {
        card1.matched = true;
        card2.matched = true;
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Check if game is complete
        if (memoryCards.every(card => card.matched)) {
            setTimeout(() => {
                showToast(`🎉 Completed in ${moves} moves!`);
            }, 500);
        }
    } else {
        card1.flipped = false;
        card2.flipped = false;
    }
    
    flippedCards = [];
    updateMemoryDisplay();
}

function updateMemoryDisplay() {
    const grid = document.getElementById('memoryGrid');
    if (!grid) return;
    
    grid.innerHTML = memoryCards.map(card => `
        <div class="memory-card ${card.matched ? 'matched' : ''} ${card.flipped ? 'flipped' : ''}" onclick="flipCard(${card.id})">
            <div class="card-content">${card.flipped || card.matched ? card.emoji : '?'}</div>
        </div>
    `).join('');
}

// Bubble Pop Game - NEW
function createBubblePopGame() {
    return `
        <div class="game-ui">
            <div style="text-align: center; padding: 20px;">
                <h3>🫧 Bubble Pop Therapy</h3>
                <p>Pop bubbles to release stress and find calm</p>
                <div id="bubbleContainer" style="position: relative; height: 300px; background: linear-gradient(to bottom, var(--color-bg-1), var(--color-bg-3)); border-radius: 8px; margin: 20px 0; overflow: hidden;">
                    <canvas id="bubbleCanvas" width="400" height="300"></canvas>
                </div>
                <div style="margin-top: 16px;">
                    <button class="btn btn--primary" onclick="createMoreBubbles()">🫧 More Bubbles</button>
                    <span style="margin-left: 16px;">Popped: <span id="poppedCount">0</span></span>
                </div>
            </div>
        </div>
    `;
}

let bubbleCanvas, bubbleCtx;
let bubbles = [];
let poppedCount = 0;

window.createMoreBubbles = function() {
    const container = document.getElementById('bubbleContainer');
    bubbleCanvas = document.getElementById('bubbleCanvas');
    if (!bubbleCanvas) return;
    
    bubbleCtx = bubbleCanvas.getContext('2d');
    bubbleCanvas.width = container.offsetWidth;
    bubbleCanvas.height = container.offsetHeight;
    
    // Add new bubbles
    for (let i = 0; i < 15; i++) {
        bubbles.push({
            x: Math.random() * bubbleCanvas.width,
            y: Math.random() * bubbleCanvas.height,
            radius: Math.random() * 20 + 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: `hsl(${Math.random() * 60 + 180}, 70%, 80%)`
        });
    }
    
    if (!window.bubbleAnimationId) {
        animateBubbles();
    }
    
    // Add click listener
    bubbleCanvas.onclick = function(e) {
        const rect = bubbleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click hit any bubble
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            if (distance < bubble.radius) {
                bubbles.splice(i, 1);
                poppedCount++;
                document.getElementById('poppedCount').textContent = poppedCount;
                
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                break;
            }
        }
    };
};

function animateBubbles() {
    if (!bubbleCtx || !bubbleCanvas) return;
    
    bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
    
    bubbles.forEach((bubble, index) => {
        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // Bounce off edges
        if (bubble.x < bubble.radius || bubble.x > bubbleCanvas.width - bubble.radius) {
            bubble.vx *= -1;
        }
        if (bubble.y < bubble.radius || bubble.y > bubbleCanvas.height - bubble.radius) {
            bubble.vy *= -1;
        }
        
        // Draw bubble
        bubbleCtx.beginPath();
        bubbleCtx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        bubbleCtx.fillStyle = bubble.color;
        bubbleCtx.fill();
        bubbleCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        bubbleCtx.stroke();
    });
    
    window.bubbleAnimationId = requestAnimationFrame(animateBubbles);
}

// Doodle Pad Game - NEW
function createDoodlePadGame() {
    return `
        <div class="game-ui">
            <div style="padding: 20px;">
                <h3>🎨 Art Therapy Pad</h3>
                <p>Express yourself through digital art</p>
                <canvas id="doodleCanvas" class="doodle-canvas" width="400" height="300"></canvas>
                <div class="doodle-controls">
                    <div class="color-picker active" style="background: #000000;" onclick="selectColor('#000000')"></div>
                    <div class="color-picker" style="background: #FF6B6B;" onclick="selectColor('#FF6B6B')"></div>
                    <div class="color-picker" style="background: #4ECDC4;" onclick="selectColor('#4ECDC4')"></div>
                    <div class="color-picker" style="background: #45B7D1;" onclick="selectColor('#45B7D1')"></div>
                    <div class="color-picker" style="background: #96CEB4;" onclick="selectColor('#96CEB4')"></div>
                    <div class="color-picker" style="background: #FFEAA7;" onclick="selectColor('#FFEAA7')"></div>
                    <div class="color-picker" style="background: #DDA0DD;" onclick="selectColor('#DDA0DD')"></div>
                    <button class="btn btn--secondary" onclick="clearDoodle()">Clear</button>
                    <button class="btn btn--primary" onclick="saveDoodle()">Save Art</button>
                </div>
            </div>
        </div>
    `;
}

let doodleCanvas, doodleCtx;
let isDrawing = false;
let currentColor = '#000000';

function initDoodlePad() {
    doodleCanvas = document.getElementById('doodleCanvas');
    if (!doodleCanvas) return;
    
    doodleCtx = doodleCanvas.getContext('2d');
    doodleCanvas.width = 400;
    doodleCanvas.height = 300;
    
    // Mouse events
    doodleCanvas.addEventListener('mousedown', startDraw);
    doodleCanvas.addEventListener('mousemove', draw);
    doodleCanvas.addEventListener('mouseup', stopDraw);
    
    // Touch events
    doodleCanvas.addEventListener('touchstart', handleTouch);
    doodleCanvas.addEventListener('touchmove', handleTouch);
    doodleCanvas.addEventListener('touchend', stopDraw);
}

function startDraw(e) {
    isDrawing = true;
    const rect = doodleCanvas.getBoundingClientRect();
    doodleCtx.beginPath();
    doodleCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = doodleCanvas.getBoundingClientRect();
    doodleCtx.lineWidth = 3;
    doodleCtx.lineCap = 'round';
    doodleCtx.strokeStyle = currentColor;
    doodleCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    doodleCtx.stroke();
}

function stopDraw() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const rect = doodleCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    doodleCanvas.dispatchEvent(mouseEvent);
}

window.selectColor = function(color) {
    currentColor = color;
    document.querySelectorAll('.color-picker').forEach(picker => {
        picker.classList.remove('active');
    });
    event.target.classList.add('active');
};

window.clearDoodle = function() {
    if (doodleCtx) {
        doodleCtx.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
    }
};

window.saveDoodle = function() {
    showToast('🎨 Art saved to your heart! Keep creating!');
    if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
    }
};

// Existing Game Functions - PRESERVED EXACTLY
function createStressBubbles() {
    return `
        <div class="game-ui">
            <div style="text-align: center; padding: 20px; height: 100%;">
                <h3>🫧 Stress Relief Bubbles</h3>
                <p>Tap the bubbles to pop them and release stress!</p>
                <div id="bubblesContainer" style="position: relative; height: 300px; background: linear-gradient(to bottom, var(--color-bg-1), var(--color-bg-3)); border-radius: 8px; margin: 20px 0; overflow: hidden;"></div>
                <button class="btn btn--primary" onclick="createBubbles()">🫧 Create More Bubbles</button>
            </div>
        </div>
    `;
}

function createGratitudeTree() {
    return `
        <div class="game-ui">
            <div style="text-align: center; padding: 20px;">
                <h3>🌳 Gratitude Tree</h3>
                <p>Add leaves of gratitude to your tree:</p>
                <input type="text" class="form-control" id="gratitudeText" placeholder="I'm grateful for..." style="margin: 16px 0;">
                <button class="btn btn--primary btn--full-width" onclick="addGratitudeLeaf()">🍃 Add Leaf</button>
                <div id="gratitudeTree" style="min-height: 150px; background: var(--color-bg-3); border-radius: 8px; padding: 20px; margin: 20px 0; position: relative;">
                    <div style="font-size: 48px;">🌳</div>
                </div>
            </div>
        </div>
    `;
}

function createWorryBox() {
    return `
        <div class="game-ui">
            <div style="padding: 20px;">
                <h3>📦 Digital Worry Box</h3>
                <p>Write down your worries and lock them away:</p>
                <textarea class="form-control" id="worryText" placeholder="What's worrying you today?" style="min-height: 120px; margin: 16px 0;"></textarea>
                <button class="btn btn--primary btn--full-width" onclick="lockWorry()">🔒 Lock Away Worry</button>
                <div id="worryResult" style="margin-top: 20px; text-align: center;"></div>
            </div>
        </div>
    `;
}

// Game Functions - ENHANCED with new breathing patterns
let breathingInterval;

window.startBreathing = function() {
    const circle = document.getElementById('breathingCircle');
    if (!circle) return;
    
    const pattern = breathingPatterns[appState.currentBreathingPattern];
    let phase = 'inhale';
    let phaseTime = 0;
    
    breathingInterval = setInterval(() => {
        const durations = {
            'inhale': pattern.inhale * 1000,
            'hold': (pattern.hold || 0) * 1000,
            'exhale': pattern.exhale * 1000,
            'pause': (pattern.pause || 0) * 1000
        };
        
        if (phaseTime === 0) {
            switch (phase) {
                case 'inhale':
                    circle.textContent = 'Inhale';
                    circle.classList.add('inhale');
                    circle.classList.remove('exhale');
                    break;
                case 'hold':
                    circle.textContent = 'Hold';
                    break;
                case 'exhale':
                    circle.textContent = 'Exhale';
                    circle.classList.add('exhale');
                    circle.classList.remove('inhale');
                    break;
                case 'pause':
                    circle.textContent = 'Pause';
                    break;
            }
        }
        
        phaseTime += 100;
        
        if (phaseTime >= durations[phase]) {
            phaseTime = 0;
            // Move to next phase
            if (phase === 'inhale' && pattern.hold) {
                phase = 'hold';
            } else if ((phase === 'inhale' && !pattern.hold) || phase === 'hold') {
                phase = 'exhale';
            } else if (phase === 'exhale' && pattern.pause) {
                phase = 'pause';
            } else {
                phase = 'inhale';
            }
        }
    }, 100);
    
    if (navigator.vibrate) {
        navigator.vibrate([50, 200, 50]);
    }
};

window.stopBreathing = function() {
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    const circle = document.getElementById('breathingCircle');
    if (circle) {
        circle.textContent = 'Breathe';
        circle.classList.remove('inhale', 'exhale');
    }
};

window.createBubbles = function() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                position: absolute;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(100,200,255,0.6));
                border: 1px solid rgba(255,255,255,0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                left: ${Math.random() * 90}%;
                top: ${Math.random() * 90}%;
                animation: bubbleFloat 3s ease-in-out infinite;
            `;
            
            bubble.onclick = () => {
                bubble.style.transform = 'scale(1.5)';
                bubble.style.opacity = '0';
                setTimeout(() => bubble.remove(), 300);
                
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
            };
            
            container.appendChild(bubble);
            
            setTimeout(() => {
                if (bubble.parentNode) bubble.remove();
            }, 5000);
        }, i * 200);
    }
};

window.addGratitudeLeaf = function() {
    const gratitudeInput = document.getElementById('gratitudeText');
    const tree = document.getElementById('gratitudeTree');
    
    if (!tree) return;
    
    const gratitude = gratitudeInput ? gratitudeInput.value.trim() : '';
    
    const leaf = document.createElement('div');
    leaf.style.cssText = 'position: absolute; font-size: 20px; animation: leafFloat 2s ease-in-out;';
    leaf.style.left = Math.random() * 80 + 10 + '%';
    leaf.style.top = Math.random() * 60 + 20 + '%';
    leaf.textContent = '🍃';
    if (gratitude) leaf.title = gratitude;
    
    tree.appendChild(leaf);
    if (gratitudeInput) gratitudeInput.value = '';
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    if (gratitude) {
        showToast(`Added: ${gratitude}`);
    } else {
        showToast('Added leaf to your gratitude tree!');
    }
};

window.lockWorry = function() {
    const worryInput = document.getElementById('worryText');
    const result = document.getElementById('worryResult');
    
    if (result) {
        result.innerHTML = `
            <div style="font-size: 48px; margin: 20px 0;">📦🔒</div>
            <p>Your worry has been locked away safely. Remember, worries are temporary - you have the strength to overcome them.</p>
        `;
    }
    
    if (worryInput) worryInput.value = '';
    
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
};

// Gratitude Wall - NEW FEATURE
window.showGratitudeWall = function() {
    const modal = document.getElementById('gratitudeModal');
    if (modal) {
        modal.classList.remove('hidden');
        loadGratitudeEntries();
    }
};

window.addGratitudeEntry = function() {
    const input = document.getElementById('gratitudeInput');
    if (!input) return;
    
    const gratitude = input.value.trim();
    if (!gratitude) return;
    
    const entry = {
        id: Date.now(),
        text: gratitude,
        timestamp: Date.now(),
        date: new Date().toDateString()
    };
    
    appState.gratitudeEntries.push(entry);
    input.value = '';
    saveAppState();
    loadGratitudeEntries();
    
    showToast('Added to gratitude wall!');
    
    // Check achievement
    if (appState.gratitudeEntries.length >= 10 && !appState.achievements.includes('gratitude-master')) {
        appState.achievements.push('gratitude-master');
        saveAppState();
        showToast('🏆 Achievement: Gratitude Master!');
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
};

function loadGratitudeEntries() {
    const container = document.getElementById('gratitudeWallContent');
    if (!container) return;
    
    if (appState.gratitudeEntries.length === 0) {
        container.innerHTML = '<p class="text-center">Your gratitude entries will appear here</p>';
        return;
    }
    
    const entries = appState.gratitudeEntries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
    
    container.innerHTML = entries.map(entry => {
        const date = new Date(entry.timestamp).toLocaleDateString();
        return `
            <div class="gratitude-entry">
                <p style="margin: 0; color: var(--color-text);">${entry.text}</p>
                <small style="color: var(--color-text-secondary); font-style: italic;">${date}</small>
            </div>
        `;
    }).join('');
}

// Profile Functions - ENHANCED with new fields
window.updateProfile = function() {
    const nameInput = document.getElementById('profileNameInput');
    const ageInput = document.getElementById('profileAgeInput'); // NEW
    const genderSelect = document.getElementById('profileGenderSelect'); // NEW
    const goalSelect = document.getElementById('profileGoalSelect');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const age = ageInput ? parseInt(ageInput.value) : null; // NEW
    const gender = genderSelect ? genderSelect.value : null; // NEW
    const goal = goalSelect ? goalSelect.value : '';
    
    if (name) {
        appState.user.name = name;
    }
    if (age && age >= 13 && age <= 120) { // NEW
        appState.user.age = age;
    }
    if (gender) { // NEW
        appState.user.gender = gender;
    }
    if (goal) {
        appState.user.goals = goal;
    }
    
    saveAppState();
    updateGreeting();
    loadAchievements();
    showToast('Profile updated!');
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
};

function loadAchievements() {
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
    container.innerHTML = appData.achievements.map(achievement => {
        const earned = appState.achievements.includes(achievement.id);
        return `
            <div class="achievement-badge ${earned ? 'earned' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <p class="achievement-description">${achievement.description}</p>
            </div>
        `;
    }).join('');
    
    const profileName = document.getElementById('profileName');
    const profileGoal = document.getElementById('profileGoal');
    
    if (profileName && appState.user) {
        profileName.textContent = appState.user.name || 'Welcome!';
    }
    
    if (profileGoal && appState.user) {
        const goalText = {
            'anxiety': 'Managing anxiety',
            'depression': 'Improving mood',
            'stress': 'Reducing stress', 
            'mindfulness': 'Practicing mindfulness',
            'sleep': 'Better sleep',
            'general': 'General wellness'
        };
        profileGoal.textContent = appState.user.goals ? 
            `Working on ${goalText[appState.user.goals] || 'mental wellness'}` :
            'Take your time to explore the app';
    }
}

function checkAchievements() {
    const achievements = [];
    
    if (appState.journalEntries.length >= 1 && !appState.achievements.includes('first-entry')) {
        achievements.push('first-entry');
    }
    
    if (appState.streakCount >= 7 && !appState.achievements.includes('week-streak')) {
        achievements.push('week-streak');
    }
    
    if (appState.moodEntries.length >= 30 && !appState.achievements.includes('mood-tracker')) {
        achievements.push('mood-tracker');
    }
    
    if (appState.gamesPlayed && appState.gamesPlayed.length >= 3 && !appState.achievements.includes('game-player')) {
        achievements.push('game-player');
    }
    
    const personalities = new Set();
    appState.chatHistory.forEach(msg => {
        if (msg.personality) personalities.add(msg.personality);
    });
    if (personalities.size >= 2 && !appState.achievements.includes('chat-explorer')) {
        achievements.push('chat-explorer');
    }
    
    if (appState.chatHistory.length >= 10 && !appState.achievements.includes('ai-friend')) {
        achievements.push('ai-friend');
    }
    
    // NEW ACHIEVEMENTS
    if (appState.gratitudeEntries && appState.gratitudeEntries.length >= 10 && !appState.achievements.includes('gratitude-master')) {
        achievements.push('gratitude-master');
    }
    
    achievements.forEach(id => {
        if (!appState.achievements.includes(id)) {
            appState.achievements.push(id);
            const achievement = appData.achievements.find(a => a.id === id);
            if (achievement) {
                showToast(`🏆 Achievement Unlocked: ${achievement.name}!`);
                
                if (navigator.vibrate) {
                    navigator.vibrate([100, 50, 100, 50, 100]);
                }
            }
        }
    });
    
    if (achievements.length > 0) {
        saveAppState();
        loadAchievements();
    }
}

window.exportData = function() {
    const exportData = {
        user: appState.user,
        moodEntries: appState.moodEntries,
        journalEntries: appState.journalEntries,
        achievements: appState.achievements,
        streakCount: appState.streakCount,
        gratitudeEntries: appState.gratitudeEntries, // NEW
        exportDate: new Date().toISOString(),
        note: 'Exported from MindMate - Your Mental Health Companion with Gemini AI'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmate-data-export.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
};

// Streak Management - PRESERVED EXACTLY
function checkStreak() {
    const today = new Date().toDateString();
    const lastCheckIn = appState.lastCheckIn;
    
    if (lastCheckIn === today) {
        return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastCheckIn === yesterdayStr) {
        appState.streakCount++;
    } else if (!lastCheckIn || lastCheckIn !== yesterdayStr) {
        appState.streakCount = 1;
    }
    
    appState.lastCheckIn = today;
    saveAppState();
    updateDashboard();
}

// Utility Functions - PRESERVED EXACTLY
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-surface);
        color: var(--color-text);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-md);
        z-index: 10000;
        font-size: 14px;
        border: 1px solid var(--color-border);
        max-width: 90%;
        text-align: center;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

window.showEmergencyModal = function() {
    const modal = document.getElementById('emergencyModal');
    if (modal) modal.classList.remove('hidden');
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    
    if (modalId === 'gameModal') {
        if (breathingInterval) {
            stopBreathing();
        }
        // Clean up game states
        if (window.bubbleAnimationId) {
            cancelAnimationFrame(window.bubbleAnimationId);
            window.bubbleAnimationId = null;
        }
        bubbles = [];
        poppedCount = 0;
        currentGroundingStep = 5;
    }
};

// Event Listeners Setup - ENHANCED
function setupEventListeners() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    const settingReminders = document.getElementById('settingReminders');
    const settingPrivacy = document.getElementById('settingPrivacy');
    const settingSmartCheckins = document.getElementById('settingSmartCheckins'); // NEW
    
    if (settingReminders) {
        settingReminders.checked = appState.settings.reminders;
        settingReminders.addEventListener('change', (e) => {
            appState.settings.reminders = e.target.checked;
            saveAppState();
        });
    }
    
    if (settingPrivacy) {
        settingPrivacy.checked = appState.settings.privacy;
        settingPrivacy.addEventListener('change', (e) => {
            appState.settings.privacy = e.target.checked;
            saveAppState();
        });
    }
    
    // NEW - Smart check-ins setting
    if (settingSmartCheckins) {
        settingSmartCheckins.checked = appState.settings.smartCheckins;
        settingSmartCheckins.addEventListener('change', (e) => {
            appState.settings.smartCheckins = e.target.checked;
            saveAppState();
            if (e.target.checked) {
                showToast('Smart check-ins enabled! You\'ll get gentle reminders.');
            }
        });
    }
    
    // Gratitude input enter key
    const gratitudeInput = document.getElementById('gratitudeInput');
    if (gratitudeInput) {
        gratitudeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addGratitudeEntry();
            }
        });
    }
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Touch Gestures - PRESERVED EXACTLY
function setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    
    const pages = ['dashboardPage', 'moodPage', 'journalPage', 'chatPage', 'profilePage'];
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            const currentIndex = pages.indexOf(appState.currentPage);
            
            if (deltaX > 0 && currentIndex > 0) {
                showPage(pages[currentIndex - 1]);
            } else if (deltaX < 0 && currentIndex < pages.length - 1) {
                showPage(pages[currentIndex + 1]);
            }
        }
    });
}

// Service Worker Registration for PWA - PRESERVED EXACTLY
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            const CACHE_NAME = 'mindmate-ai-v1';
            const urlsToCache = ['/'];
            
            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache))
                );
            });
            
            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request)
                        .then((response) => response || fetch(event.request))
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then((registration) => {
                console.log('ServiceWorker registration successful');
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed');
            });
    });
}
