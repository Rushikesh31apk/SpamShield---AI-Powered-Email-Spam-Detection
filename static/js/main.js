// Results page animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    // Load results from session storage
    loadResults();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize animations
    initAnimations();
});

function loadResults() {
    // Get results from session storage
    const results = JSON.parse(sessionStorage.getItem('spamDetectionResults') || '{}');
    
    if (Object.keys(results).length === 0) {
        showNotification('No results found. Please train a model first.', 'error');
        setTimeout(() => {
            window.location.href = '/upload';
        }, 2000);
        return;
    }
    
    displayResults(results);
}

function setupEventListeners() {
    // Email test functionality
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', testEmail);
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Email textarea auto-expand
    const emailTextarea = document.getElementById('emailText');
    if (emailTextarea) {
        emailTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

function initAnimations() {
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special animation for metric cards
                if (entry.target.classList.contains('metric-card')) {
                    entry.target.classList.add('animate-in');
                }
                
                // Special animation for prediction cards
                if (entry.target.classList.contains('prediction-card')) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, entry.target.dataset.index * 100);
                }
            }
        });
    }, observerOptions);

    // Observe metric cards
    document.querySelectorAll('.metric-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });

    // Observe chart cards
    document.querySelectorAll('.chart-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe wordcloud cards
    document.querySelectorAll('.wordcloud-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(40px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                navbar.style.background = 'rgba(10, 10, 15, 0.98)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.15)';
            } else {
                navbar.style.background = 'rgba(10, 10, 15, 0.95)';
                navbar.style.backdropFilter = 'blur(5px)';
                navbar.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }
}

function displayResults(results) {
    // Update metrics with animation
    animateMetric('testAccuracy', 0, results.test_accuracy * 100, 1.5);
    animateMetric('trainAccuracy', 0, results.train_accuracy * 100, 1.5);
    animateMetric('vocabSize', 0, results.vocabulary_size, 1);
    animateMetric('balancedSamples', 0, results.balanced_samples, 1);
    
    // Update dataset info
    document.getElementById('totalSamples').textContent = results.total_samples || '--';
    document.getElementById('hamSamples').textContent = results.ham_samples || '--';
    document.getElementById('spamSamples').textContent = results.spam_samples || '--';
    document.getElementById('trainSamples').textContent = results.train_samples || '--';
    document.getElementById('testSamples').textContent = results.test_samples || '--';
    
    // Display plots with fade-in effect
    setTimeout(() => {
        displayImage('originalDistPlot', results.original_distribution_plot);
        displayImage('balancedDistPlot', results.balanced_distribution_plot);
        displayImage('hamWordcloud', results.ham_wordcloud);
        displayImage('spamWordcloud', results.spam_wordcloud);
        displayImage('confusionMatrixPlot', results.confusion_matrix_plot);
        displayImage('featureImportancePlot', results.feature_importance_plot);
    }, 300);
    
    // Display sample predictions with staggered animation
    displaySamplePredictions(results.sample_predictions || []);
    
    // Log additional data for debugging
    if (results.classification_report) {
        console.log('Classification Report:', results.classification_report);
    }
}

function animateMetric(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeProgress = easeOutCubic(progress);
        const currentValue = Math.floor(start + (end - start) * easeProgress);
        
        if (elementId.includes('Accuracy')) {
            element.textContent = `${currentValue.toFixed(2)}%`;
        } else {
            element.textContent = currentValue.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function displayImage(elementId, base64Image) {
    if (!base64Image) return;
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.src = `data:image/png;base64,${base64Image}`;
    element.style.opacity = '0';
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'all 0.6s ease';
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.display = 'block';
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';
    }, 50);
}

function displaySamplePredictions(predictions) {
    const container = document.getElementById('predictionsGrid');
    
    if (predictions.length === 0) {
        container.innerHTML = '<p class="no-predictions">No sample predictions available</p>';
        return;
    }
    
    const predictionsHTML = predictions.map((pred, index) => `
        <div class="prediction-card ${pred.prediction === 'Spam' ? 'spam' : 'ham'}" 
             data-index="${index}"
             style="opacity: 0; transform: translateY(20px); transition: all 0.5s ease ${index * 0.1}s">
            <div class="prediction-header">
                <span class="prediction-badge">
                    ${pred.prediction === 'Spam' ? '🚨 SPAM' : '✅ HAM'}
                </span>
                <span class="prediction-confidence">
                    ${(pred.spam_probability * 100).toFixed(1)}% confident
                </span>
            </div>
            <div class="prediction-content">
                <p class="prediction-text">"${pred.text}"</p>
                <div class="prediction-probabilities">
                    <div class="probability-item">
                        <span class="probability-label">Ham:</span>
                        <div class="probability-bar-small">
                            <div class="probability-fill ham" 
                                 style="width: 0%; transition: width 1s ease ${index * 0.1 + 0.3}s">
                                <span class="probability-fill-text">${(pred.ham_probability * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="probability-item">
                        <span class="probability-label">Spam:</span>
                        <div class="probability-bar-small">
                            <div class="probability-fill spam" 
                                 style="width: 0%; transition: width 1s ease ${index * 0.1 + 0.5}s">
                                <span class="probability-fill-text">${(pred.spam_probability * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = predictionsHTML;
    
    // Animate predictions in
    setTimeout(() => {
        document.querySelectorAll('.prediction-card').forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            
            // Animate probability bars
            const hamBars = card.querySelectorAll('.probability-fill.ham');
            const spamBars = card.querySelectorAll('.probability-fill.spam');
            
            hamBars.forEach(bar => {
                const width = parseFloat(bar.parentElement.parentElement.querySelector('.probability-value')?.textContent || '0');
                setTimeout(() => {
                    bar.style.width = `${width}%`;
                }, 200);
            });
            
            spamBars.forEach(bar => {
                const width = parseFloat(bar.parentElement.parentElement.querySelector('.probability-value')?.textContent || '0');
                setTimeout(() => {
                    bar.style.width = `${width}%`;
                }, 400);
            });
        });
    }, 500);
}

async function testEmail() {
    const emailText = document.getElementById('emailText').value.trim();
    const resultDiv = document.getElementById('predictionResult');
    
    if (!emailText) {
        showNotification('Please enter some email text to test.', 'warning');
        return;
    }
    
    // Show loading state with animation
    const button = document.getElementById('testButton');
    const originalContent = button.innerHTML;
    button.innerHTML = `
        <span class="loading-text">
            <span class="loading-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </span>
    `;
    button.disabled = true;
    
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_text: emailText })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Animate in the result
        resultDiv.style.display = 'block';
        resultDiv.style.opacity = '0';
        resultDiv.style.transform = 'translateY(20px)';
        
        // Update prediction label with animation
        const predictionLabel = document.getElementById('predictionLabel');
        predictionLabel.textContent = data.prediction;
        predictionLabel.className = data.prediction === 'Spam' ? 'spam-text' : 'ham-text';
        
        // Animate probability bars
        animateProbabilityBar('hamProbabilityBar', data.ham_probability);
        animateProbabilityBar('spamProbabilityBar', data.spam_probability);
        
        // Update probability values
        document.getElementById('hamProbability').textContent = `${(data.ham_probability * 100).toFixed(1)}%`;
        document.getElementById('spamProbability').textContent = `${(data.spam_probability * 100).toFixed(1)}%`;
        
        // Update processed text
        const processedText = document.getElementById('processedText');
        processedText.textContent = `Processed text: ${data.processed_text || 'N/A'}`;
        
        // Show result with animation
        setTimeout(() => {
            resultDiv.style.opacity = '1';
            resultDiv.style.transform = 'translateY(0)';
            resultDiv.style.transition = 'all 0.5s ease';
            
            // Scroll to result
            resultDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
        
        // Add celebratory effect for high confidence predictions
        if (Math.max(data.ham_probability, data.spam_probability) > 0.95) {
            showNotification(
                `High confidence prediction! (${(Math.max(data.ham_probability, data.spam_probability) * 100).toFixed(1)}%)`,
                'success'
            );
        }
        
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        // Reset button with animation
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.style.opacity = '0.8';
            button.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'scale(1)';
                button.style.transition = 'all 0.3s ease';
            }, 50);
        }, 300);
    }
}

function animateProbabilityBar(barId, probability) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    
    bar.style.width = '0%';
    bar.style.transition = 'none';
    
    // Trigger reflow
    bar.offsetHeight;
    
    bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
        bar.style.width = `${probability * 100}%`;
    }, 100);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icon based on type
    const icons = {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        z-index: 10000;
        min-width: 320px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    // Set background color based on type
    const colors = {
        error: 'linear-gradient(135deg, #ff4757, #ff3838)',
        warning: 'linear-gradient(135deg, #ffa502, #ff7f00)',
        success: 'linear-gradient(135deg, #00d4ff, #0099ff)',
        info: 'linear-gradient(135deg, #3742fa, #5352ed)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        .notification-close {
            background: none;
            border: none;
            color: rgba(255,255,255,0.8);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            margin: 0;
            line-height: 1;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        
        .notification-close:hover {
            color: white;
            background: rgba(255,255,255,0.1);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .notification-icon {
            font-size: 20px;
        }
        
        .notification-message {
            flex: 1;
            line-height: 1.4;
        }
        
        @keyframes slideInRight {
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
    
    // Override auto-remove on hover
    notification.addEventListener('mouseenter', () => {
        clearTimeout(autoRemove);
    });
    
    notification.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 400);
            }
        }, 3000);
    });
}

// Add CSS animations for metric cards
const style = document.createElement('style');
style.textContent = `
    .metric-card.animate-in {
        animation: metricPop 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes metricPop {
        0% {
            transform: scale(0.8) translateY(30px);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
    
    .prediction-card {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .prediction-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.15) !important;
    }
    
    .loading-text {
        display: flex;
        align-items: center;
        gap: 2px;
    }
    
    .loading-dots span {
        animation: loadingDot 1.4s infinite;
        opacity: 0;
    }
    
    .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes loadingDot {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
    }
    
    .probability-fill {
        position: relative;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    .probability-fill-text {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    
    .spam-text {
        color: #ff006e;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(255, 0, 110, 0.3);
    }
    
    .ham-text {
        color: #00d4ff;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
    }
`;
document.head.appendChild(style);