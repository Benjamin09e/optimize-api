const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const compression = require('compression');
const cors = require('cors');
const dotenv = require("dotenv");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/users');

// Middleware
app.use(express.json());
app.use(cors());
// Active la compression Gzip
app.use(compression());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.error("Erreur de connexion à MongoDB :", err));

// Connexion à Redis
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
redisClient.connect()
    .then(() => console.log("Redis connecté"))
    .catch(err => console.error(err));

// Routes
app.use('/api-optimization/users', userRoutes);

// Gestion des erreurs 404 (Route non trouvée)
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
