const API_URL = 'http://localhost:3000/tasks';

// Récupére et affiche les tâches avec filtres
async function fetchTasks() {
  const statut = document.getElementById('filtre-statut').value;
  const priorite = document.getElementById('filtre-priorite').value;

  let url = API_URL;
  const params = new URLSearchParams();
  if (statut) params.append('statut', statut);
  if (priorite) params.append('priorite', priorite);
  if (params.toString()) url += `?${params.toString()}`;

  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '<p>Chargement des tâches...</p>'; // On indique le chargement

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur lors de la récupération des tâches.');

    // affichage des taches 
    const tasks = await response.json();
    taskList.innerHTML = tasks.map(task => `
      <div class="task">
        <h3>${task.titre}</h3>
        <p>${task.description}</p>
        <p><strong>Statut :</strong> ${task.statut}</p>
        <p><strong>Priorité :</strong> ${task.priorite}</p>
        <p><strong>Catégorie :</strong> ${task.categorie}</p>
        <p><strong>Date de création :</strong> ${new Date(task.dateCreation).toLocaleDateString()}</p>
        <p><strong>Auteur :</strong> ${task.auteur ? `${task.auteur.nom} ${task.auteur.prenom} (${task.auteur.email})` : 'Non spécifié'}</p>
        <p><strong>Commentaires :</strong></p>
        <ul>
          ${task.commentaires.map(commentaire => `
            <li>
              <p><strong>Auteur :</strong> ${commentaire.auteur ? `${commentaire.auteur.nom} ${commentaire.auteur.prenom}` : 'Anonyme'}</p>
              <p><strong>Date :</strong> ${new Date(commentaire.date).toLocaleDateString()}</p>
              <p>${commentaire.contenu}</p>
            </li>
          `).join('')}
        </ul>
        <button onclick="editTask('${task._id}')">Modifier</button>
        <button onclick="deleteTask('${task._id}')">Supprimer</button>
      </div>
    `).join('');
  } catch (error) {
    console.error(error);
    taskList.innerHTML = '<p>Erreur lors du chargement des tâches.</p>';
  }
}

// Ajoute une nouvelle tâche
async function addTask(event) {
  event.preventDefault();
  const titre = document.getElementById('titre').value.trim();
  const description = document.getElementById('description').value.trim();
  const priorite = document.getElementById('priorite').value;
  const auteur = {
    nom: document.getElementById('auteur-nom').value.trim(),
    prenom: document.getElementById('auteur-prenom').value.trim(),
    email: document.getElementById('auteur-email').value.trim(),
  };

  if (!titre || !priorite) {
    alert('Le titre et la priorité sont obligatoires.');
    return;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre, description, statut: 'à faire', priorite, auteur }),
    });

    document.getElementById('task-form').reset();
    fetchTasks(); // Rafraîchi la liste des tâches
  } catch (error) {
    console.error(error);
    alert('Erreur lors de l\'ajout de la tâche.');
  }
}

let currentTaskId = null;

// Affiche le formulaire de modification avec les données existantes
async function editTask(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération de la tâche.');

    const task = await response.json();
    currentTaskId = id; // Stocke l'ID de la tâche
    document.getElementById('edit-titre').value = task.titre;
    document.getElementById('edit-description').value = task.description;
    document.getElementById('edit-priorite').value = task.priorite;
    document.getElementById('filtre-statut').value = task.statut;
    document.getElementById('edit-commentaire').value = ''; // Champ vide pour un nouveau commentaire
    
    document.getElementById('edit-task-form-container').style.display = 'block';
  } catch (error) {
    console.error(error);
    alert('Erreur lors de la récupération des données de la tâche.');
  }
}

// Envoie les modifications au backend
async function saveTask(event) {
  event.preventDefault();

  const titre = document.getElementById('edit-titre').value.trim();
  const description = document.getElementById('edit-description').value.trim();
  const priorite = document.getElementById('edit-priorite').value;
  const commentaire = document.getElementById('edit-commentaire').value.trim();
  const statut = document.getElementById('filtre-statut').value;

  if (!titre || !priorite) {
    alert('Le titre et la priorité sont obligatoires.');
    return;
  }

  try {
    await fetch(`${API_URL}/${currentTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre, description, priorite, commentaire }),
    });

    // Réinitialise le formulaire et masque
    document.getElementById('edit-task-form').reset();
    document.getElementById('edit-task-form-container').style.display = 'none';

    fetchTasks(); // Rafraîchi la liste des tâches
  } catch (error) {
    console.error(error);
    alert('Erreur lors de la modification de la tâche.');
  }
}

// Annule la modification
function cancelEdit() {
  document.getElementById('edit-task-form').reset();
  document.getElementById('edit-task-form-container').style.display = 'none';
}

// Supprime une tâche
async function deleteTask(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks(); // Rafraîchi la liste des tâches
  } catch (error) {
    console.error(error);
    alert('Erreur lors de la suppression de la tâche.');
  }
}

// Gestion des filtres
document.getElementById('appliquer-filtres').addEventListener('click', fetchTasks);
document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('edit-task-form').addEventListener('submit', saveTask);

// Charge les tâches au démarrage
fetchTasks();