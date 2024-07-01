// Importações de módulos e configurações
require("dotenv").config();
const express = require("express");
const conn = require("./db/conn");
const handlebars = require("express-handlebars");
const Usuario = require("./models/Usuario");
const Jogo = require("./models/Jogo");
const Cartao = require("./models/Cartao");
const Conquisti = require("./models/Conquisti")
const { DataTypes } = require("sequelize");

const app = express();


app.engine("handlebars", handlebars.engine())
app.set("view engine", "handlebars")


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get("/", (req, res) => {
  res.render("home");
});



app.post("/usuario/novo", async (req, res) => {
  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome
  };

  const usuario = await Usuario.create(dadosUsuario);
  res.send("Usuário cadastrado com id " + usuario.id + `<a href= "http://localhost:8000/usuarios"> Voltar </a>`);
});

app.get("/usuarios/novo", (req, res) => {
  res.render("formUsuario");
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll({ raw: true });
  res.render("usuarios", { usuarios });
});

app.get("/usuarios/:id/atualizar", async (req, res) => {
  const id = req.params.id;
  const usuario = await Usuario.findByPk(id, { raw: true });
  res.render("formUsuario", { usuario });
});

app.post("/usuarios/:id/atualizar", async (req, res) => {
  const id = req.params.id;

  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome
  };
  const registroAfetados = await Usuario.update(dadosUsuario, { where: { id: id } });
  if (registroAfetados > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao atualizar usuário");
  }
});

app.post("/usuarios/excluir", async (req, res) => {
  const id = req.body.id
  const registroAfetados = await Usuario.destroy({ where: { id: id } });

  if (registroAfetados > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao excluir usuário");
  }
});


app.post("/jogo/novo", async (req, res) => {
  const dadosJogo = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    precoBase: req.body.precoBase
  };

  const jogo = await Jogo.create(dadosJogo);
  res.send("Jogo cadastrado com id " + jogo.id + `<a href= "http://localhost:8000/jogos"> Voltar </a>`);
});

app.get("/jogos/novo", (req, res) => {
  res.render("formJogo");
});

app.get("/jogos", async (req, res) => {
  const jogos = await Jogo.findAll({ raw: true });
  res.render("jogos", { jogos });
});

app.get("/jogos/:id/atualizar", async (req, res) => {
  const id = req.params.id;
  const jogo = await Jogo.findByPk(id, { raw: true });
  res.render("formJogo", { jogo });
});

app.post("/jogos/:id/atualizar", async (req, res) => {
  const id = req.params.id;

  const dadosJogo = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    precoBase: req.body.precoBase
  };
  const registroAfetados = await Jogo.update(dadosJogo, { where: { id: id } });
  if (registroAfetados > 0) {
    res.redirect("/jogos");
  } else {
    res.send("Erro ao atualizar jogo");
  }
});

app.post("/jogos/excluir", async (req, res) => {
  const id = req.body.id
  const registroAfetados = await Jogo.destroy({ where: { id: id } });

  if (registroAfetados > 0) {
    res.redirect("/jogos");
  } else {
    res.send("Erro ao excluir jogo");
  }
});



app.get('/usuarios/:id/cartoes', async (req, res) => {
  const id = parseInt(req.params.id)
  const usuario = await Usuario.findByPk(id, { include: ["Cartaos"] });

  let cartoes = usuario.Cartaos;
  cartoes = cartoes.map((cartao) => cartao.toJSON())


  res.render("Cartoes.handlebars", { usuario: usuario.toJSON(), cartoes });
});

app.get("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formCartao", { usuario });
});


app.post("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);
  
  const dadosCartao = {
    numero: req.body.numero,
    nome: req.body.nome,
    cvv: req.body.codSeguranca,
    UsuarioId: id,
  };

  await Cartao.create(dadosCartao);

  res.redirect(`/usuarios/${id}/cartoes`);
});



app.get('/jogos/:id/Conquistis', async (req, res) => {
  const id = parseInt(req.params.id)
  const jogo = await Jogo.findByPk(id, { include: ["Conquisti"] });

  let Conquistis = jogo.Conquisti;
  Conquistis = Conquistis.map((Conquisti) => Conquisti.toJSON())


  res.render("Conquisti.handlebars", { jogo: jogo.toJSON(), Conquistis });
});


app.get("/jogos/:id/novaConquisti", async (req, res) => {
  const id = parseInt(req.params.id);
  const jogo = await Jogo.findByPk(id, { raw: true });

  res.render("formConquisti", { jogo });
});

app.post("/jogos/:id/novaConquisti", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosConquisti = {
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    JogoId: id,
  };

  await Conquisti.create(dadosConquisti);

  res.redirect(`/jogos/${id}/Conquistis`);
});


app.listen(8000, () => {
  console.log(" O Servidor está rodando na seguinte rota: http://localhost:8000/");
});


conn
  .sync({ force: true })
  .then(() => {
    console.log("Conseguimos nos conectar com o banco de dados, xD http://localhost:8000/");
  })
  .catch((err) => {
    console.error("Não conseguimos nos conectar com o Banco de Dados", err);
  });