// Preview System Variables
let currentPreviewModel = 'reference';
let isGenerating = false;

function selectPreviewModel(model) {
    currentPreviewModel = model;
    
    // Update button states (if they exist)
    const mjBtn = document.getElementById('preview-btn-midjourney');
    const dalleBtn = document.getElementById('preview-btn-dalle');
    if (mjBtn) mjBtn.classList.toggle('active', model === 'reference');
    if (dalleBtn) dalleBtn.classList.toggle('active', model === 'styled');
    
    showToast(`Preview mode: ${model === 'reference' ? 'Reference Images' : 'Styled Reference'}`);
}

async function generatePreview() {
    if (isGenerating) {
        showToast('⏳ Already loading...');
        return;
    }
    
    // Get the subject from input
    const inputElement = document.getElementById('subject-input');
    const subject = inputElement ? inputElement.value.trim() : '';
    
    if (!subject || subject === "") {
        showToast('⚠️ Please enter a subject first!');
        return;
    }
    
    isGenerating = true;
    
    // Get the single preview container
    const container = document.getElementById('preview-container');
    
    if (!container) {
        console.error('❌ Preview container not found!');
        showToast('⚠️ Container not found');
        isGenerating = false;
        return;
    }
    
    // Enhanced loading animation with progress stages
    const loadingStages = [
        'Initializing Visual Search...',
        'Scanning Image Database...',
        'Processing References...',
        'Finalizing Preview...'
    ];
    
    let currentStage = 0;
    
    // Show initial loading UI
    container.innerHTML = `
        <div class="preview-loading">
            <div class="preview-spinner"></div>
            <div class="loading-progress-bar">
                <div class="loading-progress-fill" id="progress-fill"></div>
            </div>
            <span class="text-[10px] text-neutral-500 uppercase tracking-widest mt-3" id="loading-text">Initializing...</span>
        </div>
    `;
    
    showToast('🔍 Searching Reference Library...');
    
    // Animate loading stages over 4 seconds
    const stageInterval = setInterval(() => {
        currentStage++;
        if (currentStage < loadingStages.length) {
            const textElement = document.getElementById('loading-text');
            const progressFill = document.getElementById('progress-fill');
            if (textElement) {
                textElement.textContent = loadingStages[currentStage];
            }
            if (progressFill) {
                progressFill.style.width = ((currentStage + 1) / loadingStages.length * 100) + '%';
            }
        }
    }, 1000); // Update every second
    
    // Wait for 4 seconds minimum (loading animation)
    await new Promise(resolve => setTimeout(resolve, 4000));
    clearInterval(stageInterval);
    
    // Load single image based on the subject
    try {
        // Using LoremFlickr for reference images
        const randomLock = Math.floor(Math.random() * 5000);
        const imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(subject)}?lock=${randomLock}`;
        
        console.log('Loading image:', imageUrl);
        
        const img = new Image();
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
            img.onload = () => {
                console.log('✅ Image loaded successfully');
                resolve();
            };
            img.onerror = (error) => {
                console.error('❌ Image load error:', error);
                reject(error);
            };
            setTimeout(() => reject(new Error('Timeout')), 15000); // 15s timeout
        });
        
        // Clear container and add image with fade-in effect
        container.innerHTML = "";
        
        // Apply styles for proper display
        img.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        container.appendChild(img);
        
        console.log('✅ Image appended to container');
        
        // Trigger fade-in
        setTimeout(() => {
            img.style.opacity = '1';
            console.log('✅ Fade-in triggered');
        }, 50);
        
        showToast('✅ Reference Image Loaded');
        
    } catch (error) {
        console.error('Error loading image:', error);
        container.innerHTML = `
            <div class="preview-placeholder">
                <svg class="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm text-yellow-400">No Reference Found</span>
                <span class="text-[10px] text-neutral-600">Try different subject</span>
            </div>
        `;
        showToast('⚠️ Failed to load reference');
    }
    
    isGenerating = false;
}

function clearPreview() {
    const container = document.getElementById('preview-container');
    
    if (!container) {
        console.error('❌ Preview container not found!');
        return;
    }
    
    container.innerHTML = `
        <div class="preview-placeholder">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-sm">Reference Image</span>
        </div>
    `;
    
    console.log('✅ Preview cleared');
    showToast('Preview cleared');
}

console.log('✅ preview.js loaded - Single image version');