# 🚚 Fretou Brasil

Monorepo responsável pela operação de **viagens, fretes e financeiro** do desafio.
O projeto é dividido entre **web** e **api**, utilizando uma arquitetura monorepo para centralizar o desenvolvimento e facilitar a manutenção da aplicação.

  
## 📋 Visão geral
O sistema contempla o gerenciamento da operação de transporte, incluindo:

- 🚛 Viagens
- 💰 Fretes de clientes e motoristas
- 💵 Adiantamentos
- 🧾 CT-e
- 📄 Títulos financeiros
- 📊 Margem e resultados da viagem
- 🔒 Bloqueio de saldo
- ✅ Finalização de viagens
- 👤 Cadastro de clientes
- 🔐 Autenticação e autorização
- 🗄️ Persistência de dados em MongoDB
  

### Estrutura do projeto

```text
fretou-brasil/
├── apps/
│ ├── web/ # Frontend
│ └── api/ # API / Backend
├── package.json
└── ...
```


## 🛠️ Tecnologias

-  **Node.js** 24+
-  **npm** 11+
-  **MongoDB**
-  **Mongoose**
-  **JWT**
-  **Monorepo**
  

## 📦 Requisitos

Antes de iniciar o projeto, certifique-se de possuir:
- [Node.js](https://nodejs.org/) 24 ou superior
- npm 11 ou superior
- MongoDB local em execução
- Git
  

## 🚀 Instalação

Clone o repositório:
```bash
git  clone  git@github.com:yurisantosdev/fretou-brasil.git
```

Entre no diretório:
```bash
cd  fretou-brasil
```

Instale as dependências:
```bash
npm  install
```

Crie o arquivo de ambiente da API:
```bash
cp  apps/api/.env.example  apps/api/.env
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

>  **Importante:** nunca versionar o arquivo `.env`. Utilize o `.env.example` como referência.


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
npm  run  dev
```

Esse comando inicia os serviços do monorepo em modo de desenvolvimento.


### 🌐 Endereços

Após iniciar o projeto, acesse:

```text
http://localhost:3000
```

Para verificar se a API está funcionando:

```text
http://localhost:3001/health
```
  

## 🧩 Módulos

A tela inicial mostra um card para cada módulo que o usuário pode abrir. Quem entra direto no endereço de um módulo sem permissão vê a tela de acesso restrito.
O acesso depende de dois dados do usuário: se é motorista (`driver`) e, nesse caso, se é terceiro (`thirdParty`).
  

### Viagens

Todos os perfis autenticados acessam o módulo. A listagem permite buscar por código, produto ou rota e filtrar por estado, cliente, motorista e período de carregamento.
A viagem reúne cliente, motorista, veículo, origem, destino, produto, peso, data de carregamento e os dois fretes: o valor a receber do cliente e o valor a pagar ao motorista. O adiantamento do motorista pode ser 50% ou 70% do frete. A margem exibida é a diferença entre esses dois valores. Cliente e motorista também podem ser cadastrados a partir do próprio formulário da viagem.

O veículo depende do motorista escolhido:
- Motorista da empresa usa um veículo ativo da frota da empresa.
- Motorista terceiro usa um veículo ativo cadastrado no nome dele. Sem veículo ativo, a viagem não é salva.

A viagem pode ser editada enquanto não estiver finalizada nem cancelada. O painel do módulo resume o que está a pagar hoje, a receber, os saldos travados e a margem acumulada.

O andamento operacional segue esta ordem:
1. A viagem começa aguardando o CT-e.
2. Com o CT-e emitido, aguarda a foto do caminhão carregado. Os títulos saem quando o CT-e e a foto existem.
3. Depois da carga, a viagem segue em trânsito até a descarga.
4. Após a descarga, aguarda os comprovantes originais.
5. O saldo só pode ser programado depois da descarga e dos comprovantes. Enquanto a condição não se cumpre, o saldo permanece travado.
6. O adiantamento e o saldo são baixados.
7. A viagem finaliza quando adiantamento e saldo estão baixados. Também pode ser cancelada antes disso.

O vencimento do título do cliente continua sendo a data de emissão do CT-e somada ao período cadastrado no cliente.
  

### Clientes

Somente o usuário interno acessa o módulo. O cadastro guarda razão social, CNPJ, período de pagamento em dias e se o cliente está ativo. A busca cobre razão social, CNPJ e período, e a lista filtra todos, ativos ou desativados.
Desativar um cliente tira ele do uso nas novas viagens. O período informado aqui é o prazo usado no vencimento do título a receber.


### Veículos

O usuário interno cadastra a frota da empresa: placa, tipo, ano e carga total em kg. A busca cobre esses campos e a lista filtra todos, ativos ou desativados. Veículo desativado não entra na escolha da viagem.
O motorista terceiro abre o módulo e vê somente os veículos do próprio cadastro. O cadastro novo desses veículos é feito no perfil dele ou no formulário de usuário, pelo interno. O motorista da empresa não acessa o módulo.
Na viagem, a placa e o tipo escolhidos ficam vinculados ao registro.


### Usuários

Somente o usuário interno acessa o módulo. O cadastro guarda nome, CPF, senha, se a pessoa é motorista, se é terceiro, chave Pix e se o acesso está ativo. A busca cobre nome, CPF e placa. A lista filtra por tipo (todos, motoristas da empresa ou terceiros) e por status (todos, ativos ou desativados).
Quando o usuário é motorista terceiro, os veículos dele — placa, tipo, ano, carga e status — são incluídos no mesmo cadastro. Desativar o usuário impede o login.
Qualquer perfil autenticado atualiza nome e senha em **Meu perfil**. Motorista também informa a chave Pix. Motorista terceiro inclui, edita e remove os próprios veículos por ali.


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
npm  test
```

Os testes contemplam regras importantes da operação, incluindo:
- Cálculo do adiantamento
- Cálculo do saldo
- Cálculo da margem
- Bloqueio do saldo
- Finalização da viagem
- Índice único dos títulos
  

## 🔒 Regras importantes

Algumas regras de negócio possuem impacto direto no fluxo financeiro e operacional da viagem.

Entre elas:
- O adiantamento é calculado com base no percentual configurado.
- O saldo da viagem possui regras de bloqueio.
- A finalização da viagem depende do cumprimento das condições necessárias.
- Os títulos devem possuir identificação única.
- O vencimento dos títulos de cliente é calculado a partir da emissão do CT-e e do período cadastrado para o cliente.
  

## 🧑‍💻 Desenvolvimento
Para trabalhar no projeto localmente:

```bash
git  clone  git@github.com:yurisantosdev/fretou-brasil.git
cd  fretou-brasil
npm  install
cp  apps/api/.env.example  apps/api/.env
npm  run  dev
```

Depois, acesse:

```text
http://localhost:3000
```

## 🔮 Itens que poderemos realizar no futuro (que faria a mais)
  
- Vincular mais de um cliente por viagem, já que isso costuma ocorrer na operação.
- Com vários clientes na mesma viagem, definir o frete do cliente de um destes modos: o mesmo valor para todos, um valor por quilômetro, um valor por peso, ou os dois critérios juntos, conferindo o resultado por cliente.
- Somar esses valores para obter o frete total a receber.
- Tela de Erro 404
- Botão com para inverter o tema (escuro / claro)
- Estrutura MSC (Model Service Controller)
- Carregar as cidades de alguma API (para termos um padrão na cidades e um controle melhor)
- Algumas animações básicas, carregar os valores, animcão ao carregar a tela (somente para ficar mais agradavel o uso no dia a dia)
- Controle mais preciso das viagens, mostrar somente as viagens que o motorista vai realizar (sem mostrar as viagens do demais) e ter um controle das ações do motorista, o que pode e não pode realizar (Temos uma parte desenvolvida, mas isso seria um plus que podemos desenvolver!)