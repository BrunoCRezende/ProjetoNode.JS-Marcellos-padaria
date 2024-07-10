const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const helpers = require("handlebars-helpers")();
const bodyParser = require("body-parser");
const multer = require('multer');
var PORT = 8081;

const {initializeApp, applicationDefault, cert,} = require("firebase-admin/app");

const {getFirestore, Timestamp, FieldValue,} = require("firebase-admin/firestore");

const {getStorage, ref, uploadBytes, getDownloadURL } = require('firebase-admin/storage');

const serviceAccount = require("./projeto-web-nodejs.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "SEU STORAGEBUCKET" // Adicione o storageBucket correto aqui
});

const db = getFirestore();
const bucket = getStorage().bucket();

app.engine("handlebars", handlebars({ defaultLayout: "main", helpers: helpers }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('/public'));
app.use("/public", express.static('images'))

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.get("/", function (req, res) {
  res.render("primeira_pagina");
});

// Rota CONSULTA
app.get("/consulta", async function (req, res) {
  try {
    const dataSnapshot = await db.collection('Cardapio').get();
    const data = [];
    dataSnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        nome: doc.data().nome,
        valor: doc.data().valor,
        ingrediente: doc.data().ingrediente,
        descricao: doc.data().descricao,
        observacao: doc.data().observacao,
        imagem: doc.data().imagem 
      });
    });
    res.render("consulta", { data });
  } catch (error) {
    res.status(500).send('Erro ao recuperar dados do Firebase');
  }
});

app.get("/excluir/:id", function (req, res) {
  db.collection('Cardapio').doc(req.params.id).delete().then(function () {
      console.log('Deletado com sucesso');
      res.redirect('/consulta');
  });
});

// Rota CADASTRO
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

    await db.collection('Cardapio').add({
      nome: req.body.nome,
      valor: req.body.valor,
      ingrediente: req.body.ingrediente,
      descricao: req.body.descricao,
      imagem: imageUrl
    });
    console.log('Adicionado com sucesso');
    res.redirect('/consulta');
  } catch (error) {
    console.error('Erro ao adicionar item', error);
    res.status(500).send('Erro ao adicionar item');
  }
});

// Rota EDIÇÃO
app.get("/editar/:id", async function (req, res) {
  const dataSnapshot = await db.collection('Cardapio').doc(req.params.id).get();
  const data = {
    id: dataSnapshot.id,
    nome: dataSnapshot.get('nome'),
    valor: dataSnapshot.get('valor'),
    ingrediente: dataSnapshot.get('ingrediente'),
    descricao: dataSnapshot.get('descricao'),
    imagem: dataSnapshot.get('imagem')
  };
  res.render("editar", { data });
});


// Rota ATUALIZAR
app.post('/atualizar', upload.single('imagem'), async function (req, res) {
  try {
    const docRef = db.collection('Cardapio').doc(req.body.id);
    const updateData = {
      nome: req.body.nome,
      valor: req.body.valor,
      ingrediente: req.body.ingrediente,
      descricao: req.body.descricao,
    };

    if (req.file) {
      const file = req.file;
      const fileRef = bucket.file(`images/${file.originalname}`);
      await fileRef.save(file.buffer, {
        contentType: file.mimetype,
      });
      const imageUrl = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2500' }).then(([url]) => url);
      updateData.imagem = imageUrl;
    }

    await docRef.update(updateData);
    console.log('Atualizado com sucesso');
    res.redirect('/consulta');
  } catch (error) {
    console.error('Erro ao atualizar item', error);
    res.status(500).send('Erro ao atualizar item');
  }
});

app.listen(PORT, function () {
  console.log("Servidor ativo na porta: " + PORT);
});

