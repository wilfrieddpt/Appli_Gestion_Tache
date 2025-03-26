const API_URL = 'http://localhost:3000/tasks';

async function fetchTasks() {
  const response = await fetch(API_URL);
  const tasks = await response.json();
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = tasks.map(task => `
    <div>
      <h3>${task.titre}</h3>
      <p>${task.description}</p>
      <p>Statut : ${task.statut}</p>
    </div>
  `).join('');
}

fetchTasks();