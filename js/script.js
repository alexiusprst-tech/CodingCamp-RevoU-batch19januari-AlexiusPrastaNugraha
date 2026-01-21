// To-Do List Application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.sortBy = 'date'; // 'date' or 'name'
        this.sortOrder = 'asc'; // 'asc' or 'desc'
        
        this.initializeElements();
        this.attachEventListeners();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dateInput = document.getElementById('dateInput');
        this.addBtn = document.getElementById('addBtn');
        this.searchInput = document.getElementById('searchInput');
        this.sortBtn = document.getElementById('sortBtn');
        this.filterBtn = document.getElementById('filterBtn');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.filterDropdown = document.getElementById('filterDropdown');
        this.tasksTableBody = document.getElementById('tasksTableBody');
        this.emptyState = document.getElementById('emptyState');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        this.progressPercentageEl = document.getElementById('progressPercentage');
        this.progressBar = document.getElementById('progressBar');


    }

    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.searchInput.addEventListener('input', () => this.render());
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });

        this.sortBtn.addEventListener('click', () => this.toggleSort());
        this.filterBtn.addEventListener('click', () => this.toggleFilterDropdown());
        this.deleteAllBtn.addEventListener('click', () => this.deleteAllTasks());

        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    validateInput() {
        const taskText = this.taskInput.value.trim();
        const dueDate = this.dateInput.value;

        if (!taskText) {
            this.showError('Please enter a task name');
            return false;
        }

        if (taskText.length > 100) {
            this.showError('Task name cannot exceed 100 characters');
            return false;
        }

        if (!dueDate) {
            this.showError('Please select a due date');
            return false;
        }

        const selectedDate = new Date(dueDate);
        if (selectedDate < new Date(new Date().toISOString().split('T')[0])) {
            this.showError('Due date cannot be in the past');
            return false;
        }

        return true;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        setTimeout(() => {
            this.errorMessage.classList.remove('show');
        }, 3000);
    }

    addTask() {
        if (!this.validateInput()) return;

        const task = {
            id: Date.now(),
            name: this.taskInput.value.trim(),
            dueDate: this.dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.dateInput.value = new Date().toISOString().split('T')[0];
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const newName = prompt('Edit task name:', task.name);
            if (newName !== null && newName.trim() !== '') {
                const newDate = prompt('Edit due date (YYYY-MM-DD):', task.dueDate);
                if (newDate !== null && newDate !== '') {
                    const selectedDate = new Date(newDate);
                    if (selectedDate >= new Date(new Date().toISOString().split('T')[0])) {
                        task.name = newName.trim();
                        task.dueDate = newDate;
                        this.saveTasks();
                        this.render();
                    } else {
                        this.showError('Due date cannot be in the past');
                    }
                }
            }
        }
    }

    deleteAllTasks() {
        if (this.tasks.length === 0) {
            this.showError('No tasks to delete');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
        }
    }

    toggleSort() {
        if (this.sortBy === 'date') {
            this.sortBy = 'name';
        } else {
            this.sortBy = 'date';
        }
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.render();
    }

    toggleFilterDropdown() {
        this.filterDropdown.classList.toggle('hidden');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-option').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.filterDropdown.classList.add('hidden');
        this.render();
    }

    getFilteredAndSortedTasks() {
        let filteredTasks = this.tasks;

        // Filter by status
        if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }

        // Filter by search term
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.name.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        filteredTasks.sort((a, b) => {
            let compareValue = 0;

            if (this.sortBy === 'date') {
                compareValue = new Date(a.dueDate) - new Date(b.dueDate);
            } else {
                compareValue = a.name.localeCompare(b.name);
            }

            return this.sortOrder === 'asc' ? compareValue : -compareValue;
        });

        return filteredTasks;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
        this.progressPercentageEl.textContent = progress + '%';
        this.progressBar.style.width = progress + '%';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }

        return date.toLocaleDateString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        });
    }

    render() {
        this.updateStats();

        const filteredTasks = this.getFilteredAndSortedTasks();

        // Clear table body
        this.tasksTableBody.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            filteredTasks.forEach(task => {
                this.tasksTableBody.appendChild(this.createTaskRow(task));
            });
        }
    }

    createTaskRow(task) {
        const tr = document.createElement('tr');

        const taskNameClass = task.completed ? 'task-name completed' : 'task-name';
        const statusClass = task.completed ? 'status-badge completed' : 'status-badge pending';
        const statusText = task.completed ? 'Completed' : 'Pending';

        tr.innerHTML = `
            <td class="${taskNameClass}">${this.escapeHtml(task.name)}</td>
            <td class="task-date">${this.formatDate(task.dueDate)}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td>
                <div class="actions">
                    <button class="action-btn toggle-btn" title="Toggle Status">✓</button>
                    <button class="action-btn edit-btn" title="Edit Task">✏</button>
                    <button class="action-btn delete-btn" title="Delete Task">🗑</button>
                </div>
            </td>
        `;

        // Add event listeners to action buttons
        tr.querySelector('.toggle-btn').addEventListener('click', () => this.toggleTaskStatus(task.id));
        tr.querySelector('.edit-btn').addEventListener('click', () => this.editTask(task.id));
        tr.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task.id));

        return tr;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});