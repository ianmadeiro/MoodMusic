const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  async registrar(req, res) {
    try {
      const { nome, email, senha } = req.body;
      if(!nome || !email || !senha) return res.status(400).json({ erro: "Dados incompletos" });
      const existe = await db("usuarios").where({ email }).first();
      if (existe) return res.status(400).json({ erro: "Email já cadastrado" });
      const hash = await bcrypt.hash(senha, 10);
      const [id] = await db("usuarios").insert({ nome, email, senha: hash });
      res.json({ id, nome, email });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: "Erro no servidor" });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;
      if(!email || !senha) return res.status(400).json({ erro: "Dados incompletos" });
      const usuario = await db("usuarios").where({ email }).first();
      if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
      const ok = await bcrypt.compare(senha, usuario.senha);
      if (!ok) return res.status(401).json({ erro: "Senha incorreta" });
      const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
      res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: "Erro no servidor" });
    }
  }
};
