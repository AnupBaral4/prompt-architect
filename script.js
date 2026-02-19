// ============================================
// PARTICLE SYSTEM INITIALIZATION
// ============================================

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// CATEGORY DATA
// ============================================

const categories = [
    { id: 'style', name: 'Art Style', chips: ['Minimalism', 'Cinematic', 'Hyper-realistic', 'Analog Film', 'Cyberpunk', 'Surrealism'] },
    { id: 'composition', name: 'Composition', chips: ['Rule of Thirds', 'Bird\'s Eye View', 'Close-up', 'Symmetrical', 'Wide Shot'] },
    { id: 'mood', name: 'Mood', chips: ['Ethereal', 'Melancholic', 'Energetic', 'Peaceful', 'Dark', 'Whimsical'] },
    { id: 'lighting', name: 'Lighting', chips: ['Golden Hour', 'Volumetric Fog', 'Soft Sunlight', 'Cyber Neon', 'Hard Shadows'] },
    { id: 'color', name: 'Palette', chips: ['Monochrome', 'Pastel', 'Earthy Tones', 'Neon', 'Vibrant', 'Muted'] },
    { id: 'technical', name: 'Quality', chips: ['8k', 'Ray Tracing', 'Masterpiece', 'Intricate Textures', 'Sharp Focus'] }
];

// ============================================
// STATE MANAGEMENT
// ============================================

const state = { 
    subject: '', 
    attributes: {},
    aspectRatio: '',
    stylize: 100,
    chaos: 0,
    negative: ''
};

let subjectInput, outputText, categoriesContainer, toast;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initParticles();
    subjectInput = document.getElementById('subject-input');
    outputText = document.getElementById('output-text');
    categoriesContainer = document.getElementById('categories-container');
    toast = document.getElementById('toast');

    if (subjectInput && outputText && categoriesContainer) {
        subjectInput.oninput = (e) => { 
            state.subject = e.target.value; 
            buildPrompt();
            updatePromptStrength();
            
            // Character counter
            const charCounter = document.getElementById('char-counter');
            const charCount = document.getElementById('char-count');
            if (charCounter && charCount) {
                charCount.textContent = e.target.value.length;
                charCounter.style.opacity = e.target.value.length > 0 ? '1' : '0';
            }
            
            // Pulse effect on smart core when typing
            const smartCore = document.getElementById('smart-core');
            if (smartCore && e.target.value.length > 0) {
                smartCore.style.animation = 'none';
                setTimeout(() => {
                    smartCore.style.animation = 'rotateCore 12s linear infinite, corePulse 0.3s ease-out';
                }, 10);
            }
            
            // Create typing sparkles
            if (e.target.value.length > 0 && Math.random() > 0.7) {
                createTypingSparkle(e.target);
            }
        };
        
        // Focus effects
        subjectInput.onfocus = () => {
            const smartCore = document.getElementById('smart-core');
            if (smartCore) {
                smartCore.style.filter = 'drop-shadow(0 0 25px rgba(0, 255, 136, 0.8))';
            }
        };
        
        subjectInput.onblur = () => {
            const smartCore = document.getElementById('smart-core');
            if (smartCore) {
                smartCore.style.filter = 'drop-shadow(0 0 15px rgba(0, 255, 136, 0.6))';
            }
        };

        categories.forEach((cat) => {
            const section = document.createElement('section');
            section.className = 'category-section space-y-5';
            const title = document.createElement('h2');
            title.className = 'text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-500';
            title.innerText = cat.name;
            const chipGrid = document.createElement('div');
            chipGrid.className = 'flex flex-wrap gap-2';
            cat.chips.forEach(chipText => {
                const btn = document.createElement('button');
                btn.className = 'chip haptic-btn px-4 py-2 rounded-xl text-[11px] font-medium text-neutral-300 transition-all';
                btn.dataset.category = cat.id;
                btn.innerText = chipText;
                btn.onclick = () => selectAttribute(cat.id, chipText, btn);
                chipGrid.appendChild(btn);
            });
            section.appendChild(title);
            section.appendChild(chipGrid);
            categoriesContainer.appendChild(section);
        });
        
        loadHistoryFromStorage();
    }
}

// ============================================
// ATTRIBUTE SELECTION
// ============================================

function selectAttribute(catId, value, btn) {
    const siblings = document.querySelectorAll(`button[data-category="${catId}"]`);
    siblings.forEach(s => s.classList.remove('chip-active'));
    if (state.attributes[catId] === value) { 
        delete state.attributes[catId]; 
    } else { 
        state.attributes[catId] = value; 
        btn.classList.add('chip-active');
        createSparkles(btn);
    }
    buildPrompt();
    updatePromptStrength();
}

// ============================================
// VISUAL EFFECTS
// ============================================

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = rect.left + rect.width / 2 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        sparkle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
        sparkle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
}

function createTypingSparkle(element) {
    const rect = element.getBoundingClientRect();
    const sparkle = document.createElement('div');
    sparkle.className = 'typing-sparkle';
    sparkle.style.left = rect.right - 20 + 'px';
    sparkle.style.top = rect.top + rect.height / 2 + 'px';
    sparkle.innerHTML = ['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)];
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
}

// ============================================
// PROMPT BUILDING
// ============================================

function buildPrompt() {
    if (!outputText) return;
    
    const { subject, attributes, aspectRatio, stylize, chaos, negative } = state;
    if (!subject && Object.keys(attributes).length === 0) {
        outputText.innerHTML = `<span class="text-neutral-600 italic font-light tracking-tight">Ready for architectural parameters...</span>`;
        return;
    }
    let promptParts = [];
    const subj = subject ? `<span class="token-subject">${subject}</span>` : '<span class="text-neutral-600">[Subject]</span>';
    promptParts.push(subj);
    if (attributes.style) promptParts.push(`with <span class="token-modifier">${attributes.style}</span> style`);
    if (attributes.composition) promptParts.push(`shot from a <span class="token-modifier">${attributes.composition}</span>`);
    if (attributes.lighting || attributes.mood) {
        let vibe = "featuring ";
        if (attributes.lighting) vibe += `<span class="token-modifier">${attributes.lighting}</span>`;
        if (attributes.lighting && attributes.mood) vibe += " and ";
        if (attributes.mood) vibe += `<span class="token-modifier">${attributes.mood}</span> vibes`;
        promptParts.push(vibe);
    }
    if (attributes.color) promptParts.push(`in a <span class="token-modifier">${attributes.color}</span> palette`);
    if (attributes.technical) promptParts.push(`captured in <span class="token-modifier">${attributes.technical}</span> detail`);
    
    let params = [];
    params.push('--v 6.0');
    if (aspectRatio) params.push(`--ar ${aspectRatio}`);
    if (stylize !== 100) params.push(`--s ${stylize}`);
    if (chaos > 0) params.push(`--c ${chaos}`);
    if (negative) params.push(`--no ${negative}`);
    
    const paramsStr = params.map(p => `<span class="token-param">${p}</span>`).join(' ');
    outputText.innerHTML = promptParts.join(", ") + ` ${paramsStr}`;
}

// ============================================
// PROMPT STRENGTH INDICATOR
// ============================================

function updatePromptStrength() {
    const totalCategories = 7; // 6 categories + subject
    let filled = state.subject ? 1 : 0;
    filled += Object.keys(state.attributes).length;
    
    const percentage = Math.round((filled / totalCategories) * 100);
    
    // Update circular progress ring
    const progressRing = document.getElementById('strength-ring-progress');
    const circumference = 2 * Math.PI * 35;
    const offset = circumference - (percentage / 100) * circumference;
    if (progressRing) {
        progressRing.style.strokeDashoffset = offset;
    }
    
    // Update badge
    const badge = document.getElementById('strength-badge');
    if (badge) {
        badge.textContent = percentage + '%';
        badge.style.opacity = percentage > 0 ? '1' : '0';
    }
    
    // Update quality indicator
    const qualityIndicator = document.getElementById('quality-indicator');
    const qualityScore = document.getElementById('quality-score');
    const qualityTitle = document.getElementById('quality-title');
    const qualityDesc = document.getElementById('quality-desc');
    const qualityIcon = document.getElementById('quality-icon');
    
    if (qualityIndicator && percentage > 0) {
        qualityIndicator.style.opacity = '1';
        qualityScore.textContent = percentage + '%';
        
        if (percentage < 30) {
            qualityTitle.textContent = 'BASIC PROMPT';
            qualityDesc.textContent = 'Add more attributes for better results';
            qualityIcon.innerHTML = '⚠️';
            qualityScore.className = 'text-2xl font-bold text-yellow-500 mono';
        } else if (percentage < 60) {
            qualityTitle.textContent = 'GOOD PROMPT';
            qualityDesc.textContent = 'You\'re on the right track!';
            qualityIcon.innerHTML = '✨';
            qualityScore.className = 'text-2xl font-bold text-blue-500 mono';
        } else if (percentage < 90) {
            qualityTitle.textContent = 'STRONG PROMPT';
            qualityDesc.textContent = 'Excellent detail and structure';
            qualityIcon.innerHTML = '🔥';
            qualityScore.className = 'text-2xl font-bold text-green-500 mono';
        } else {
            qualityTitle.textContent = 'MASTER PROMPT';
            qualityDesc.textContent = 'Perfect synthesis achieved!';
            qualityIcon.innerHTML = '💎';
            qualityScore.className = 'text-2xl font-bold text-purple-500 mono';
        }
    } else if (qualityIndicator) {
        qualityIndicator.style.opacity = '0';
    }
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
    copyBtn.onclick = (e) => copyToClipboard(e);
}

function copyToClipboard(e) {
    const outputText = document.getElementById('output-text');
    if (!outputText) return;
    
    const btn = document.getElementById('copy-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    
    if (!btn || !btnText || !btnIcon) return;
    if (outputText.innerText.includes('Ready for')) return;
    
    const finalString = outputText.innerText;
    
    navigator.clipboard.writeText(finalString).then(() => {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = btn.getBoundingClientRect();
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        
        btn.classList.add('is-copying');
        btnText.innerText = "COPYING...";
        btnText.classList.add('text-emerald-900');
        
        setTimeout(() => {
            btnText.innerText = "COPIED!";
            btnIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="animate-bounce"><path d="M5 13l4 4L19 7" /></svg>`;
        }, 700);
        
        setTimeout(() => {
            btn.classList.remove('is-copying');
            btnText.innerText = "COPY";
            btnText.classList.remove('text-emerald-900');
            btnIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" /></svg>`;
        }, 3000);
    });
}

// ============================================
// TECHNICAL PARAMETERS
// ============================================

function selectAspectRatio(ratio) {
    const buttons = document.querySelectorAll('.aspect-btn');
    buttons.forEach(btn => btn.classList.remove('chip-active'));
    
    if (state.aspectRatio === ratio) {
        state.aspectRatio = '';
    } else {
        state.aspectRatio = ratio;
        const btn = document.querySelector(`[data-aspect="${ratio}"]`);
        if (btn) btn.classList.add('chip-active');
    }
    buildPrompt();
}

function updateStylize(value) {
    state.stylize = parseInt(value);
    const stylizeValue = document.getElementById('stylize-value');
    if (stylizeValue) {
        stylizeValue.textContent = value;
        buildPrompt();
    }
}

function updateChaos(value) {
    state.chaos = parseInt(value);
    const chaosValue = document.getElementById('chaos-value');
    if (chaosValue) {
        chaosValue.textContent = value;
        buildPrompt();
    }
}

function updateNegative(value) {
    state.negative = value.trim();
    buildPrompt();
}

// ============================================
// RANDOM PROMPT GENERATOR
// ============================================

function randomizePrompt() {
    if (!subjectInput) return;
    
    const subjects = [
        'futuristic cityscape', 'ancient temple ruins', 'mystical forest',
        'underwater civilization', 'space station interior', 'desert oasis',
        'mountain monastery', 'cyberpunk alley', 'floating islands',
        'crystal cavern', 'abandoned factory', 'neon marketplace'
    ];
    
    // Animate the button
    const btn = event.target.closest('.surprise-btn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = '', 200);
    
    // Random subject
    state.subject = subjects[Math.floor(Math.random() * subjects.length)];
    subjectInput.value = state.subject;
    
    // Clear and randomize attributes
    state.attributes = {};
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    
    categories.forEach(cat => {
        if (Math.random() > 0.3) { // 70% chance to select from each category
            const randomChip = cat.chips[Math.floor(Math.random() * cat.chips.length)];
            state.attributes[cat.id] = randomChip;
            
            const button = document.querySelector(`button[data-category="${cat.id}"]`);
            if (button) {
                const buttons = document.querySelectorAll(`button[data-category="${cat.id}"]`);
                buttons.forEach(b => {
                    if (b.innerText === randomChip) {
                        setTimeout(() => {
                            b.classList.add('chip-active');
                            createSparkles(b);
                        }, Math.random() * 500);
                    }
                });
            }
        }
    });
    
    // Random technical parameters
    const ratios = ['1:1', '4:5', '16:9', '9:16'];
    state.aspectRatio = ratios[Math.floor(Math.random() * ratios.length)];
    document.querySelectorAll('.aspect-btn').forEach(btn => btn.classList.remove('chip-active'));
    const aspectBtn = document.querySelector(`[data-aspect="${state.aspectRatio}"]`);
    if (aspectBtn) aspectBtn.classList.add('chip-active');
    
    state.stylize = Math.floor(Math.random() * 20) * 50 + 100;
    document.getElementById('stylize-slider').value = state.stylize;
    document.getElementById('stylize-value').textContent = state.stylize;
    
    state.chaos = Math.floor(Math.random() * 10) * 10;
    document.getElementById('chaos-slider').value = state.chaos;
    document.getElementById('chaos-value').textContent = state.chaos;
    
    buildPrompt();
    updatePromptStrength();
    
    // Scroll to output
    setTimeout(() => {
        document.getElementById('output-text').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
}

// ============================================
// NEURAL BLUEPRINTS
// ============================================

function loadNeuralBlueprint(subject, style, lighting, mood, aspectRatio, stylize, chaos, negative) {
    if (!subjectInput) return;
    
    state.subject = subject;
    subjectInput.value = subject;
    
    state.attributes = {};
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    
    if (style) {
        const styleButtons = document.querySelectorAll('button[data-category="style"]');
        styleButtons.forEach(btn => {
            if (btn.innerText === style) {
                btn.classList.add('chip-active');
                state.attributes['style'] = style;
            }
        });
    }
    
    if (lighting) {
        const lightingButtons = document.querySelectorAll('button[data-category="lighting"]');
        lightingButtons.forEach(btn => {
            if (btn.innerText === lighting) {
                btn.classList.add('chip-active');
                state.attributes['lighting'] = lighting;
            }
        });
    }
    
    if (mood) {
        const moodButtons = document.querySelectorAll('button[data-category="mood"]');
        moodButtons.forEach(btn => {
            if (btn.innerText === mood) {
                btn.classList.add('chip-active');
                state.attributes['mood'] = mood;
            }
        });
    }
    
    if (aspectRatio) {
        state.aspectRatio = aspectRatio;
        document.querySelectorAll('.aspect-btn').forEach(btn => btn.classList.remove('chip-active'));
        const aspectBtn = document.querySelector(`[data-aspect="${aspectRatio}"]`);
        if (aspectBtn) aspectBtn.classList.add('chip-active');
    }
    
    if (stylize) {
        state.stylize = stylize;
        document.getElementById('stylize-slider').value = stylize;
        document.getElementById('stylize-value').textContent = stylize;
    }
    
    if (chaos !== undefined) {
        state.chaos = chaos;
        document.getElementById('chaos-slider').value = chaos;
        document.getElementById('chaos-value').textContent = chaos;
    }
    
    if (negative) {
        state.negative = negative;
        document.getElementById('negative-input').value = negative;
    }
    
    buildPrompt();
    updatePromptStrength();
    
    const outputText = document.getElementById('output-text');
    if (outputText) {
        outputText.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const synthesisBox = document.querySelector('.synthesis-box');
    if (synthesisBox) {
        synthesisBox.style.borderColor = 'rgba(16, 185, 129, 0.6)';
        setTimeout(() => {
            synthesisBox.style.borderColor = '';
        }, 1000);
    }
}

// ============================================
// RESET/CLEAR
// ============================================

function initResetButton() {
    const clearBtn = document.getElementById('clear-btn');
    const subjectInputElement = document.getElementById('subject-input');
    
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (!subjectInputElement) return;

            state.subject = '';
            state.attributes = {};
            state.aspectRatio = '';
            state.stylize = 100;
            state.chaos = 0;
            state.negative = '';
            
            subjectInputElement.value = '';
            
            const negativeInput = document.getElementById('negative-input');
            if (negativeInput) negativeInput.value = '';
            
            const stylizeSlider = document.getElementById('stylize-slider');
            const stylizeValue = document.getElementById('stylize-value');
            if (stylizeSlider) stylizeSlider.value = 100;
            if (stylizeValue) stylizeValue.textContent = 100;
            
            const chaosSlider = document.getElementById('chaos-slider');
            const chaosValue = document.getElementById('chaos-value');
            if (chaosSlider) chaosSlider.value = 0;
            if (chaosValue) chaosValue.textContent = 0;
            
            document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
            document.querySelectorAll('.aspect-btn').forEach(btn => btn.classList.remove('chip-active'));
            
            buildPrompt();
            updatePromptStrength();
            
            // Show success feedback
            showToast('All settings reset!');
        };
    }
}

// ============================================
// HISTORY MANAGEMENT
// ============================================

function saveToHistory() {
    if (!state.subject && Object.keys(state.attributes).length === 0) return;
    
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const promptData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        state: JSON.stringify(state),
        preview: state.subject || 'Untitled Prompt'
    };
    
    history.unshift(promptData);
    if (history.length > 20) history.pop();
    
    localStorage.setItem('promptHistory', JSON.stringify(history));
    loadHistoryFromStorage();
    
    showToast('Prompt saved to history! 📚');
}

function loadHistoryFromStorage() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-neutral-600 text-sm py-10">No saved prompts yet</div>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition-all cursor-pointer" onclick="loadFromHistory(${item.id})">
            <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-white text-sm">${item.preview}</div>
                <button onclick="event.stopPropagation(); deleteHistoryItem(${item.id})" class="text-neutral-600 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div class="text-[10px] text-neutral-500">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
    `).join('');
}

function loadFromHistory(id) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const item = history.find(h => h.id === id);
    if (!item) return;
    
    const savedState = JSON.parse(item.state);
    
    // Restore state
    state.subject = savedState.subject;
    state.attributes = savedState.attributes || {};
    state.aspectRatio = savedState.aspectRatio || '';
    state.stylize = savedState.stylize || 100;
    state.chaos = savedState.chaos || 0;
    state.negative = savedState.negative || '';
    
    // Update UI
    subjectInput.value = state.subject;
    document.getElementById('negative-input').value = state.negative;
    document.getElementById('stylize-slider').value = state.stylize;
    document.getElementById('stylize-value').textContent = state.stylize;
    document.getElementById('chaos-slider').value = state.chaos;
    document.getElementById('chaos-value').textContent = state.chaos;
    
    // Clear all active chips
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    
    // Reactivate chips
    Object.keys(state.attributes).forEach(catId => {
        const value = state.attributes[catId];
        const buttons = document.querySelectorAll(`button[data-category="${catId}"]`);
        buttons.forEach(btn => {
            if (btn.innerText === value) {
                btn.classList.add('chip-active');
            }
        });
    });
    
    // Restore aspect ratio
    if (state.aspectRatio) {
        const aspectBtn = document.querySelector(`[data-aspect="${state.aspectRatio}"]`);
        if (aspectBtn) aspectBtn.classList.add('chip-active');
    }
    
    buildPrompt();
    updatePromptStrength();
    closeHistory();
    
    showToast('Prompt loaded from history! ✨');
}

function deleteHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem('promptHistory', JSON.stringify(filtered));
    loadHistoryFromStorage();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('promptHistory');
        loadHistoryFromStorage();
        showToast('History cleared');
    }
}

function toggleHistory() {
    const sidebar = document.getElementById('history-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function closeHistory() {
    const sidebar = document.getElementById('history-sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function downloadPrompt() {
    const text = outputText ? outputText.innerText : '';
    if (!text || text.includes('Ready for')) {
        showToast('No prompt to download');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Prompt downloaded! 📥');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
}

function openModal(id) {
    const modal = document.getElementById(id + '-modal');
    if (modal) modal.style.display = 'block';
}

function closeModal(id) {
    const modal = document.getElementById(id + '-modal');
    if (modal) modal.style.display = 'none';
}

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

// ============================================
// AI ENHANCEMENT FEATURE
// ============================================

const WORKER_URL = 'https://gemini-proxy.anupbaral-new.workers.dev/';
let enhancedPromptText = '';

// Get user fingerprint for rate limiting
function getUserFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    return canvas.toDataURL().slice(-50);
}

// Check rate limit
function checkRateLimit() {
    const fingerprint = getUserFingerprint();
    const today = new Date().toDateString();
    const storageKey = `enhance_${fingerprint}_${today}`;
    const count = parseInt(localStorage.getItem(storageKey) || '0');
    return { remaining: Math.max(0, 3 - count), used: count };
}

// Increment rate limit
function incrementRateLimit() {
    const fingerprint = getUserFingerprint();
    const today = new Date().toDateString();
    const storageKey = `enhance_${fingerprint}_${today}`;
    const count = parseInt(localStorage.getItem(storageKey) || '0');
    localStorage.setItem(storageKey, (count + 1).toString());
}

// Update enhance counter badge
function updateEnhanceCounter() {
    const { remaining } = checkRateLimit();
    const counter = document.getElementById('enhance-counter');
    const countEl = document.getElementById('enhance-count');
    
    if (counter && countEl) {
        counter.classList.remove('hidden');
        countEl.textContent = remaining;
        
        if (remaining === 0) {
            document.getElementById('enhance-btn').disabled = true;
            countEl.classList.remove('text-green-500');
            countEl.classList.add('text-red-500');
        }
    }
}

// Enhanced AI Button
async function enhanceWithAI() {
    const outputText = document.getElementById('output-text');
    const btn = document.getElementById('enhance-btn');
    const btnText = document.getElementById('enhance-btn-text');
    
    if (!outputText || outputText.innerText.includes('Ready for')) {
        showToast('⚠️ Create a prompt first!');
        return;
    }

    // Check rate limit
    const { remaining } = checkRateLimit();
    if (remaining <= 0) {
        showToast('⚠️ Daily limit reached. Try again tomorrow!');
        return;
    }

    // Show loading state
    btn.classList.add('loading');
    btn.disabled = true;
    const originalHTML = btnText.innerHTML;
    btnText.innerHTML = 'ENHANCING...';
    btn.classList.add('animate-pulse');

    // Open modal immediately
    const modal = document.getElementById('enhance-modal');
    const originalPromptEl = document.getElementById('original-prompt');
    const enhancedTextEl = document.getElementById('enhanced-text');
    const remainingCountEl = document.getElementById('remaining-count');
    const useEnhancedBtn = document.getElementById('use-enhanced-btn');
    const errorDiv = document.getElementById('enhance-error');

    if (modal) modal.style.display = 'block';
    if (originalPromptEl) originalPromptEl.textContent = outputText.innerText;
    if (enhancedTextEl) {
        enhancedTextEl.textContent = 'Enhanced version will appear here...';
        enhancedTextEl.classList.add('text-neutral-600', 'italic');
        enhancedTextEl.classList.remove('text-white');
    }
    if (remainingCountEl) remainingCountEl.textContent = remaining;
    if (useEnhancedBtn) useEnhancedBtn.disabled = true;
    if (errorDiv) errorDiv.style.display = 'none';

    // Show loading
    const loadingDiv = document.getElementById('enhance-loading');
    if (loadingDiv) loadingDiv.style.display = 'flex';

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: outputText.innerText,
                userFingerprint: getUserFingerprint()
            })
        });

        const data = await response.json();

        if (loadingDiv) loadingDiv.style.display = 'none';

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Enhancement failed');
        }

        enhancedPromptText = data.enhanced;
        if (enhancedTextEl) {
            enhancedTextEl.textContent = enhancedPromptText;
            enhancedTextEl.classList.remove('text-neutral-600', 'italic');
            enhancedTextEl.classList.add('text-white');
        }
        if (useEnhancedBtn) useEnhancedBtn.disabled = false;

        // Increment rate limit
        incrementRateLimit();
        const newRemaining = checkRateLimit().remaining;
        if (remainingCountEl) remainingCountEl.textContent = newRemaining;
        
        // Update counter badge
        updateEnhanceCounter();

    } catch (error) {
        console.error('Enhancement error:', error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (errorDiv) {
            errorDiv.style.display = 'block';
            document.getElementById('error-message').textContent = error.message;
        }
    } finally {
        // Reset button
        btn.classList.remove('loading', 'animate-pulse');
        btn.disabled = false;
        btnText.innerHTML = originalHTML;
    }
}

// Use enhanced prompt
function useEnhanced() {
    if (!enhancedPromptText) {
        showToast('⚠️ No enhanced prompt available');
        return;
    }

    const outputText = document.getElementById('output-text');
    if (outputText) {
        outputText.innerHTML = enhancedPromptText
            .split(',')
            .map(part => {
                part = part.trim();
                if (part.startsWith('--')) {
                    return `<span class="token-param">${part}</span>`;
                }
                return `<span class="token-modifier">${part}</span>`;
            })
            .join(', ');
    }

    closeEnhanceModal();
    showToast('✨ Enhanced prompt applied!');
    
    updateFloatingPreview();
}

// Close enhance modal
function closeEnhanceModal() {
    const modal = document.getElementById('enhance-modal');
    if (modal) modal.style.display = 'none';
    enhancedPromptText = '';
}

// ============================================
// WELCOME MODAL
// ============================================

function initWelcomeModal() {
    if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
            document.getElementById('welcome-modal').style.display = 'block';
        }, 500);
    }
}

function closeWelcome() {
    if (document.getElementById('dont-show-again').checked) {
        localStorage.setItem('welcomeShown', 'true');
    }
    document.getElementById('welcome-modal').style.display = 'none';
}

// ============================================
// MORE ACTIONS DROPDOWN
// ============================================

let moreActionsTimeout;

function showMoreActions() {
    clearTimeout(moreActionsTimeout);
    const menu = document.getElementById('more-actions-menu');
    if (menu) {
        menu.classList.add('visible');
    }
}

function hideMoreActionsDelayed() {
    moreActionsTimeout = setTimeout(() => {
        hideMoreActions();
    }, 200);
}

function hideMoreActions() {
    const menu = document.getElementById('more-actions-menu');
    if (menu) {
        menu.classList.remove('visible');
    }
}

// ============================================
// FLOATING PREVIEW WIDGET
// ============================================

let floatingPreviewVisible = false;
let lastPromptUpdate = 0;
let shakeInterval = null;
let shakeCount = 0;
let originalBuildPromptFunction = null;

function initializeFloatingPreview() {
    if (!originalBuildPromptFunction && typeof buildPrompt === 'function') {
        originalBuildPromptFunction = buildPrompt;
        
        window.buildPrompt = function() {
            originalBuildPromptFunction.apply(this, arguments);
            setTimeout(updateFloatingPreview, 100);
        };
        
    }
}

function updateFloatingPreview() {
    const outputText = document.getElementById('output-text');
    const floatingPreview = document.getElementById('floating-preview');
    const floatingText = document.getElementById('floating-preview-text');
    const floatingFull = document.getElementById('floating-preview-full');
    const floatingCount = document.getElementById('floating-word-count');
    
    if (!outputText || !floatingPreview) {
        return;
    }
    
    const promptText = outputText.innerText || outputText.textContent || '';
    
    // Don't show if empty or default text
    if (!promptText || promptText.includes('Ready for architectural')) {
        floatingPreview.classList.add('hidden');
        floatingPreviewVisible = false;
        return;
    }
    
    // Show widget with dramatic entrance
    if (!floatingPreviewVisible) {
        floatingPreview.classList.remove('hidden');
        floatingPreview.style.animation = 'dramaticEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        floatingPreviewVisible = true;
        
        // First-time user experience
        if (!localStorage.getItem('floatingPreviewSeen')) {
            setTimeout(() => {
                const pointer = document.getElementById('first-time-pointer');
                if (pointer) pointer.classList.remove('hidden');
                
                setTimeout(() => {
                    if (pointer && !pointer.classList.contains('hidden')) {
                        pointer.style.animation = 'fadeOut 0.5s ease forwards';
                        setTimeout(() => pointer.classList.add('hidden'), 500);
                    }
                }, 8000);
            }, 800);
            
            // Shake attention every 8 seconds (3 times max)
            shakeCount = 0;
            if (shakeInterval) clearInterval(shakeInterval);
            shakeInterval = setInterval(() => {
                if (shakeCount >= 3) {
                    clearInterval(shakeInterval);
                    return;
                }
                floatingPreview.classList.add('attention');
                setTimeout(() => floatingPreview.classList.remove('attention'), 500);
                shakeCount++;
            }, 8000);
        }
    }
    
    // Update content
    const wordCount = promptText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const truncated = promptText.length > 50 ? promptText.substring(0, 50) + '...' : promptText;
    
    if (floatingText) floatingText.textContent = truncated;
    if (floatingFull) floatingFull.textContent = promptText;
    if (floatingCount) floatingCount.textContent = `${wordCount}w`;
    
    // Pulse animation for new updates
    const now = Date.now();
    if (now - lastPromptUpdate > 500) {
        floatingPreview.classList.add('pulse');
        setTimeout(() => floatingPreview.classList.remove('pulse'), 500);
    }
    lastPromptUpdate = now;
}

function scrollToSynthesis() {
    const synthesisSection = document.querySelector('#output-text')?.closest('section');
    if (synthesisSection) {
        synthesisSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        markPreviewAsSeen();
    }
}

function markPreviewAsSeen() {
    localStorage.setItem('floatingPreviewSeen', 'true');
    
    const pointer = document.getElementById('first-time-pointer');
    const badge = document.getElementById('new-badge');
    const arrowIndicator = document.getElementById('floating-arrow-indicator');
    
    if (pointer && !pointer.classList.contains('hidden')) {
        pointer.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => pointer.classList.add('hidden'), 300);
    }
    
    if (badge && !badge.classList.contains('hidden')) {
        badge.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => badge.classList.add('hidden'), 300);
    }
    
    if (arrowIndicator) {
        arrowIndicator.style.animation = 'fadeOutArrow 0.5s ease forwards';
        setTimeout(() => arrowIndicator.style.display = 'none', 500);
    }
    
    if (shakeInterval) {
        clearInterval(shakeInterval);
        shakeInterval = null;
    }
    
    const floatingPreview = document.getElementById('floating-preview');
    if (floatingPreview) {
        floatingPreview.classList.add('arrow-seen');
    }
}

function checkSynthesisVisibility() {
    const synthesisSection = document.querySelector('#output-text')?.closest('section');
    const floatingPreview = document.getElementById('floating-preview');
    
    if (!synthesisSection || !floatingPreview) return;
    
    const rect = synthesisSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const isVisible = rect.top < windowHeight && rect.bottom > 0;
    
    if (isVisible) {
        floatingPreview.classList.add('at-synthesis');
    } else {
        floatingPreview.classList.remove('at-synthesis');
    }
}

const floatingPreviewEl = document.getElementById('floating-preview');
if (floatingPreviewEl) {
    floatingPreviewEl.addEventListener('click', markPreviewAsSeen);
}

window.addEventListener('scroll', checkSynthesisVisibility);

// ============================================
// GALLERY PAGE FUNCTIONS
// ============================================

// Gallery data (for gallery.html)
const galleryData = {
    1: {
        title: "CYBER_METROPOLIS",
        description: "Futuristic cyberpunk city at night",
        image: "cyberpunk-city-showcase.jpg",
        prompt: `Futuristic cyberpunk city at night
Style: Cyberpunk, high-detail, cinematic, neon accents
Composition: Wide-angle cityscape, strong depth, layered skyline, clear foreground and background separation
Lighting: Neon signage glow, moody contrast, reflections on wet surfaces
Environment: Dense urban core, rain-soaked streets, atmospheric haze
Technical tuning: --ar 16:9 --stylize 150 --chaos 25 --v 6
Negative prompt: low detail, flat lighting, cartoon style, overexposed highlights, blurry structures`,
        hasPrompt: true,
        badge: "GEMINI NANO BANANA"
    },
    2: {
        title: "DAWN_PEAKS",
        description: "Mountain landscape at sunrise",
        image: "mountain-sunrise-showcase.jpg",
        prompt: `Mountain landscape at sunrise
Style: Natural realism, high detail, photographic look
Composition: Rule of thirds, wide landscape framing, clear horizon line
Lighting: Soft golden sunrise light, gentle shadows, subtle contrast
Environment: Mist-covered mountains, calm atmosphere, open sky
Technical tuning: --ar 3:2 --stylize 80 --chaos 10 --v 6
Negative prompt: oversaturated colors, harsh contrast, fantasy elements, artificial lighting`,
        hasPrompt: true,
        badge: "GEMINI NANO BANANA"
    },
    3: {
        title: "QUANTUM_BRIDGE",
        description: "Futuristic sci-fi control room interior",
        image: "scifi-control-showcase.jpg",
        prompt: `Futuristic sci-fi control room interior
Style: Clean sci-fi, minimalistic, high-tech design
Composition: Symmetrical framing, central focal point, balanced geometry
Lighting: Cool ambient lighting, soft glow panels, controlled highlights
Environment: Advanced space station interior, sleek materials, quiet atmosphere
Technical tuning: --ar 16:9 --stylize 120 --chaos 15 --v 6
Negative prompt: cluttered layout, retro sci-fi, fantasy elements, excessive neon, distorted perspective`,
        hasPrompt: true,
        badge: "GEMINI NANO BANANA"
    },
    4: {
        title: "ARCHITECT_EXCLUSIVE",
        description: "Premium curated showcase - Prompt not available",
        image: "featured-exclusive-01.jpg",
        prompt: null,
        hasPrompt: false,
        badge: "EXCLUSIVE"
    }
};

function openGalleryModal(id) {
    const data = galleryData[id];
    const modal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const modalDetails = document.getElementById('modal-details');

    modalImage.src = data.image;
    modalImage.alt = data.title;

    let detailsHTML = `
        <div class="synthesis-box rounded-3xl p-8">
            <div class="flex items-start justify-between mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-white mono mb-2">${data.title}</h2>
                    <p class="text-neutral-400">${data.description}</p>
                </div>
                <span class="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded font-bold">${data.badge}</span>
            </div>
    `;

    if (data.hasPrompt) {
        detailsHTML += `
            <div class="prompt-display">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Full Synthesis String</h3>
                    <button onclick="copyPrompt(${id})" class="copy-prompt-btn rounded-full">
                        <span class="relative z-10">COPY PROMPT</span>
                    </button>
                </div>
                <pre class="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap mono">${data.prompt}</pre>
            </div>
        `;
    } else {
        detailsHTML += `
            <div class="prompt-display text-center py-8">
                <div class="text-6xl mb-4">🔒</div>
                <h3 class="text-xl font-bold text-white mb-2">Exclusive Artwork</h3>
                <p class="text-neutral-400">This is a premium featured piece. Prompt details are not publicly available.</p>
            </div>
        `;
    }

    detailsHTML += `</div>`;
    modalDetails.innerHTML = detailsHTML;
    modal.classList.add('active');
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    modal.classList.remove('active');
}

function copyPrompt(id) {
    const data = galleryData[id];
    if (data.hasPrompt) {
        navigator.clipboard.writeText(data.prompt).then(() => {
            const btn = event.target.closest('.copy-prompt-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="relative z-10">✓ COPIED!</span>';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    }
}

let currentImageSrc = '';

function openFullscreen(imageSrc) {
    currentImageSrc = imageSrc;
    const fullscreenDiv = document.getElementById('image-fullscreen');
    const fullscreenImg = document.getElementById('fullscreen-image');
    fullscreenImg.src = imageSrc;
    fullscreenDiv.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    const fullscreenDiv = document.getElementById('image-fullscreen');
    fullscreenDiv.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function downloadImage() {
    if (currentImageSrc) {
        const link = document.createElement('a');
        link.href = currentImageSrc;
        link.download = currentImageSrc.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// ============================================
// FAQ PAGE FUNCTIONS
// ============================================

function toggleFaq(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('span');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer && !item.classList.contains('hidden')) {
            item.classList.add('hidden');
            item.previousElementSibling.querySelector('span').textContent = '+';
            item.previousElementSibling.querySelector('span').style.transform = 'rotate(0deg)';
        }
    });
    
    // Toggle current FAQ
    answer.classList.toggle('hidden');
    if (answer.classList.contains('hidden')) {
        icon.textContent = '+';
        icon.style.transform = 'rotate(0deg)';
    } else {
        icon.textContent = '−';
        icon.style.transform = 'rotate(180deg)';
    }
}

// ============================================
// INITIALIZATION ON DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize main app
    init();
    buildPrompt();
    updatePromptStrength();
    
    // Initialize reset button
    initResetButton();
    
    // Initialize welcome modal
    initWelcomeModal();
    
    // Initialize floating preview properly
    setTimeout(() => {
        initializeFloatingPreview();
        updateFloatingPreview();
        checkSynthesisVisibility();
        updateEnhanceCounter();
    }, 500);
    
});

// Close gallery modal on outside click
const galleryModal = document.getElementById('gallery-modal');
if (galleryModal) {
    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeGalleryModal();
        }
    });
}

// Close fullscreen on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGalleryModal();
        closeFullscreen();
    }
});


// ============================================
// BLOG PAGE FUNCTIONALITY
// ============================================

// Blog Category Filtering (for blog.html)
function initBlogFilters() {
    const categoryBtns = document.querySelectorAll('.category-pill');
    const blogCards = document.querySelectorAll('.blog-card');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    
    if (!categoryBtns.length || !blogCards.length) return;
    
    function checkResults() {
        const visibleCards = Array.from(blogCards).filter(card => card.style.display !== 'none');
        if (noResults) {
            noResults.style.display = visibleCards.length === 0 ? 'block' : 'none';
        }
    }
    
    // Category filter buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (searchInput) searchInput.value = '';
            
            blogCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
            
            setTimeout(checkResults, 350);
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            categoryBtns.forEach(b => b.classList.remove('active'));
            if (categoryBtns[0]) categoryBtns[0].classList.add('active');
            
            blogCards.forEach(card => {
                const title = card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
                const excerpt = card.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
                const category = card.querySelector('.blog-category')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
            
            setTimeout(checkResults, 350);
        });
    }
}

// Blog Post Share Functions (for individual blog posts)
function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const title = document.querySelector('h1')?.textContent || 'Check out this article!';
    const text = encodeURIComponent(title + ' #AIArt #Midjourney #PromptEngineering');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy link');
    });
}

// Initialize blog functions when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogFilters);
} else {
    initBlogFilters();
}
