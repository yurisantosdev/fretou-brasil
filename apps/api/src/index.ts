import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import cors from "cors";
import express from "express";
import { connectDatabase, isDatabaseConnected } from "./config/database";
import { requireAuth } from "./middleware/auth";

//Routes
import authRoutes from "./routes/authRoutes";
import { tripsRouter } from "@fretou/trips/server/router";
import { usersRouter } from "@fretou/users/server/router";
import { clientsRouter } from "@fretou/clients/server/router";
import { vehiclesRouter } from "@fretou/vehicles/server/router";

setDefaultResultOrder("ipv4first");

function lerVersaoDoPacote(): string {
  try {
    const caminho = join(process.cwd(), "package.json");
    const pkg = JSON.parse(readFileSync(caminho, "utf8")) as {
      version?: string;
    };
    const v = pkg.version?.trim();
    return v && /^(\d{4})\.\d+$/.test(v) ? v : "unknown";
  } catch {
    return "unknown";
  }
}

const APP_VERSION = lerVersaoDoPacote();

process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[fatal] unhandledRejection:", reason);
});

function portaHttp(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return 3001;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) {
    console.error(
      `PORT inválido: "${raw}" — usando 3001 (remova PORT manual na Railway se não souber o valor certo)`
    );
    return 3001;
  }
  return n;
}

const PORT = portaHttp();

function hostDaMongoUri(uri: string): string {
  const m = uri.match(/@[^/]+/);
  return m ? m[0].slice(1) : "(host não identificado)";
}

const jwtSecretOk = Boolean(process.env.JWT_SECRET?.trim());
if (!jwtSecretOk) {
  console.error(
    "AVISO: JWT_SECRET ausente — /health responde, mas login e APIs com token falharão até configurar."
  );
}

function lerMongoUri(): string | undefined {
  const raw = process.env.MONGODB_URI?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']+|["']+$/g, "").trim();
}

function mensagemErroMongo(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

let ultimoErroMongo: string | undefined;

async function garantirMongo(): Promise<boolean> {
  const mongodbUri = lerMongoUri();
  if (!mongodbUri) {
    ultimoErroMongo = "MONGODB_URI ausente";
    return false;
  }
  if (isDatabaseConnected()) {
    ultimoErroMongo = undefined;
    return true;
  }
  try {
    await connectDatabase(mongodbUri);
    ultimoErroMongo = undefined;
    return true;
  } catch (err) {
    ultimoErroMongo = mensagemErroMongo(err);
    console.error(
      "MongoDB indisponível"
    );
    console.error(err);
    return false;
  }
}

const app = express();
app.set("trust proxy", 1);

function normalizarOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  ...("")
    .split(",")
    .map(normalizarOrigin)
    .filter(Boolean),
].map(normalizarOrigin);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(normalizarOrigin(origin))) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "15mb" }));

function payloadSaude(db: boolean) {
  const mongodbUri = lerMongoUri();
  return {
    ok: true,
    versao: APP_VERSION,
    db,
    jwt: jwtSecretOk,
    ...(mongodbUri ? {} : { aviso: "MONGODB_URI não configurada" }),
    ...(!jwtSecretOk ? { avisoJwt: "JWT_SECRET não configurada" } : {}),
    ...(ultimoErroMongo ? { dbErro: ultimoErroMongo } : {}),
    ...(mongodbUri && !mongodbUri.startsWith("mongodb")
      ? { avisoUri: "MONGODB_URI não começa com mongodb:// ou mongodb+srv://" }
      : {}),
  };
}

app.get("/health", async (_req, res) => {
  const db = await garantirMongo();
  res.json(payloadSaude(db));
});

app.get("/", async (_req, res) => {
  const db = await garantirMongo();
  res.json(payloadSaude(db));
});

app.use(async (req, res, next) => {
  const p = req.path || "";
  if (p === "/health" || p === "/" || p.startsWith("/health")) return next();
  const db = await garantirMongo();
  if (!db) {
    return res.status(503).json({
      erro:
        "Banco de dados indisponível. Confira MONGODB_URI e Network Access no Atlas.",
      ...(ultimoErroMongo ? { detalhe: ultimoErroMongo } : {}),
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", requireAuth, usersRouter);
app.use("/api/trips", requireAuth, tripsRouter);
app.use("/api/clients", requireAuth, clientsRouter);
app.use("/api/vehicles", requireAuth, vehiclesRouter);

export default app;

async function iniciarServidorLocal(): Promise<void> {
  const host = process.env.HOST ?? "0.0.0.0";

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, host, () => {
      console.log(
        `Fretou Brasil API ${APP_VERSION} | HTTP em ${host}:${PORT} | GET /health`
      );
      resolve();
    });
    server.on("error", reject);
  });

  const mongodbUri = lerMongoUri();
  if (!mongodbUri) {
    console.error(
      "AVISO: MONGODB_URI ausente — rotas /api/* ficam em 503 até configurar."
    );
    return;
  }

  console.log(`Conectando ao MongoDB em ${hostDaMongoUri(mongodbUri)} …`);
  const ok = await garantirMongo();
  if (ok) {
    console.log("MongoDB conectado.");
  } else {
    console.error(
      "MongoDB não conectou no startup; novas tentativas ocorrerão a cada request."
    );
  }
}

iniciarServidorLocal().catch((err) => {
  console.error(err);
  process.exit(1);
});
