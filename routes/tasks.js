const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// GET /tasks : Récupérer toutes les tâches avec filtres et tri
router.get('/', async (req, res) => {
  try {
    let query = {};

    // Filtrage par statut, priorité, catégorie, étiquette
    if (req.query.statut) query.statut = req.query.statut;
    if (req.query.priorite) query.priorite = req.query.priorite;
    if (req.query.categorie) query.categorie = req.query.categorie;
    if (req.query.etiquette) query.etiquettes = req.query.etiquette;

    // Filtrage par échéance
    if (req.query.avant) query.echeance = { $lte: new Date(req.query.avant) };
    if (req.query.apres) query.echeance = { ...query.echeance, $gte: new Date(req.query.apres) };

    // Recherche dans le titre et la description
    if (req.query.q) query.$or = [
      { titre: new RegExp(req.query.q, 'i') },
      { description: new RegExp(req.query.q, 'i') }
    ];

    // Tri
    let sort = {};
    if (req.query.tri) sort[req.query.tri] = req.query.ordre === 'desc' ? -1 : 1;

    const tasks = await Task.find(query).sort(sort);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/:id : Récupérer une tâche par ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks : Créer une nouvelle tâche
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /tasks/:id : Modifier une tâche existante et enregistrer l'historique
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });

    // Créer l'historique des modifications
    const modifications = [];
    Object.keys(req.body).forEach(key => {
      if (task[key] !== req.body[key]) {
        modifications.push({
          champModifie: key,
          ancienneValeur: task[key],
          nouvelleValeur: req.body[key],
          date: new Date()
        });
      }
    });

    // Mettre à jour la tâche
    Object.assign(task, req.body);
    task.historiqueModifications.push(...modifications);

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /tasks/:id : Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks/:id/comment : Ajouter un commentaire à une tâche
router.post('/:id/comment', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });

    const nouveauCommentaire = {
      auteur: req.body.auteur,
      contenu: req.body.contenu,
      date: new Date()
    };

    task.commentaires.push(nouveauCommentaire);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
