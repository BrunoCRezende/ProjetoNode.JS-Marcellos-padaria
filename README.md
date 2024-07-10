# Sistema de Gerenciamento de Produtos com Firebase, Express e Handlebars

Este projeto é um sistema básico de gerenciamento de produtos utilizando Firebase para armazenamento de dados, Express.js como framework web, e Handlebars como engine de template para renderização das páginas.

## Requisitos

Antes de executar este projeto, você precisa ter o seguinte instalado:

- **Node.js:** Certifique-se de ter o Node.js instalado na sua máquina. Você pode baixá-lo [aqui](https://nodejs.org/).

## Instalação

Siga os passos abaixo para configurar e executar o projeto localmente:

1. **Clone o repositório:**

   ```bash
   cd seu-projeto
   git clone https://github.com/BrunoCRezende/ProjetoNode.JS-Marcellos-padaria
   ```

2. **Instale as dependências:**

   Use o npm para instalar as dependências necessárias:

   ```bash
   npm install express express-handlebars body-parser multer firebase-admin 
   ```

   Certifique-se de incluir todas as dependências listadas no arquivo `package.json` do projeto.

3. **Configuração do Firebase**

   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - No painel do projeto, vá para **Project Settings > Service accounts**.
   - Clique em **Generate new private key** para baixar o arquivo JSON de configuração do serviço. Renomeie este arquivo para `projeto-web-nodejs.json` e coloque-o na raiz do seu projeto.

   - Esse projeto utiliza as funções `Firestore Database`e `Storage` do Firebase, então lembre-se de iniciá-las ao configurar seu projeto no Firebase.
  
4. **Executar o Projeto**

   Execute o seguinte comando para iniciar o servidor:

   ```bash
   node app.js
   ```

   O servidor estará acessível em `http://localhost:8081`.
