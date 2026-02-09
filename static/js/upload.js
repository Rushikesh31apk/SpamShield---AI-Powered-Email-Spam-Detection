// Upload page functionality
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const dropzone = document.getElementById('dropzone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFile = document.getElementById('removeFile');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const uploadContainer = document.getElementById('uploadContainer');
    const processingContainer = document.getElementById('processingContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');

    let selectedFile = null;

    // Browse button click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Dropzone click
    dropzone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
    });

    // Handle file selection
    function handleFile(file) {
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            showError('Please upload a CSV file');
            return;
        }

        // Validate file size (16MB max)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            showError('File size exceeds 16MB limit');
            return;
        }

        selectedFile = file;
        
        // Show file info with animation
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Animate file info in
        fileInfo.style.display = 'block';
        fileInfo.style.opacity = '0';
        fileInfo.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            fileInfo.style.opacity = '1';
            fileInfo.style.transform = 'translateY(0)';
            fileInfo.style.transition = 'all 0.3s ease';
        }, 10);
        
        // Hide dropzone with animation
        dropzone.style.opacity = '0';
        dropzone.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            dropzone.style.display = 'none';
        }, 300);
        
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
    }

    // Remove file
    removeFile.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        
        // Animate file info out
        fileInfo.style.opacity = '0';
        fileInfo.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            fileInfo.style.display = 'none';
            
            // Show dropzone with animation
            dropzone.style.display = 'block';
            dropzone.style.opacity = '0';
            dropzone.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                dropzone.style.opacity = '1';
                dropzone.style.transform = 'scale(1)';
                dropzone.style.transition = 'all 0.3s ease';
            }, 10);
        }, 300);
        
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
    });

    // Retry button
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            errorContainer.style.display = 'none';
            uploadContainer.style.display = 'block';
            resetForm();
        });
    }

    // Form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedFile) return;

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Uploading...</span>';

        // Hide upload container, show processing with animation
        uploadContainer.style.opacity = '0';
        uploadContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            uploadContainer.style.display = 'none';
            processingContainer.style.display = 'block';
            processingContainer.style.opacity = '0';
            
            setTimeout(() => {
                processingContainer.style.opacity = '1';
                processingContainer.style.transform = 'scale(1)';
                processingContainer.style.transition = 'all 0.3s ease';
            }, 10);
        }, 300);

        // Define processing steps for TF-IDF/Naive Bayes
        const steps = [
            { 
                id: 'step1', 
                title: 'Loading Dataset',
                duration: 1000,
                description: 'Reading CSV file and validating structure'
            },
            { 
                id: 'step2', 
                title: 'Analyzing Distribution',
                duration: 1500,
                description: 'Calculating class distribution and balancing'
            },
            { 
                id: 'step3', 
                title: 'Text Preprocessing',
                duration: 2000,
                description: 'Cleaning and processing email text'
            },
            { 
                id: 'step4', 
                title: 'TF-IDF Vectorization',
                duration: 2500,
                description: 'Converting text to numerical features'
            },
            { 
                id: 'step5', 
                title: 'Training Naive Bayes',
                duration: 3000,
                description: 'Training model and evaluating performance'
            },
            { 
                id: 'step6', 
                title: 'Generating Visualizations',
                duration: 2000,
                description: 'Creating charts and word clouds'
            }
        ];

        let currentProgress = 0;
        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

        // Animate steps
        steps.forEach((step, index) => {
            setTimeout(() => {
                // Mark previous steps as completed
                for (let i = 0; i < index; i++) {
                    const prevStep = document.getElementById(steps[i].id);
                    prevStep.classList.remove('active');
                    prevStep.classList.add('completed');
                    const icon = prevStep.querySelector('.step-icon');
                    icon.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.667 5L7.50033 14.1667L3.33366 10" 
                                  stroke="currentColor" 
                                  stroke-width="2" 
                                  stroke-linecap="round" 
                                  stroke-linejoin="round"/>
                        </svg>
                    `;
                    icon.style.color = '#00d4ff';
                }

                // Mark current step as active
                const currentStep = document.getElementById(step.id);
                currentStep.classList.add('active');
                
                // Update step description
                const stepDesc = document.getElementById(`${step.id}Desc`);
                if (stepDesc) {
                    stepDesc.textContent = step.description;
                }

                // Update progress with easing
                currentProgress += (step.duration / totalDuration) * 100;
                const progressValue = Math.min(currentProgress, 90);
                animateProgress(progressValue);
            }, steps.slice(0, index).reduce((sum, s) => sum + s.duration, 0));
        });

        try {
            // Send request to backend
            const response = await fetch('/process', {
                method: 'POST',
                body: createFormData()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Processing failed');
            }

            const results = await response.json();

            // Mark all steps as completed
            steps.forEach(step => {
                const stepEl = document.getElementById(step.id);
                stepEl.classList.remove('active');
                stepEl.classList.add('completed');
                const icon = stepEl.querySelector('.step-icon');
                icon.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.667 5L7.50033 14.1667L3.33366 10" 
                              stroke="currentColor" 
                              stroke-width="2" 
                              stroke-linecap="round" 
                              stroke-linejoin="round"/>
                    </svg>
                `;
                icon.style.color = '#00d4ff';
            });

            // Final progress animation
            animateProgress(100);

            // Store results in sessionStorage
            sessionStorage.setItem('spamDetectionResults', JSON.stringify(results));

            // Show success animation
            showSuccessAnimation();

            // Redirect to results page after a short delay
            setTimeout(() => {
                window.location.href = '/results';
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            processingContainer.style.display = 'none';
            showError(error.message || 'An error occurred during processing');
        }
    });

    // Create form data with additional metadata
    function createFormData() {
        const formData = new FormData();
        formData.append('dataset', selectedFile);
        formData.append('timestamp', new Date().toISOString());
        formData.append('model_type', 'tfidf_naive_bayes');
        return formData;
    }

    // Animate progress bar smoothly
    function animateProgress(targetPercentage) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const startWidth = parseFloat(progressFill.style.width) || 0;
        const startTime = performance.now();
        const duration = 1000; // 1 second animation
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentWidth = startWidth + (targetPercentage - startWidth) * eased;
            
            progressFill.style.width = currentWidth + '%';
            progressText.textContent = Math.round(currentWidth) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Show success animation
    function showSuccessAnimation() {
        const successIcon = document.createElement('div');
        successIcon.innerHTML = '✨';
        successIcon.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 100px;
            opacity: 0;
            z-index: 10000;
            animation: successPulse 1s ease-out forwards;
        `;
        
        document.body.appendChild(successIcon);
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes successPulse {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Remove after animation
        setTimeout(() => {
            successIcon.remove();
            style.remove();
        }, 1500);
    }

    // Show error with animation
    function showError(message) {
        errorMessage.textContent = message;
        
        // Animate error in
        errorContainer.style.display = 'block';
        errorContainer.style.opacity = '0';
        errorContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            errorContainer.style.opacity = '1';
            errorContainer.style.transform = 'scale(1)';
            errorContainer.style.transition = 'all 0.3s ease';
        }, 10);
        
        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Train Model</span>';
        submitBtn.classList.remove('disabled');
    }

    // Reset form
    function resetForm() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        dropzone.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        
        // Reset processing container if shown
        processingContainer.style.display = 'none';
        
        // Reset progress
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        // Reset steps
        document.querySelectorAll('.processing-step').forEach(step => {
            step.classList.remove('active', 'completed');
            const icon = step.querySelector('.step-icon');
            icon.innerHTML = step.querySelector('.step-icon').dataset.originalIcon || '';
            icon.style.color = '';
        });
    }

    // Add hover effects for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 20px rgba(0, 212, 255, 0.3)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 212, 255, 0.2)';
        });
    });

    // Add animation for processing steps
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe processing steps
    document.querySelectorAll('.processing-step').forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        observer.observe(step);
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to cancel/remove file
        if (e.key === 'Escape' && selectedFile) {
            removeFile.click();
        }
        
        // Enter key to submit if file is selected and form is focused
        if (e.key === 'Enter' && selectedFile && !submitBtn.disabled) {
            if (document.activeElement === submitBtn || !document.activeElement.closest('input, textarea')) {
                submitBtn.click();
            }
        }
    });

    // Add file validation on input
    fileInput.addEventListener('input', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    // Initialize tooltips for better UX
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(10, 10, 15, 0.95);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.2s ease;
                border: 1px solid rgba(0, 212, 255, 0.2);
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 10 + 'px';
            tooltip.style.transform = 'translate(-50%, -100%)';
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translate(-50%, -110%)';
            }, 10);
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.style.opacity = '0';
                this._tooltip.style.transform = 'translate(-50%, -90%)';
                setTimeout(() => {
                    if (this._tooltip && this._tooltip.parentElement) {
                        this._tooltip.remove();
                    }
                }, 200);
            }
        });
    });
});

// Add global styles for animations
const globalStyles = document.createElement('style');
globalStyles.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
    }
    
    .drag-over {
        animation: pulse 0.5s ease;
        border-color: #00d4ff !important;
        box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2) !important;
    }
    
    .btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .btn:active {
        transform: translateY(0) scale(0.98) !important;
    }
    
    .btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }
    
    .processing-step {
        transition: all 0.3s ease;
    }
    
    .processing-step.active {
        transform: translateX(10px);
        border-left: 3px solid #00d4ff;
    }
    
    .processing-step.completed {
        opacity: 0.8;
    }
    
    .progress-bar {
        overflow: hidden;
        position: relative;
    }
    
    .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            transparent);
        animation: shimmer 2s infinite;
    }
    
    .file-info-enter {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fade-in {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(globalStyles);