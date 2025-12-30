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

const state = { subject: '', attributes: {} };
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
    const { subject, attributes } = state;
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
    outputText.innerHTML = promptParts.join(", ") + ` <span class="token-param">--v 6.0</span>`;
}

document.getElementById('copy-btn').onclick = () => {
    if (outputText.innerText.includes('Ready for')) return;
    navigator.clipboard.writeText(outputText.innerText);
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 2500);
};

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