// Generate animated particles
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

const categories = [
    { id: 'style', name: 'Art Style', chips: ['Minimalism', 'Cinematic', 'Hyper-realistic', 'Analog Film', 'Cyberpunk', 'Surrealism'] },
    { id: 'composition', name: 'Composition', chips: ['Rule of Thirds', 'Bird\'s Eye View', 'Close-up', 'Symmetrical', 'Wide Shot'] },
    { id: 'mood', name: 'Mood', chips: ['Ethereal', 'Melancholic', 'Energetic', 'Peaceful', 'Dark', 'Whimsical'] },
    { id: 'lighting', name: 'Lighting', chips: ['Golden Hour', 'Volumetric Fog', 'Soft Sunlight', 'Cyber Neon', 'Hard Shadows'] },
    { id: 'color', name: 'Palette', chips: ['Monochrome', 'Pastel', 'Earthy Tones', 'Neon', 'Vibrant', 'Muted'] },
    { id: 'technical', name: 'Quality', chips: ['8k', 'Ray Tracing', 'Masterpiece', 'Intricate Textures', 'Sharp Focus'] }
];

const state = { 
    subject: '', 
    attributes: {},
    aspectRatio: '',
    stylize: 100,
    chaos: 0,
    negative: ''
};

let subjectInput, outputText, categoriesContainer, toast;

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

const clearBtn = document.getElementById('clear-btn');
if (clearBtn) {
    clearBtn.onclick = () => {
        if (!subjectInput) return;

        state.subject = '';
        state.attributes = {};
        state.aspectRatio = '';
        state.stylize = 100;
        state.chaos = 0;
        state.negative = '';
        
        subjectInput.value = '';
        document.getElementById('negative-input').value = '';
        document.getElementById('stylize-slider').value = 100;
        document.getElementById('stylize-value').textContent = 100;
        document.getElementById('chaos-slider').value = 0;
        document.getElementById('chaos-value').textContent = 0;
        
        document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
        buildPrompt();
        updatePromptStrength();
    };
}

// History Functions
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

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    
    if (menu.style.maxHeight === '0px' || !menu.style.maxHeight) {
        menu.style.opacity = '1';
        menu.style.maxHeight = '500px';
    } else {
        menu.style.opacity = '0';
        menu.style.maxHeight = '0px';
    }
}

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

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

init();
buildPrompt();
updatePromptStrength();