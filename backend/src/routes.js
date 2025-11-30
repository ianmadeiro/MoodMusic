const express = require("express");
const router = express.Router();
const auth = require("./middleware/auth");
const authController = require("./controllers/authController");
const musicaController = require("./controllers/musicaController");
const playlistController = require("./controllers/playlistController");

// AUTH
router.post("/register", authController.registrar);
router.post("/login", authController.login);

// MUSICAS
router.get("/musicas", musicaController.listar);
router.post("/musicas", auth, musicaController.criar);

// PLAYLISTS
router.get("/playlists", auth, playlistController.listar);
router.post("/playlists", auth, playlistController.criar);
router.post("/playlists/add", auth, playlistController.adicionarMusica);
router.get("/playlists/:id/musicas", auth, playlistController.listarMusicas);

module.exports = router;
