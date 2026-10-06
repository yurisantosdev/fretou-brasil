
# 🚚 Fretou Brasil

Monorepo responsável pela operação de **viagens, fretes e financeiro** do desafio.

O projeto é dividido entre **web** e **api**, utilizando uma arquitetura monorepo para centralizar o desenvolvimento e facilitar a manutenção da aplicação.

## 📋 Visão geral

O sistema contempla o gerenciamento da operação de transporte, incluindo:

-   🚛 Viagens
    
-   💰 Fretes de clientes e motoristas
    
-   💵 Adiantamentos
    
-   🧾 CT-e
    
-   📄 Títulos financeiros
    
-   📊 Margem e resultados da viagem
    
-   🔒 Bloqueio de saldo
    
-   ✅ Finalização de viagens
    
-   👤 Cadastro de clientes
    
-   🔐 Autenticação e autorização
    
-   🗄️ Persistência de dados em MongoDB
    

### Estrutura do projeto

```text
fretou-brasil/
├── apps/
│   ├── web/        # Frontend
│   └── api/        # API / Backend
├── package.json
└── ...

```

## 🛠️ Tecnologias

-   **Node.js** 24+
    
-   **npm** 11+
    
-   **MongoDB**
    
-   **Mongoose**
    
-   **JWT**
    
-   **Monorepo**
    

## 📦 Requisitos

Antes de iniciar o projeto, certifique-se de possuir:

-   [Node.js](https://nodejs.org/) 24 ou superior
    
-   npm 11 ou superior
    
-   MongoDB local em execução
    
-   Git
    

## 🚀 Instalação

Clone o repositório:

```bash
git clone git@github.com:yurisantosdev/fretou-brasil.git

```

Entre no diretório:

```bash
cd fretou-brasil

```

Instale as dependências:

```bash
npm install

```

Crie o arquivo de ambiente da API:

```bash
cp apps/api/.env.example apps/api/.env

```

## ⚙️ Configuração da API

Edite o arquivo:

```text
apps/api/.env

```

As principais variáveis necessárias são:

```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/fretouBrasil
JWT_SECRET=seu-secret

```

### Variáveis de ambiente

Variável

Descrição

`PORT`

Porta utilizada pela API

`MONGODB_URI`

String de conexão com o MongoDB

`JWT_SECRET`

Chave utilizada para assinatura dos tokens JWT

> **Importante:** nunca versionar o arquivo `.env`. Utilize o `.env.example` como referência.

## 🗄️ MongoDB

O projeto utiliza MongoDB para persistência dos dados.

A configuração padrão aponta para:

```text
mongodb://127.0.0.1:27017/fretouBrasil

```

Certifique-se de que o MongoDB esteja em execução antes de iniciar a API.

O projeto **não utiliza migrations ou seeds**. As coleções são criadas automaticamente pelo Mongoose conforme os recursos da aplicação são utilizados.

## ▶️ Executando o projeto

Com as dependências instaladas, o ambiente configurado e o MongoDB em execução, execute:

```bash
npm run dev

```

Esse comando inicia os serviços do monorepo em modo de desenvolvimento.

### 🌐 Endereços

Serviço

URL

Frontend

[http://localhost:3000](http://localhost:3000/)

API

[http://localhost:3001](http://localhost:3001/)

Health Check

[http://localhost:3001/health](http://localhost:3001/health)

Após iniciar o projeto, acesse:

```text
http://localhost:3000

```

Para verificar se a API está funcionando:

```text
http://localhost:3001/health

```

## 💰 Regra de vencimento dos títulos

O prazo de vencimento do **título do cliente** é definido pelo campo **Período** no cadastro do cliente.

O período é informado em dias.

### Exemplo

Se o cliente possui:

```text
Período: 30 dias

```

E o CT-e foi emitido em:

```text
06/10/2026

```

O vencimento do título será:

```text
05/11/2026

```

A regra aplicada é:

```text
Data de vencimento = Data de emissão do CT-e + Período do cliente

```

## 🧪 Testes

Para executar a suíte de testes:

```bash
npm test

```

Os testes contemplam regras importantes da operação, incluindo:

-   Cálculo do adiantamento
    
-   Cálculo do saldo
    
-   Cálculo da margem
    
-   Bloqueio do saldo
    
-   Finalização da viagem
    
-   Índice único dos títulos
    

## 🔒 Regras importantes

Algumas regras de negócio possuem impacto direto no fluxo financeiro e operacional da viagem.

Entre elas:

-   O adiantamento é calculado com base no percentual configurado.
    
-   O saldo da viagem possui regras de bloqueio.
    
-   A finalização da viagem depende do cumprimento das condições necessárias.
    
-   Os títulos devem possuir identificação única.
    
-   O vencimento dos títulos de cliente é calculado a partir da emissão do CT-e e do período cadastrado para o cliente.
    

## 🧑‍💻 Desenvolvimento

Para trabalhar no projeto localmente:

```bash
git clone git@github.com:yurisantosdev/fretou-brasil.git
cd fretou-brasil
npm install
cp apps/api/.env.example apps/api/.env
npm run dev

```

Depois, acesse:

```text
http://localhost:3000

```
