// Set active navigation link
document.addEventListener('DOMContentLoaded', function() {
    setActiveNavLink();
    initializeLocalStorage();
});

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (currentPage === '' || currentPage === 'index.html') {
            if (href === '#' || href === 'index.html') {
                link.classList.add('active');
            }
        } else if (href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Initialize localStorage for progress tracking
function initializeLocalStorage() {
    if (!localStorage.getItem('ieltsProgress')) {
        localStorage.setItem('ieltsProgress', JSON.stringify({
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            brainstormSessions: 0,
            essaysWritten: 0
        }));
    }
}

// Update progress
function updateProgress(type) {
    const progress = JSON.parse(localStorage.getItem('ieltsProgress'));
    
    if (type === 'lesson') {
        progress.lessonsCompleted++;
    } else if (type === 'exercise') {
        progress.exercisesCompleted++;
    } else if (type === 'brainstorm') {
        progress.brainstormSessions++;
    } else if (type === 'essay') {
        progress.essaysWritten++;
    }
    
    localStorage.setItem('ieltsProgress', JSON.stringify(progress));
}

// Get progress
function getProgress() {
    return JSON.parse(localStorage.getItem('ieltsProgress'));
}

// Brainstorm Tool Functions
function addIdea(buttonElement) {
    const input = buttonElement.previousElementSibling;
    const ideaText = input.value.trim();
    
    if (ideaText === '') {
        alert('Please enter an idea');
        return;
    }
    
    const ideaList = buttonElement.parentElement.querySelector('.ideas-list');
    if (!ideaList) return;
    
    const ideaItem = document.createElement('div');
    ideaItem.className = 'idea-item';
    ideaItem.innerHTML = `
        <span>${ideaText}</span>
        <button class="delete-btn" onclick="deleteIdea(this)">Delete</button>
    `;
    
    ideaList.appendChild(ideaItem);
    input.value = '';
    input.focus();
}

function deleteIdea(buttonElement) {
    buttonElement.parentElement.remove();
}

// Hint Toggle
function toggleHint(element) {
    const hint = element.nextElementSibling;
    if (hint && hint.classList.contains('hint')) {
        hint.classList.toggle('show');
        element.textContent = hint.classList.contains('show') ? 'Hide Hint' : 'Show Hint';
    }
}

// Feedback Functions
function submitExercise(exerciseNumber) {
    const answer = document.getElementById(`exercise-${exerciseNumber}-answer`);
    
    if (!answer || answer.value.trim() === '') {
        alert('Please write your essay before submitting');
        return;
    }
    
    // Store the essay
    const exercises = JSON.parse(localStorage.getItem('exercises') || '{}');
    exercises[`exercise-${exerciseNumber}`] = answer.value;
    localStorage.setItem('exercises', JSON.stringify(exercises));
    
    // Update progress
    updateProgress('exercise');
    
    // Show success message
    alert('Essay submitted! Your answer has been saved.');
    
    // Get feedback
    const feedback = generateFeedback(answer.value);
    showFeedback(feedback, exerciseNumber);
}

function generateFeedback(essayText) {
    let score = 0;
    let feedback = [];
    
    // Check essay length
    const wordCount = essayText.trim().split(/\s+/).length;
    if (wordCount >= 250) {
        score += 20;
        feedback.push('✓ Good essay length (250+ words)');
    } else {
        feedback.push(`✗ Essay is too short (${wordCount} words, aim for 250+)`);
    }
    
    // Check for introduction
    if (essayText.toLowerCase().includes('introduction') || 
        essayText.split('\n')[0].length > 50) {
        score += 20;
        feedback.push('✓ Has introduction');
    } else {
        feedback.push('✗ Consider starting with a clear introduction');
    }
    
    // Check for paragraphs
    const paragraphs = essayText.split('\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 4) {
        score += 20;
        feedback.push(`✓ Good paragraph structure (${paragraphs.length} paragraphs)`);
    } else {
        feedback.push(`✗ Consider more paragraphs (current: ${paragraphs.length}, aim for 4-5)`);
    }
    
    // Check for examples
    if (essayText.toLowerCase().includes('example') || 
        essayText.toLowerCase().includes('for instance') ||
        essayText.toLowerCase().includes('for example')) {
        score += 20;
        feedback.push('✓ Uses examples to support ideas');
    } else {
        feedback.push('✗ Try adding examples to support your arguments');
    }
    
    // Check for conclusion
    if (essayText.toLowerCase().includes('conclusion') ||
        essayText.toLowerCase().includes('in conclusion') ||
        essayText.toLowerCase().includes('to sum up')) {
        score += 20;
        feedback.push('✓ Has conclusion');
    } else {
        feedback.push('✗ Don\'t forget a conclusion');
    }
    
    return { score, feedback };
}

function showFeedback(feedbackData, exerciseNumber) {
    const feedbackDiv = document.getElementById(`exercise-${exerciseNumber}-feedback`);
    if (!feedbackDiv) return;
    
    let feedbackHtml = `<div style="background-color: #e8f4f8; padding: 1rem; border-radius: 5px; margin-top: 1rem;">`;
    feedbackHtml += `<h4>Feedback Score: ${feedbackData.score}/100</h4>`;
    feedbackHtml += `<div class="progress-bar" style="margin: 1rem 0;">`;
    feedbackHtml += `<div class="progress-fill" style="width: ${feedbackData.score}%">${feedbackData.score}%</div>`;
    feedbackHtml += `</div>`;
    feedbackHtml += `<ul>`;
    
    feedbackData.feedback.forEach(item => {
        feedbackHtml += `<li>${item}</li>`;
    });
    
    feedbackHtml += `</ul></div>`;
    feedbackDiv.innerHTML = feedbackHtml;
}

// Reset exercise
function resetExercise(exerciseNumber) {
    const answer = document.getElementById(`exercise-${exerciseNumber}-answer`);
    if (answer) {
        answer.value = '';
        const feedbackDiv = document.getElementById(`exercise-${exerciseNumber}-feedback`);
        if (feedbackDiv) {
            feedbackDiv.innerHTML = '';
        }
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Export essay as text
function downloadEssay(exerciseNumber) {
    const answer = document.getElementById(`exercise-${exerciseNumber}-answer`);
    if (!answer || answer.value.trim() === '') {
        alert('No essay to download');
        return;
    }
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(answer.value));
    element.setAttribute('download', `essay-${exerciseNumber}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Load essay from storage
function loadEssay(exerciseNumber) {
    const exercises = JSON.parse(localStorage.getItem('exercises') || '{}');
    const savedEssay = exercises[`exercise-${exerciseNumber}`];
    
    if (savedEssay) {
        const answerElement = document.getElementById(`exercise-${exerciseNumber}-answer`);
        if (answerElement) {
            answerElement.value = savedEssay;
        }
    }
}

// Clear all saved essays
function clearAllEssays() {
    if (confirm('Are you sure you want to clear all saved essays?')) {
        localStorage.removeItem('exercises');
        location.reload();
    }
}

// Update progress display
function updateProgressDisplay() {
    const progress = getProgress();
    const display = document.getElementById('progress-display');
    
    if (!display) return;
    
    display.innerHTML = `
        <div class="stats">
            <div class="stat-box">
                <div class="number">${progress.lessonsCompleted}</div>
                <div class="label">Lessons Completed</div>
            </div>
            <div class="stat-box">
                <div class="number">${progress.exercisesCompleted}</div>
                <div class="label">Exercises Completed</div>
            </div>
            <div class="stat-box">
                <div class="number">${progress.brainstormSessions}</div>
                <div class="label">Brainstorm Sessions</div>
            </div>
            <div class="stat-box">
                <div class="number">${progress.essaysWritten}</div>
                <div class="label">Essays Written</div>
            </div>
        </div>
    `;
}

// Initialize on page load
window.addEventListener('load', function() {
    updateProgressDisplay();
});