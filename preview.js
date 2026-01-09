// Preview System Variables
let currentPreviewModel = 'reference';
let isGenerating = false;

function selectPreviewModel(model) {
    currentPreviewModel = model;
    
    // Update button states
    document.getElementById('preview-btn-midjourney').classList.toggle('active', model === 'reference');
    document.getElementById('preview-btn-dalle').classList.toggle('active', model === 'styled');
    
    showToast(`Preview mode: ${model === 'reference' ? 'Reference Images' : 'Styled Reference'}`);
}

async function generatePreview() {
    if (isGenerating) {
        showToast('⏳ Already loading...');
        return;
    }
    
    // Get the subject from input (first word or full subject)
    const inputElement = document.getElementById('subject-input');
    const subject = inputElement ? inputElement.value.trim() : '';
    
    if (!subject || subject === "") {
        showToast('⚠️ Please enter a subject first!');
        return;
    }
    
    isGenerating = true;
    const slots = document.querySelectorAll('.preview-image-slot');
    
    // Enhanced loading animation with progress stages
    const loadingStages = [
        'Initializing Visual Search...',
        'Scanning Image Database...',
        'Processing References...',
        'Finalizing Preview...'
    ];
    
    let currentStage = 0;
    
    // Show initial loading UI
    slots.forEach((slot, index) => {
        slot.innerHTML = `
            <div class="preview-loading">
                <div class="preview-spinner"></div>
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" id="progress-fill-${index}"></div>
                </div>
                <span class="text-[10px] text-neutral-500 uppercase tracking-widest mt-3" id="loading-text-${index}">Initializing...</span>
            </div>
        `;
    });
    
    showToast('🔍 Searching Reference Library...');
    
    // Animate loading stages over 4 seconds
    const stageInterval = setInterval(() => {
        currentStage++;
        if (currentStage < loadingStages.length) {
            slots.forEach((slot, index) => {
                const textElement = document.getElementById(`loading-text-${index}`);
                const progressFill = document.getElementById(`progress-fill-${index}`);
                if (textElement) {
                    textElement.textContent = loadingStages[currentStage];
                }
                if (progressFill) {
                    progressFill.style.width = ((currentStage + 1) / loadingStages.length * 100) + '%';
                }
            });
        }
    }, 1000); // Update every second
    
    // Wait for 4 seconds minimum (loading animation)
    await new Promise(resolve => setTimeout(resolve, 4000));
    clearInterval(stageInterval);
    
    // Load 2 different images based on the subject
    for (let i = 0; i < slots.length; i++) {
        try {
            // Using LoremFlickr for reference images
            const randomLock = Math.floor(Math.random() * 5000) + i;
            const imageUrl = `https://loremflickr.com/512/512/${encodeURIComponent(subject)}?lock=${randomLock}`;
            
            const img = new Image();
            img.src = imageUrl;
            img.className = "w-full h-full object-cover";
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                setTimeout(reject, 15000); // 15s timeout
            });
            
            // Add fade-in effect
            slots[i].innerHTML = "";
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
            slots[i].appendChild(img);
            
            // Trigger fade-in
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
            
        } catch (error) {
            console.error(`Error loading image ${i + 1}:`, error);
            slots[i].innerHTML = `
                <div class="preview-placeholder">
                    <svg class="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-xs text-yellow-400">No Reference Found</span>
                    <span class="text-[10px] text-neutral-600">Try different subject</span>
                </div>
            `;
        }
    }
    
    isGenerating = false;
    showToast('✅ Reference Images Loaded');
}

function clearPreview() {
    const slots = document.querySelectorAll('.preview-image-slot');
    slots.forEach((slot, index) => {
        slot.innerHTML = `
            <div class="preview-placeholder">
                <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="text-xs">Preview ${index + 1}</span>
            </div>
        `;
    });
    
    showToast('Preview cleared');
}