const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const tabTitle = document.getElementById('tabTitle');
const tabButtons = document.querySelectorAll('.tab-button');

const DELETE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const tasks = [];
let currentTab = 'active';

function formatTimeRemaining(expiresAt) {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) {
    return 'Expired';
  }

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m left`;
}

function purgeExpiredDeletedTasks() {
  const now = Date.now();
  for (let i = tasks.length - 1; i >= 0; i -= 1) {
    const task = tasks[i];
    if (task.status === 'deleted' && now - task.deletedAt >= DELETE_RETENTION_MS) {
      tasks.splice(i, 1);
    }
  }
}

function getFilteredTasks() {
  return tasks.filter((task) => task.status === currentTab);
}

function getEmptyMessage() {
  if (currentTab === 'active') {
    return 'No tasks in Your Tasks yet. Add one above to get started.';
  }
  if (currentTab === 'completed') {
    return 'No completed tasks yet.';
  }
  return 'No deleted tasks.';
}

function setActiveTab(tabName) {
  currentTab = tabName;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('is-active', isActive);
  });

  const titles = {
    active: 'Your Tasks',
    completed: 'Completed Tasks',
    deleted: 'Deleted Tasks',
  };

  tabTitle.textContent = titles[tabName];
  taskList.dataset.tab = tabName;
  renderTasks();
}

function renderTasks() {
  purgeExpiredDeletedTasks();
  taskList.innerHTML = '';

  const visibleTasks = getFilteredTasks();

  if (visibleTasks.length === 0) {
    emptyState.textContent = getEmptyMessage();
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  for (const task of visibleTasks) {
    const item = document.createElement('li');
    item.className = `task-item ${task.status}`;

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    if (task.status === 'active') {
      const completeButton = document.createElement('button');
      completeButton.type = 'button';
      completeButton.textContent = 'Done';
      completeButton.addEventListener('click', () => {
        task.status = 'completed';
        task.deletedAt = null;
        renderTasks();
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        task.status = 'deleted';
        task.deletedAt = Date.now();
        renderTasks();
      });

      actions.append(completeButton, deleteButton);
    }

    if (task.status === 'completed') {
      const moveBackButton = document.createElement('button');
      moveBackButton.type = 'button';
      moveBackButton.textContent = 'Move to Your Tasks';
      moveBackButton.addEventListener('click', () => {
        task.status = 'active';
        task.deletedAt = null;
        renderTasks();
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        task.status = 'deleted';
        task.deletedAt = Date.now();
        renderTasks();
      });

      actions.append(moveBackButton, deleteButton);
    }

    if (task.status === 'deleted') {
      const countdown = document.createElement('span');
      countdown.className = 'countdown';
      countdown.textContent = `Auto-remove in ${formatTimeRemaining(task.deletedAt + DELETE_RETENTION_MS)}`;

      const removeNowButton = document.createElement('button');
      removeNowButton.type = 'button';
      removeNowButton.className = 'delete-now';
      removeNowButton.textContent = 'Delete Right Away';
      removeNowButton.addEventListener('click', () => {
        const index = tasks.indexOf(task);
        if (index >= 0) {
          tasks.splice(index, 1);
        }
        renderTasks();
      });

      actions.append(countdown, removeNowButton);
    }

    item.append(text, actions);
    taskList.append(item);
  }
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.push({ text, status: 'active', deletedAt: null });
  taskInput.value = '';
  taskInput.focus();
  renderTasks();
}

addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTask();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.tab);
  });
});

setInterval(() => {
  if (currentTab === 'deleted') {
    renderTasks();
  } else {
    purgeExpiredDeletedTasks();
  }
}, 60 * 1000);

setActiveTab('active');
