import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  centavosDeReais,
  margemDoAcordo,
  motivoBloqueioSaldo,
  motivoCancelamento,
  podeEditarViagem,
  partiesFromShipping,
  prazoEmDias,
  resolverEstado,
  somarDias,
  titulosDaProva,
} from "./regrasViagem";

const base = {
  cte: true,
  foto: true,
  descarga: false,
  comprovantes: false,
  carregamentoNoFuturo: false,
  adiantamentoQuitado: false,
  saldoQuitado: false,
};

describe("cálculo do frete", () => {
  it("separa 70% de 3333,33 em adiantamento e saldo sem perder centavo", () => {
    const partes = partiesFromShipping(3333.33, "70%");
    assert.equal(partes.percentual, 70);
    assert.equal(centavosDeReais(partes.adiantamento), 233333);
    assert.equal(centavosDeReais(partes.restante), 100000);
    assert.equal(centavosDeReais(partes.adiantamento) + centavosDeReais(partes.restante), 333333);
  });

  it("calcula a margem 5000 - 3333,33 em centavos", () => {
    const margem = margemDoAcordo({ freteCliente: 5000, freteMotorista: 3333.33 });
    assert.equal(centavosDeReais(margem.margemReais), 166667);
    assert.equal(margem.negativa, false);
  });

  it("sinaliza margem negativa", () => {
    const margem = margemDoAcordo({ freteCliente: 3000, freteMotorista: 3500 });
    assert.equal(centavosDeReais(margem.margemReais), -50000);
    assert.equal(margem.negativa, true);
  });
});

describe("títulos da prova", () => {
  it("gera cliente, adiantamento e saldo com vencimento a partir do prazo do cliente", () => {
    const titulos = titulosDaProva({
      freteCliente: 5000,
      freteMotorista: 3333.33,
      divideShipping: "70%",
      prazoClienteDias: 30,
      prazoMotoristaDias: 0,
      emitted: "2026-10-01",
      received: "2026-10-02",
    });

    assert.deepEqual(
      titulos.map((item) => ({ papel: item.papel, value: centavosDeReais(item.value), expirationDate: item.expirationDate })),
      [
        { papel: "cliente", value: 500000, expirationDate: somarDias("2026-10-01", 30) },
        { papel: "adiantamento", value: 233333, expirationDate: "2026-10-02" },
        { papel: "saldo", value: 100000, expirationDate: "2026-10-02" },
      ],
    );
    assert.equal(centavosDeReais(titulos[1].value) + centavosDeReais(titulos[2].value), 333333);
  });

  it("lê o prazo cadastrado no cliente", () => {
    assert.equal(prazoEmDias("30 dias"), 30);
    assert.equal(prazoEmDias("à vista"), null);
  });
});

describe("cancelamento", () => {
  it("permite editar enquanto a viagem não foi concluída nem cancelada", () => {
    assert.equal(podeEditarViagem("AGUARDANDO_CTE"), true);
    assert.equal(podeEditarViagem("EM_TRANSITO"), true);
    assert.equal(podeEditarViagem("FINALIZADA"), false);
    assert.equal(podeEditarViagem("CANCELADA"), false);
  });

  it("permite cancelar a viagem que ainda não começou", () => {
    assert.equal(motivoCancelamento({ cte: false, foto: false, titulos: false }), null);
  });

  it("recusa cancelar depois do CT-e ou da foto", () => {
    assert.match(motivoCancelamento({ cte: true, foto: false, titulos: false }) ?? "", /já começou/);
    assert.match(motivoCancelamento({ cte: false, foto: true, titulos: false }) ?? "", /já começou/);
  });
});

describe("bloqueio do saldo", () => {
  it("recusa programar e baixar antes da descarga", () => {
    assert.match(
      motivoBloqueioSaldo({ descarga: false, comprovantes: false }, "programar") ?? "",
      /antes do registro da descarga/,
    );
    assert.match(
      motivoBloqueioSaldo({ descarga: false, comprovantes: true }, "baixar") ?? "",
      /antes do registro da descarga/,
    );
  });

  it("mantém o saldo bloqueado depois da descarga sem comprovantes", () => {
    assert.match(
      motivoBloqueioSaldo({ descarga: true, comprovantes: false }, "programar") ?? "",
      /comprovantes/,
    );
  });

  it("libera o saldo quando descarga e comprovantes existem", () => {
    assert.equal(motivoBloqueioSaldo({ descarga: true, comprovantes: true }, "programar"), null);
    assert.equal(motivoBloqueioSaldo({ descarga: true, comprovantes: true }, "baixar"), null);
  });
});

describe("máquina de estados", () => {
  it("não finaliza enquanto o saldo estiver pendente", () => {
    assert.equal(
      resolverEstado({
        ...base,
        descarga: true,
        comprovantes: true,
        adiantamentoQuitado: true,
        saldoQuitado: false,
      }),
      "AGUARDANDO_PAGAMENTO",
    );
  });

  it("finaliza somente com documentos e as duas baixas do motorista", () => {
    assert.equal(
      resolverEstado({
        ...base,
        descarga: true,
        comprovantes: true,
        adiantamentoQuitado: true,
        saldoQuitado: true,
      }),
      "FINALIZADA",
    );
  });

  it("não avança para trânsito só com o CT-e", () => {
    assert.equal(resolverEstado({ ...base, cte: true, foto: false }), "AGUARDANDO_FOTO");
  });
});

describe("idempotência dos títulos", () => {
  it("repete a mesma previsão para o mesmo CT-e", () => {
    const entrada = {
      freteCliente: 5000,
      freteMotorista: 3333.33,
      divideShipping: "70%" as const,
      prazoClienteDias: 15,
      prazoMotoristaDias: 2,
      emitted: "2026-10-01",
      received: "2026-10-03",
    };
    assert.deepEqual(titulosDaProva(entrada), titulosDaProva(entrada));
  });

  it("impede dois títulos do mesmo papel com índice único", () => {
    const fonte = readFileSync(new URL("../models/Titles.ts", import.meta.url), "utf8");
    assert.match(fonte, /tripId: 1, papel: 1/);
    assert.match(fonte, /unique: true/);
    assert.match(fonte, /partialFilterExpression: \{ papel: \{ \$type: "string" \} \}/);
    assert.doesNotMatch(fonte, /tripId: 1, nature: 1/);
  });
});
