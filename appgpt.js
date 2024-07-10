const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const helpers = require("handlebars-helpers")();
const bodyParser = require("body-parser");
const multer = require('multer');
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase-admin/storage');
const serviceAccount = require("./projeto-web-nodejs.json");

var PORT = 8081;

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "gs://projeto-web-nodejs-ca1ec.appspot.com" // Adicione o storageBucket correto aqui
});

const db = getFirestore();
const bucket = getStorage().bucket();

app.engine("handlebars", handlebars({ defaultLayout: "main", helpers: helpers }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

app.get("/consulta", async function (req, res) {
  try {
    const snapshot = await db.collection('agendamentos').get();
    const agendamentos = snapshot.docs.map(doc => doc.data());
    res.render('index', { agendamentos });
  } catch (error) {
    console.error('Erro ao recuperar dados do Firebase', error);
    res.status(500).send('Erro ao recuperar dados do Firebase');
  }
});

app.get("/editar/:id", async function (req, res) {
  try {
    const dataSnapshot = await db.collection('agendamentos').doc(req.params.id).get();
    const data = {
      id: dataSnapshot.id,
      nome: dataSnapshot.get('nome'),
      telefone: dataSnapshot.get('telefone'),
      origem: dataSnapshot.get('origem'),
      data_contato: dataSnapshot.get('data_contato'),
      observacao: dataSnapshot.get('observacao'),
    };
    res.render("editar", { data });
  } catch (error) {
    console.error('Erro ao recuperar dados do Firebase para edição', error);
    res.status(500).send('Erro ao recuperar dados do Firebase para edição');
  }
});

app.get("/excluir/:id", function (req, res) {
  db.collection('agendamentos').doc(req.params.id).delete().then(function () {
    console.log('Deletado com sucesso');
    res.redirect('/consulta');
  }).catch(function (error) {
    console.error('Erro ao deletar agendamento', error);
    res.status(500).send('Erro ao deletar agendamento');
  });
});

// Rota para cadastrar novos agendamentos
app.post('/cadastrar', upload.single('imagem'), async (req, res) => {
  try {
    const file = req.file;
    let imageUrl = '';

    if (file) {
      const fileRef = bucket.file(`images/${file.originalname}`);
      await fileRef.save(file.buffer, {
        contentType: file.mimetype,
      });
      imageUrl = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2500' }).then(([url]) => url);
    }

    await db.collection('agendamentos').add({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao,
      imagem: imageUrl
    });
    console.log('Adicionado com sucesso');
    res.redirect('/');
  } catch (error) {
    console.error('Erro ao adicionar agendamento', error);
    res.status(500).send('Erro ao adicionar agendamento');
  }
});

app.post("/atualizar", async (req, res) => {
  try {
    await db.collection("agendamentos").doc(req.body.id).update({
      nome: req.body.nome,
      telefone: req.body.telefone,
      origem: req.body.origem,
      data_contato: req.body.data_contato,
      observacao: req.body.observacao,
    });
    console.log("Atualizado com sucesso");
    res.redirect("/consulta");
  } catch (error) {
    console.error('Erro ao atualizar agendamento', error);
    res.status(500).send('Erro ao atualizar agendamento');
  }
});

app.listen(PORT, function () {
  console.log("Servidor ativo na porta: " + PORT);
});
