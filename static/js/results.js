// Results page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get results from sessionStorage
    const resultsData = sessionStorage.getItem('spamDetectionResults');

    if (!resultsData) {
        // If no results, redirect to upload page
        window.location.href = '/upload';
        return;
    }

    const results = JSON.parse(resultsData);

    // Populate metrics with animation
    animateValue('testAccuracy', 0, (results.test_accuracy * 100), 2000, '%', 2);
    animateValue('trainAccuracy', 0, (results.train_accuracy * 100), 2000, '%', 2);
    animateValue('vocabSize', 0, results.vocabulary_size || 0, 1500, '', 0);
    animateValue('balancedSamples', 0, results.balanced_samples || 0, 1500, '', 0);

    // Populate dataset info
    document.getElementById('totalSamples').textContent = results.total_samples?.toLocaleString() || '0';
    document.getElementById('hamSamples').textContent = results.ham_samples?.toLocaleString() || '0';
    document.getElementById('spamSamples').textContent = results.spam_samples?.toLocaleString() || '0';
    document.getElementById('trainSamples').textContent = results.train_samples?.toLocaleString() || '0';
    document.getElementById('testSamples').textContent = results.test_samples?.toLocaleString() || '0';

    // Display charts with staggered animations
    if (results.original_distribution_plot) {
        const img = document.getElementById('originalDistPlot');
        img.src = 'data:image/png;base64,' + results.original_distribution_plot;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'all 0.6s ease';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 100);
    }

    if (results.balanced_distribution_plot) {
        const img = document.getElementById('balancedDistPlot');
        img.src = 'data:image/png;base64,' + results.balanced_distribution_plot;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'all 0.6s ease 0.2s';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 300);
    }

    // Display word clouds
    if (results.ham_wordcloud) {
        const img = document.getElementById('hamWordcloud');
        img.src = 'data:image/png;base64,' + results.ham_wordcloud;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'translateX(-20px)';
        img.style.transition = 'all 0.6s ease 0.4s';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'translateX(0)';
        }, 500);
    }

    if (results.spam_wordcloud) {
        const img = document.getElementById('spamWordcloud');
        img.src = 'data:image/png;base64,' + results.spam_wordcloud;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'translateX(20px)';
        img.style.transition = 'all 0.6s ease 0.6s';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'translateX(0)';
        }, 700);
    }

    // Display performance plots
    if (results.confusion_matrix_plot) {
        const img = document.getElementById('confusionMatrixPlot');
        img.src = 'data:image/png;base64,' + results.confusion_matrix_plot;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95) translateY(20px)';
        img.style.transition = 'all 0.6s ease 0.8s';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1) translateY(0)';
        }, 900);
    }

    if (results.feature_importance_plot) {
        const img = document.getElementById('featureImportancePlot');
        img.src = 'data:image/png;base64,' + results.feature_importance_plot;
        img.style.display = 'block';
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95) translateY(20px)';
        img.style.transition = 'all 0.6s ease 1s';
        setTimeout(() => {
            img.style.opacity = '1';
            img.style.transform = 'scale(1) translateY(0)';
        }, 1100);
    }

    // Display sample predictions
    displaySamplePredictions(results.sample_predictions || []);

    // Setup email testing functionality
    setupEmailTesting();

    // Animate metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.9)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
            
            // Add pulsing animation to accuracy card
            if (index === 0 && results.test_accuracy > 0.9) {
                card.style.animation = 'pulse 2s ease-in-out 0.5s';
            }
        }, index * 150);
    });

    // Function to animate counter values
    function animateValue(id, start, end, duration, suffix = '', decimals = 0) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;

            element.textContent = current.toFixed(decimals) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                
                // Add bounce animation for predictions
                if (entry.target.classList.contains('prediction-card')) {
                    entry.target.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }
            }
        });
    }, observerOptions);

    // Observe section cards
    document.querySelectorAll('.results-section-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.98)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe chart cards
    document.querySelectorAll('.chart-card, .wordcloud-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.98)';
        card.style.transition = `all 0.6s ease ${index * 0.15}s`;
        observer.observe(card);
    });

    // Add celebration effect for high accuracy
    setTimeout(() => {
        if (results.test_accuracy > 0.85) {
            createConfetti();
            showSuccessMessage(`Great! Model accuracy: ${(results.test_accuracy * 100).toFixed(1)}%`);
        }
    }, 1000);

    // Log classification report to console for debugging
    if (results.classification_report) {
        console.group('📊 Classification Report');
        console.log('Precision - Ham:', (results.classification_report['Ham']?.precision * 100).toFixed(1) + '%');
        console.log('Precision - Spam:', (results.classification_report['Spam']?.precision * 100).toFixed(1) + '%');
        console.log('Recall - Ham:', (results.classification_report['Ham']?.recall * 100).toFixed(1) + '%');
        console.log('Recall - Spam:', (results.classification_report['Spam']?.recall * 100).toFixed(1) + '%');
        console.log('F1-Score - Ham:', (results.classification_report['Ham']?.['f1-score'] * 100).toFixed(1) + '%');
        console.log('F1-Score - Spam:', (results.classification_report['Spam']?.['f1-score'] * 100).toFixed(1) + '%');
        console.groupEnd();
    }
});

function displaySamplePredictions(predictions) {
    const container = document.getElementById('predictionsGrid');
    
    if (!container) return;
    
    if (predictions.length === 0) {
        container.innerHTML = '<p class="no-predictions">No sample predictions available</p>';
        return;
    }
    
    const predictionsHTML = predictions.map((pred, index) => `
        <div class="prediction-card ${pred.prediction === 'Spam' ? 'spam' : 'ham'}" 
             style="opacity: 0; transform: translateY(20px) scale(0.95);"
             data-index="${index}">
            <div class="prediction-header">
                <span class="prediction-badge">
                    ${pred.prediction === 'Spam' ? '🚨 SPAM' : '✅ HAM'}
                </span>
                <span class="prediction-confidence">
                    ${(pred.spam_probability * 100).toFixed(1)}% confidence
                </span>
            </div>
            <div class="prediction-content">
                <p class="prediction-text">${pred.text}</p>
                <div class="prediction-probabilities">
                    <div class="probability-item">
                        <span class="probability-label">Ham:</span>
                        <div class="probability-bar-small">
                            <div class="probability-fill ham" style="width: 0%">
                                <span class="probability-fill-text">${(pred.ham_probability * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="probability-item">
                        <span class="probability-label">Spam:</span>
                        <div class="probability-bar-small">
                            <div class="probability-fill spam" style="width: 0%">
                                <span class="probability-fill-text">${(pred.spam_probability * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = predictionsHTML;
    
    // Animate prediction cards in sequence
    setTimeout(() => {
        const cards = container.querySelectorAll('.prediction-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Animate probability bars
                const hamBar = card.querySelector('.probability-fill.ham');
                const spamBar = card.querySelector('.probability-fill.spam');
                
                if (hamBar) {
                    setTimeout(() => {
                        hamBar.style.width = `${parseFloat(hamBar.querySelector('.probability-fill-text').textContent)}%`;
                    }, 200);
                }
                
                if (spamBar) {
                    setTimeout(() => {
                        spamBar.style.width = `${parseFloat(spamBar.querySelector('.probability-fill-text').textContent)}%`;
                    }, 400);
                }
            }, index * 100);
        });
    }, 500);
}

function setupEmailTesting() {
    const testButton = document.getElementById('testButton');
    const emailInput = document.getElementById('emailText');
    const resultDiv = document.getElementById('predictionResult');
    
    if (!testButton || !emailInput || !resultDiv) return;
    
    testButton.addEventListener('click', async () => {
        const emailText = emailInput.value.trim();
        
        if (!emailText) {
            showNotification('Please enter email text to test', 'warning');
            return;
        }
        
        // Show loading state
        const originalText = testButton.innerHTML;
        testButton.innerHTML = `
            <span class="loading">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </span>
        `;
        testButton.disabled = true;
        
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
            
            // Update result display
            const predictionLabel = document.getElementById('predictionLabel');
            predictionLabel.textContent = data.prediction;
            predictionLabel.className = data.prediction === 'Spam' ? 'spam-text' : 'ham-text';
            
            // Animate probability bars
            animateProbabilityBar('hamProbabilityBar', data.ham_probability * 100);
            animateProbabilityBar('spamProbabilityBar', data.spam_probability * 100);
            
            // Update probability text
            document.getElementById('hamProbability').textContent = `${(data.ham_probability * 100).toFixed(1)}%`;
            document.getElementById('spamProbability').textContent = `${(data.spam_probability * 100).toFixed(1)}%`;
            
            // Show processed text
            const processedText = document.getElementById('processedText');
            if (processedText) {
                processedText.textContent = `Processed: ${data.processed_text || 'N/A'}`;
            }
            
            // Show result with animation
            resultDiv.style.display = 'block';
            resultDiv.style.opacity = '0';
            resultDiv.style.transform = 'translateY(20px) scale(0.95)';
            
            setTimeout(() => {
                resultDiv.style.opacity = '1';
                resultDiv.style.transform = 'translateY(0) scale(1)';
                resultDiv.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Scroll to result
                resultDiv.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
            
            // Show success notification for high confidence
            const confidence = Math.max(data.ham_probability, data.spam_probability);
            if (confidence > 0.9) {
                showNotification(
                    `High confidence! ${(confidence * 100).toFixed(1)}% sure this is ${data.prediction.toLowerCase()}`,
                    'success'
                );
            }
            
        } catch (error) {
            console.error('Prediction error:', error);
            showNotification(`Error: ${error.message}`, 'error');
        } finally {
            // Reset button
            testButton.innerHTML = originalText;
            testButton.disabled = false;
        }
    });
}

function animateProbabilityBar(barId, targetWidth) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    
    bar.style.width = '0%';
    bar.style.transition = 'none';
    
    // Trigger reflow
    bar.offsetHeight;
    
    bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
        bar.style.width = `${targetWidth}%`;
    }, 50);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
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
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    // Set background
    const colors = {
        error: 'linear-gradient(135deg, #ff4757, #ff3838)',
        warning: 'linear-gradient(135deg, #ffa502, #ff7f00)',
        success: 'linear-gradient(135deg, #00d4ff, #0099ff)',
        info: 'linear-gradient(135deg, #3742fa, #5352ed)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Auto remove
    const autoRemove = setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
    
    // Cancel auto-remove on hover
    notification.addEventListener('mouseenter', () => clearTimeout(autoRemove));
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

function showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `
        <div class="success-content">
            <span class="success-icon">🎉</span>
            <span class="success-text">${message}</span>
        </div>
    `;
    
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        background: linear-gradient(135deg, #00d4ff, #0099ff);
        color: white;
        padding: 16px 32px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        z-index: 10000;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    document.body.appendChild(successMsg);
    
    // Animate in
    setTimeout(() => {
        successMsg.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Animate out
    setTimeout(() => {
        successMsg.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => successMsg.remove(), 500);
    }, 3000);
}

// Simple confetti effect
function createConfetti() {
    const colors = ['#00d4ff', '#ff006e', '#00ff88', '#ffd700', '#9d4edd'];
    const confettiCount = 60;
    
    // Add confetti styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-20px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(calc(100vh + 20px)) rotate(360deg);
                opacity: 0;
            }
        }
        
        .confetti-piece {
            position: fixed;
            width: 10px;
            height: 10px;
            pointer-events: none;
            z-index: 9999;
        }
    `;
    document.head.appendChild(style);
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const size = 6 + Math.random() * 8;
            const shape = Math.random() > 0.5 ? '50%' : '0';
            const rotation = Math.random() * 360;
            const duration = 2000 + Math.random() * 2000;
            const delay = Math.random() * 500;
            const xMovement = (Math.random() - 0.5) * 200;
            
            confetti.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${shape};
                transform: rotate(${rotation}deg);
                animation: confettiFall ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards;
                box-shadow: 0 0 10px ${color};
            `;
            
            document.body.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                if (confetti.parentElement) {
                    confetti.remove();
                }
            }, duration + delay + 100);
        }, i * 30);
    }
}

// Add CSS animations
const animationsStyle = document.createElement('style');
animationsStyle.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(0, 212, 255, 0.4); }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .loading {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
    
    .loading .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        animation: loadingDots 1.4s infinite ease-in-out both;
    }
    
    .loading .dot:nth-child(1) { animation-delay: -0.32s; }
    .loading .dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loadingDots {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
    
    .probability-fill {
        position: relative;
        transition: width 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
        overflow: hidden;
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
        white-space: nowrap;
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
    
    .prediction-card {
        transition: all 0.3s ease !important;
    }
    
    .prediction-card:hover {
        transform: translateY(-4px) scale(1.02) !important;
        box-shadow: 0 12px 24px rgba(0, 212, 255, 0.2) !important;
    }
    
    .prediction-card.spam:hover {
        box-shadow: 0 12px 24px rgba(255, 0, 110, 0.2) !important;
    }
`;
document.head.appendChild(animationsStyle);