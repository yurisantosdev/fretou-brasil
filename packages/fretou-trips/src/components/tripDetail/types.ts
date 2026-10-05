import { NaturesTitles, type TripDetail as TripDetailData } from "../../types/trips";

export type TripDetailProps = {
  trip: TripDetailData;
  onIssueCte: (numero: string, emitidoEm: string) => Promise<void>;
  onAttachPhoto: (nome: string, enviadaEm: string, conteudo: string) => Promise<void>;
  onRegisterUnload: (dataHora: string) => Promise<void>;
  onRegisterOriginalDocuments: (dataHora: string) => Promise<void>;
  onSettle: (natureza: NaturesTitles, dataHora: string) => Promise<void>;
};

export type FieldProps = {
  label: string;
  value: string;
};
