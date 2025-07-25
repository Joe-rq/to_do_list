class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    }

    cacheElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.actionsSection = document.getElementById('actionsSection');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // 防止输入框中的回车键触发其他事件
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) {
            this.showToast('请输入任务内容');
            return;
        }

        const task = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.showToast('任务添加成功！');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.showToast(task.completed ? '任务已完成！' : '任务标记为未完成');
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
        this.showToast('任务已删除');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showToast('没有已完成的任务');
            return;
        }

        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
        this.showToast(`已清除 ${completedCount} 个完成的任务`);
    }

    clearAll() {
        if (this.tasks.length === 0) {
            this.showToast('没有任务可清空');
            return;
        }

        if (confirm('确定要清空所有任务吗？此操作不可恢复。')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showToast('所有任务已清空');
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;

        this.actionsSection.style.display = total > 0 ? 'flex' : 'none';
    }

    render() {
        this.updateStats();
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = this.getEmptyState();
            return;
        }

        this.tasksList.innerHTML = filteredTasks
            .map(task => this.createTaskHTML(task))
            .join('');

        // 绑定事件到新生成的元素
        this.bindTaskEvents();
    }

    getEmptyState() {
        const messages = {
            all: { title: '暂无待办事项', desc: '开始添加你的第一个任务吧！' },
            active: { title: '没有进行中的任务', desc: '太棒了！所有任务都完成了！' },
            completed: { title: '没有已完成的任务', desc: '加油！完成一些任务吧！' }
        };

        const message = messages[this.currentFilter];
        return `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3 class="empty-title">${message.title}</h3>
                <p class="empty-description">${message.desc}</p>
            </div>
        `;
    }

    createTaskHTML(task) {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                         onclick="todoApp.toggleTask(${task.id})">
                    </div>
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                </div>
                <div class="task-actions">
                    <button class="action-btn danger" onclick="todoApp.deleteTask(${task.id})" 
                            aria-label="删除任务">
                        删除
                    </button>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        // 事件已经在HTML中通过onclick绑定，这里可以添加其他交互
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// 初始化应用
const todoApp = new TodoApp();

// 添加一些开发工具
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.todoApp = todoApp;
    console.log('🚀 Todo App 已启动');
    console.log('💡 提示：在控制台输入 todoApp 查看应用实例');
}