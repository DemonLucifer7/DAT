document.addEventListener('DOMContentLoaded', () => {
    const activityList = document.getElementById('activity-list');
    const completedSpan = document.getElementById('completed');
    const dateInput = document.getElementById('date');
    
    // Load activity data for specific dates from localStorage
    let activityDataByDate = JSON.parse(localStorage.getItem('activityDataByDate')) || {};
    
    // Set the current date to today's date by default
    let currentDate = new Date().toISOString().split('T')[0];
    
    // Default activities
    const defaultActivities = [
        { name: 'Water Intake (3.5 ltr)', max: 3.5, value: 0, type: 'water' },
        { name: 'Calories (3000)', max: 3000, value: 0, type: 'calories' },
        { name: 'Workout', max: 100, value: 0, type: 'default' },
        { name: 'Study', max: 100, value: 0, type: 'default' },
        { name: 'NO Fap', max: 100, value: 0, type: 'default' },
    ];

    // Function to update completion percentage
    const updateCompletion = () => {
        const activities = activityDataByDate[currentDate] || defaultActivities;
        const completedCount = activities.filter(a => a.value === a.max).length;
        const percentage = Math.round((completedCount / activities.length) * 100);
        completedSpan.textContent = `Completed - ${percentage}%`;
    };

    // Function to render activities for the current date
    const renderActivities = () => {
        activityList.innerHTML = '';
        const activities = activityDataByDate[currentDate] || JSON.parse(JSON.stringify(defaultActivities));

        activities.forEach((activity, index) => {
            const activityElement = document.createElement('div');
            activityElement.classList.add('activity');
            
            activityElement.innerHTML = `
                <div class="activity-name">${activity.name}</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progress-${index}">
                        <div class="progress-bar-fill" style="width: ${(activity.value / activity.max) * 100}%"></div>
                    </div>
                    <div class="status-indicator ${activity.value === activity.max ? 'completed' : ''}" id="status-${index}"></div>
                </div>
                <div class="remaining-value" id="remaining-${index}"></div>
            `;

            // Add sliding functionality for the progress bar
            const progressBar = activityElement.querySelector(`#progress-${index}`);
            const progressBarFill = progressBar.querySelector('.progress-bar-fill');
            const remainingValue = activityElement.querySelector(`#remaining-${index}`);
            let isDragging = false;

            const updateRemaining = () => {
                if (activity.type === 'water') {
                    remainingValue.textContent = `Remaining: ${(activity.max - activity.value).toFixed(1)} ltr`;
                } else if (activity.type === 'calories') {
                    remainingValue.textContent = `Remaining: ${Math.round(activity.max - activity.value)} cal`;
                } else {
                    remainingValue.textContent = '';
                }
            };

            progressBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                updateProgress(e);
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                activityDataByDate[currentDate] = activities;
                localStorage.setItem('activityDataByDate', JSON.stringify(activityDataByDate));
                updateCompletion();
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    updateProgress(e);
                }
            });

            const updateProgress = (e) => {
                const rect = progressBar.getBoundingClientRect();
                let newWidth = e.clientX - rect.left;
                const totalWidth = rect.width;
                newWidth = Math.max(0, Math.min(newWidth, totalWidth));
                const percentage = (newWidth / totalWidth) * activity.max;
                activity.value = Math.round(percentage * 10) / 10;
                progressBarFill.style.width = `${(activity.value / activity.max) * 100}%`;

                const statusIndicator = document.getElementById(`status-${index}`);
                if (activity.value === activity.max) {
                    statusIndicator.classList.add('completed');
                } else {
                    statusIndicator.classList.remove('completed');
                }

                updateRemaining();
            };

            updateRemaining();
            activityList.appendChild(activityElement);
        });
    };

    // Add activity button logic
    const addActivityBtn = document.getElementById('add-activity-btn');
    addActivityBtn.addEventListener('click', () => {
        const newActivity = prompt('Enter new activity name:');
        if (newActivity) {
            const activities = activityDataByDate[currentDate] || defaultActivities;
            activities.push({ name: newActivity, max: 100, value: 0, type: 'default' });
            activityDataByDate[currentDate] = activities;
            localStorage.setItem('activityDataByDate', JSON.stringify(activityDataByDate));
            renderActivities();
            updateCompletion();
        }
    });

    // Handle date change
    dateInput.addEventListener('change', (e) => {
        currentDate = e.target.value;

        // If the date does not have activity data, create a new default set of activities
        if (!activityDataByDate[currentDate]) {
            activityDataByDate[currentDate] = JSON.parse(JSON.stringify(defaultActivities));
        }

        // Reset activities for new dates, load saved progress for past dates
        renderActivities();
        updateCompletion();
    });

    // Initialize with today's date
    dateInput.value = currentDate;
    renderActivities();
    updateCompletion();
});
