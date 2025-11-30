const db = require("../db");
module.exports = {
  async listar(req, res) {
    try {
      const data = await db("musicas");
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao listar músicas' });
    }
  },

  async criar(req, res) {
    try {
      const { nome, artista, link, popularidade } = req.body;
      if(!nome || !artista || !link) return res.status(400).json({ erro: 'Dados incompletos' });
      const capa = `https://ui-avatars.com/api/?name=${encodeURIComponent(artista)}&background=1db954&color=fff`;
      const [id] = await db("musicas").insert({
        nome,
        artista,
        link,
        capa,
        popularidade: popularidade || 'baixa'
      });
      res.json({ id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao criar música' });
    }
  }
};
