// Preview System Variables
let isGenerating = false;

function generatePreview() {
    if (isGenerating) {
        showToast('⏳ Already loading...');
        return;
    }

    const inputElement = document.getElementById('subject-input');
    const subject = inputElement ? inputElement.value.trim() : '';

    if (!subject) {
        showToast('⚠️ Please enter a subject first!');
        return;
    }

    isGenerating = true;

    const container = document.getElementById('preview-container');
    if (!container) {
        isGenerating = false;
        return;
    }

    // Random lock so each click gives a different image for the same subject
    const lock = Math.floor(Math.random() * 9999);
    const encodedSubject = encodeURIComponent(subject);

    // Show loading UI with img already behind the overlay
    container.innerHTML = `
        <img id="ai-preview-img"
             style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.6s ease;" />
        <div id="ai-loading-overlay" class="preview-loading">
            <div class="preview-spinner"></div>
            <div class="loading-progress-bar">
                <div class="loading-progress-fill" id="progress-fill" style="width:20%"></div>
            </div>
            <span id="loading-text" class="text-[10px] text-neutral-500 uppercase tracking-widest mt-3">Searching visual library...</span>
        </div>
    `;

    showToast('🔍 Loading visual reference...');

    const img = document.getElementById('ai-preview-img');
    img.referrerPolicy = 'no-referrer';

    // Animate progress bar while image loads
    let progress = 20;
    const progressInterval = setInterval(() => {
        progress = Math.min(progress + 15, 85);
        const fillEl = document.getElementById('progress-fill');
        if (fillEl) fillEl.style.width = progress + '%';
    }, 400);

    img.onload = function () {
        clearInterval(progressInterval);
        const fillEl = document.getElementById('progress-fill');
        if (fillEl) fillEl.style.width = '100%';
        setTimeout(() => {
            img.style.opacity = '1';
            const overlay = document.getElementById('ai-loading-overlay');
            if (overlay) {
                overlay.style.transition = 'opacity 0.4s ease';
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 400);
            }
            showToast('✅ Reference Image Loaded');
            isGenerating = false;
        }, 200);
    };

    img.onerror = function () {
        clearInterval(progressInterval);
        container.innerHTML = `
            <div class="preview-placeholder">
                <svg class="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm text-yellow-400">No image found</span>
                <span class="text-[10px] text-neutral-600">Try a different subject</span>
            </div>
        `;
        showToast('⚠️ Could not load image');
        isGenerating = false;
    };

    // LoremFlickr: direct img URL, no CORS, topic-relevant, globally accessible
    img.src = `https://loremflickr.com/800/500/${encodedSubject}?lock=${lock}`;
}

function clearPreview() {
    const container = document.getElementById('preview-container');
    if (!container) return;
    isGenerating = false;
    container.innerHTML = `
        <div class="preview-placeholder">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-sm">Visual Reference</span>
        </div>
    `;
    showToast('Preview cleared');
}

