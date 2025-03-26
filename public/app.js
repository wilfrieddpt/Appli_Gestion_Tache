const API_URL = 'http://localhost:3000/tasks';

// Récupérer et afficher les tâches avec filtres
async function fetchTasks() {
  const statut = document.getElementById('filtre-statut').value;
  const priorite = document.getElementById('filtre-priorite').value;

  let url = API_URL;
  const params = new URLSearchParams();
  if (statut) params.append('statut', statut);
  if (priorite) params.append('priorite', priorite);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url);
  const tasks = await response.json();
  const taskList = document.getElementById('task-list');

  taskList.innerHTML = tasks.map(task => `
    <div class="task">
      <h3>${task.titre}</h3>
      <p>${task.description}</p>
      <p><strong>Statut :</strong> ${task.statut}</p>
      <p><strong>Priorité :</strong> ${task.priorite}</p>
      <button onclick="updateTask('${task._id}')">Modifier</button>
      <button onclick="deleteTask('${task._id}')">Supprimer</button>
    </div>
  `).join('');
}

// Ajouter une nouvelle tâche
async function addTask(event) {
  event.preventDefault();
  const titre = document.getElementById('titre').value;
  const description = document.getElementById('description').value;
  const priorite = document.getElementById('priorite').value;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titre, description, statut: 'à faire', priorite }),
  });

  document.getElementById('task-form').reset();
  fetchTasks(); // Rafraîchir la liste des tâches
}

// Modifier une tâche (changement de statut)
async function updateTask(id) {
  const nouveauStatut = prompt('Entrez le nouveau statut (à faire, en cours, terminée, annulée) :');
  if (!nouveauStatut) return;

  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut: nouveauStatut }),
  });

  fetchTasks();
}

// Supprimer une tâche
async function deleteTask(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  fetchTasks();
}

// Gestion des filtres
document.getElementById('appliquer-filtres').addEventListener('click', fetchTasks);
document.getElementById('task-form').addEventListener('submit', addTask);

fetchTasks();
