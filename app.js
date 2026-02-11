const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');

const tasks = [];

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' done' : ''}`;

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = task.done ? 'Undo' : 'Done';
    toggle.addEventListener('click', () => {
      task.done = !task.done;
      renderTasks();
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => {
      const index = tasks.indexOf(task);
      tasks.splice(index, 1);
      renderTasks();
    });

    actions.append(toggle, remove);
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

  tasks.push({ text, done: false });
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

renderTasks();
