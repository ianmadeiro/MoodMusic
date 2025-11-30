const db = require("../db");
module.exports = {
  async criar(req, res) {
    try {
      const { nome } = req.body;
      const usuario_id = req.userId;
      if(!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
      const [id] = await db("playlists").insert({ nome, usuario_id });
      res.json({ id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar playlist' });
    }
  },

  async listar(req, res) {
    try {
      const usuario_id = req.userId;
      const data = await db("playlists").where({ usuario_id }).select("id", "nome", "usuario_id");
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar playlists' });
    }
  },

  async adicionarMusica(req, res) {
    try {
      const { playlist_id, musica_id } = req.body;
      if(!playlist_id || !musica_id) return res.status(400).json({ erro: 'Dados incompletos' });
      const playlist = await db("playlists").where({ id: playlist_id }).first();
      if (!playlist) return res.status(404).json({ erro: "Playlist não encontrada" });
      if (playlist.usuario_id !== req.userId) return res.status(403).json({ erro: "Ação não permitida" });
      const existe = await db("playlist_musicas").where({ playlist_id, musica_id }).first();
      if (existe) return res.status(400).json({ erro: "Música já adicionada na playlist" });
      await db("playlist_musicas").insert({ playlist_id, musica_id });
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao adicionar música' });
    }
  },

  async listarMusicas(req, res) {
    try {
      const { id } = req.params;
      const playlist = await db("playlists").where({ id }).first();
      if (!playlist) return res.status(404).json({ erro: "Playlist não encontrada" });
      if (playlist.usuario_id !== req.userId) return res.status(403).json({ erro: "Ação não permitida" });
      const result = await db("playlist_musicas as pm")
        .join("musicas as m", "pm.musica_id", "m.id")
        .where("pm.playlist_id", id)
        .select("m.*");
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar músicas da playlist' });
    }
  }
};
