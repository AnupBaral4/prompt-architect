// Generate animated particles
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
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
const subjectInput = document.getElementById('subject-input');
const outputText = document.getElementById('output-text');
const categoriesContainer = document.getElementById('categories-container');
const toast = document.getElementById('toast');

function init() {
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
}

subjectInput.oninput = (e) => { state.subject = e.target.value; buildPrompt(); };

function selectAttribute(catId, value, btn) {
    const siblings = document.querySelectorAll(`button[data-category="${catId}"]`);
    siblings.forEach(s => s.classList.remove('chip-active'));
    if (state.attributes[catId] === value) { delete state.attributes[catId]; } 
    else { state.attributes[catId] = value; btn.classList.add('chip-active'); }
    buildPrompt();
}

function buildPrompt() {
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
    
    // Build parameters string
    let params = [];
    params.push('--v 6.0');
    if (aspectRatio) params.push(`--ar ${aspectRatio}`);
    if (stylize !== 100) params.push(`--s ${stylize}`);
    if (chaos > 0) params.push(`--c ${chaos}`);
    if (negative) params.push(`--no ${negative}`);
    
    const paramsStr = params.map(p => `<span class="token-param">${p}</span>`).join(' ');
    outputText.innerHTML = promptParts.join(", ") + ` ${paramsStr}`;
}

document.getElementById('copy-btn').onclick = (e) => copyToClipboard(e);

function copyToClipboard(e) {
    const outputText = document.getElementById('output-text');
    const btn = document.getElementById('copy-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    
    if (outputText.innerText.includes('Ready for')) return;
    
    const finalString = outputText.innerText;
    
    navigator.clipboard.writeText(finalString).then(() => {
        // 1. Create Ripple at click location
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = btn.getBoundingClientRect();
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        
        // 2. Trigger Stream Animation
        btn.classList.add('is-copying');
        btnText.innerText = "BUFFERING DATA...";
        btnText.classList.add('text-emerald-900');
        
        // 3. Success State (Icon change)
        setTimeout(() => {
            btnText.innerText = "COPIED TO CLIPBOARD";
            btnIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="animate-bounce">
                    <path d="M5 13l4 4L19 7" />
                </svg>
            `;
        }, 700);
        
        // 4. Reset to Original
        setTimeout(() => {
            btn.classList.remove('is-copying');
            btnText.innerText = "COPY FINAL STRING";
            btnText.classList.remove('text-emerald-900');
            btnIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
                </svg>
            `;
        }, 3000);
    });
}

// Blueprint Library Function
function loadBlueprint(subject, style, lighting) {
    // 1. Inject subject into input field
    state.subject = subject;
    subjectInput.value = subject;
    
    // 2. Clear all existing attributes
    state.attributes = {};
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    
    // 3. Find and activate the style chip
    if (style) {
        const styleButtons = document.querySelectorAll('button[data-category="style"]');
        styleButtons.forEach(btn => {
            if (btn.innerText === style) {
                btn.classList.add('chip-active');
                state.attributes['style'] = style;
            }
        });
    }
    
    // 4. Find and activate the lighting chip
    if (lighting) {
        const lightingButtons = document.querySelectorAll('button[data-category="lighting"]');
        lightingButtons.forEach(btn => {
            if (btn.innerText === lighting) {
                btn.classList.add('chip-active');
                state.attributes['lighting'] = lighting;
            }
        });
    }
    
    // 5. CRITICAL: Call buildPrompt to update the final string with --v 6.0
    buildPrompt();
    
    // 6. Scroll to output smoothly
    document.getElementById('output-text').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 7. Visual feedback - flash the synthesis box
    const synthesisBox = document.querySelector('.synthesis-box');
    synthesisBox.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    setTimeout(() => {
        synthesisBox.style.borderColor = '';
    }, 1000);
}

// Technical Parameter Functions
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
    document.getElementById('stylize-value').textContent = value;
    buildPrompt();
}

function updateChaos(value) {
    state.chaos = parseInt(value);
    document.getElementById('chaos-value').textContent = value;
    buildPrompt();
}

function updateNegative(value) {
    state.negative = value.trim();
    buildPrompt();
}

// Neural Blueprint Loader
function loadNeuralBlueprint(subject, style, lighting, mood, aspectRatio, stylize, chaos, negative) {
    // 1. Inject subject
    state.subject = subject;
    subjectInput.value = subject;
    
    // 2. Clear all existing attributes
    state.attributes = {};
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    
    // 3. Activate chips
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
    
    // 4. Set technical parameters
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
    
    // 5. Build prompt
    buildPrompt();
    
    // 6. Visual feedback
    document.getElementById('output-text').scrollIntoView({ behavior: 'smooth', block: 'center' });
    const synthesisBox = document.querySelector('.synthesis-box');
    synthesisBox.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    setTimeout(() => {
        synthesisBox.style.borderColor = '';
    }, 1000);
}

document.getElementById('clear-btn').onclick = () => {
    state.subject = '';
    state.attributes = {};
    subjectInput.value = '';
    document.querySelectorAll('.chip-active').forEach(el => el.classList.remove('chip-active'));
    buildPrompt();
};

function openModal(id) {
    const modal = document.getElementById(id + '-modal');
    if (modal) modal.style.display = 'block';
}

function closeModal(id) {
    const modal = document.getElementById(id + '-modal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside content
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});

init();
buildPrompt();