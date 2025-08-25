// Server.js

import 'dotenv/config'; 
import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ⚡ VARIABLE GLOBALE DE CONTRÔLE DU PING
let pingIntervalId = null;
const PING_INTERVAL_MS = 60000; // 60 secondes

// 🔹 Config MySQL Aiven
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

// ⚡ Fonction de Ping
const startPing = () => {
    if (pingIntervalId !== null) return "Le ping est déjà actif.";

    const pingFn = async () => {
        try {
            await pool.execute("SELECT 1");
            console.log("Ping MySQL - serveur actif");
        } catch (err) {
            console.error("Ping MySQL échoué :", err);
        }
    };
    
    // Lance le premier ping immédiatement, puis utilise l'intervalle
    pingFn(); 
    pingIntervalId = setInterval(pingFn, PING_INTERVAL_MS);
    return `Ping démarré (${PING_INTERVAL_MS / 1000}s).`;
};

const stopPing = () => {
    if (pingIntervalId === null) return "Le ping est déjà inactif.";
    
    clearInterval(pingIntervalId);
    pingIntervalId = null;
    return "Ping arrêté.";
};

// ... (le reste du code, y compris la création des tables et getTableName) ...

// 🔹 Configuration du service de fichiers statiques (HTML, CSS, JS)
app.use(express.static('public')); // Permet de servir le contenu du dossier 'public'

// 🔹 Route GET racine pour tester le serveur
app.get("/", (req, res) => {
  res.send("🚀 Mangrat Server est actif et fonctionne !");
});

// 🔹 Route POST /ask
// ... (votre code /ask inchangé) ...
app.post("/ask", async (req, res) => {
  const { question, category = 'general' } = req.body;
  if (!question) return res.status(400).json({ reply: "❌ Donne-moi une question !" });

  try {
    const tableName = getTableName(category);
    
    // Look for the answer in the specific or general table
    const [rows] = await pool.execute(
      `SELECT answer, content FROM ${tableName} 
       WHERE question = ? OR title = ? OR key_name = ? 
       LIMIT 1`,
      [question, question, question]
    );

    const foundAnswer = rows.length > 0 
        ? rows[0].answer || rows[0].content 
        : null;

    if (foundAnswer) {
      return res.json({ reply: foundAnswer });
    }

    // If not found, queue the question for learning
    const fallback = "Je ne connais pas encore cette réponse, enseigne-moi !";
    await pool.execute(
      "INSERT INTO learn_queue (question) VALUES (?)",
      [question]
    );
    res.json({ reply: fallback });

  } catch (err) {
    console.error("❌ Erreur serveur /ask :", err);
    res.status(500).json({ reply: "⚠️ Erreur serveur lors de la requête." });
  }
});

// 🔹 Route POST /teach
// ... (votre code /teach inchangé) ...
app.post("/teach", async (req, res) => {
  const { question, answer, category = 'general' } = req.body;
  if (!question || !answer) return res.status(400).json({ reply: "❌ Question et réponse requises !" });

  try {
    const tableName = getTableName(category);
    
    // Logique pour déterminer les colonnes en fonction de la table
    let insertQuery;
    
    if (tableName === 'knowledge') {
        insertQuery = 'INSERT INTO knowledge (question, answer) VALUES (?, ?) ON DUPLICATE KEY UPDATE answer = ?';
        await pool.execute(insertQuery, [question, answer, answer]);
    } else {
        // Pour les tables thématiques, on utilise key_name et content
        insertQuery = `
            INSERT INTO ${tableName} (key_name, content) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE content = ?, updated_at = NOW()
        `;
        await pool.execute(insertQuery, [question, answer, answer]);
    }
    
    // Mettre à jour le statut dans la file d'attente
    await pool.execute(
        "UPDATE learn_queue SET status='learned', correct_answer = ? WHERE question = ? AND status='pending'", 
        [answer, question]
    );
    
    res.json({ reply: "✅ Mangrat a appris cette réponse !" });

  } catch (err) {
    console.error("❌ Erreur serveur /teach :", err);
    res.status(500).json({ reply: "❌ Erreur serveur lors de l'enseignement." });
  }
});

// --- 🔹 Routes d'Administration (API) ---

// 🔹 Route GET /admin/ping-status : Récupère l'état actuel du ping
app.get("/admin/ping-status", (req, res) => {
    res.json({ 
        status: pingIntervalId !== null ? "actif" : "inactif",
        message: pingIntervalId !== null ? "Le service de maintien est actif." : "Le service de maintien est inactif."
    });
});

// 🔹 Route POST /admin/start-ping : Démarre le ping MySQL
app.post("/admin/start-ping", (req, res) => {
    const message = startPing();
    res.json({ status: "ok", message });
});

// 🔹 Route POST /admin/stop-ping : Arrête le ping MySQL
app.post("/admin/stop-ping", (req, res) => {
    const message = stopPing();
    res.json({ status: "ok", message });
});

// 🔹 Route GET /admin/queue : Récupère la file d'attente d'apprentissage
app.get("/admin/queue", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, question, created_at FROM learn_queue WHERE status = 'pending' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur récupération file d'attente :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// 🔹 Route DELETE /admin/queue/:id : Supprime une question de la file d'attente
app.delete("/admin/queue/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute(
      "DELETE FROM learn_queue WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ reply: "❌ Question non trouvée." });
    }
    res.json({ reply: `✅ Question #${id} supprimée de la file d'attente.` });
  } catch (err) {
    console.error("❌ Erreur suppression file d'attente :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});


// 🔹 Lancer serveur
app.listen(PORT, () => {
  console.log(`🚀 Mangrat Server running on http://localhost:${PORT}`);
  // ⭐ Optionnel : Démarrer le ping au lancement du serveur par défaut.
  // startPing(); 
});
