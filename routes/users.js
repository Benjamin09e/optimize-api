const express = require('express');
const User = require('../models/User');
const redis = require('redis');

const router = express.Router();
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
redisClient.connect();

// Récupérer tous les utilisateurs avec mise en cache
router.get('/', async (req, res) => {
    try {
        const cacheKey = "users";

        // Vérifier si les données sont en cache
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Données récupérées depuis le cache");
            return res.json(JSON.parse(cachedData));
        }

        // Sinon, récupérer depuis MongoDB
        const users = await User.find().lean();
        
        // Stocker les données en cache pour 1 heure
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(users));

        console.log("Données récupérées depuis MongoDB");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

// Ajouter un utilisateur
router.post('/', async (req, res) => {
    try {
        const { name, email, age } = req.body;
        const newUser = new User({ name, email, age });
        await newUser.save();

        // Supprimer le cache pour forcer la mise à jour des données
        await redisClient.del("users");

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur");
    }
});

module.exports = router;

