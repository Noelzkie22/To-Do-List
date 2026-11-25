document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const form = document.querySelector('.input-area');
  const emptyImage = document.querySelector('.empty-image');
  const progress = document.getElementById('progress');
  const numbers = document.getElementById('numbers');

  const toggleEmptyState = () => {
    emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
  };

  const updateStats = () => {
    const total = taskList.children.length;
    const completed = taskList.querySelectorAll('li.completed').length;
    numbers.textContent = `${completed}/${total}`;
    progress.style.width = total === 0 ? '0%' : `${(completed / total) * 100}%`;
  };

  // save every task's text and checked state
  const saveTasks = () => {
    const tasks = [...taskList.children].map((li) => ({
      text: li.querySelector('span').textContent,
      completed: li.classList.contains('completed'),
    }));
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Could not save tasks', e);
    }
  };

  // update everything on screen and in storage
  const refresh = () => {
    toggleEmptyState();
    updateStats();
    saveTasks();
  };

  const launchConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, disableForReducedMotion: false };

    const fire = (particleRatio, opts) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const checkAllCompleted = () => {
    const total = taskList.children.length;
    const completed = taskList.querySelectorAll('li.completed').length;
    if (total > 0 && completed === total) launchConfetti();
  };

  // build one task row (used for new tasks and for ones loaded from storage)
  const createTask = (text, completed = false) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';

    const span = document.createElement('span');
    span.textContent = text;

    const buttons = document.createElement('div');
    buttons.className = 'task-buttons';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

    buttons.append(editBtn, deleteBtn);
    li.append(checkbox, span, buttons);

    // restore the checked state of a saved task
    if (completed) {
      checkbox.checked = true;
      li.classList.add('completed');
      editBtn.disabled = true;
    }

    taskList.appendChild(li);

    // mark complete
    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
      editBtn.disabled = checkbox.checked;
      refresh();
      if (checkbox.checked) checkAllCompleted();
    });

    // edit
    editBtn.addEventListener('click', () => {
      if (checkbox.checked) return;
      taskInput.value = span.textContent;
      li.remove();
      refresh();
      taskInput.focus();
    });

    // delete
    deleteBtn.addEventListener('click', () => {
      li.remove();
      refresh();
    });
  };

  const addTask = (event) => {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    createTask(taskText);
    taskInput.value = '';
    refresh();
  };

  // load saved tasks when the page opens
  const loadTasks = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('tasks')) || [];
      saved.forEach((task) => createTask(task.text, task.completed));
    } catch (e) {
      console.error('Could not load tasks', e);
    }
  };

  form.addEventListener('submit', addTask);
  loadTasks();
  toggleEmptyState();
  updateStats();
});