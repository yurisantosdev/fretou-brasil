import { PapelTitulo, type TripDetail as TripDetailData } from "../../types/trips";

export type TripDetailProps = {
  trip: TripDetailData;
  onIssueCte: (numero: string, emitidoEm: string) => Promise<void>;
  onAttachPhoto: (nome: string, enviadaEm: string, conteudo: string) => Promise<void>;
  onRegisterUnload: (dataHora: string) => Promise<void>;
  onRegisterOriginalDocuments: (dataHora: string) => Promise<void>;
  onSettle: (papel: PapelTitulo, dataHora: string) => Promise<void>;
  onRegisterAdvance: (dataHora: string) => Promise<void>;
  onScheduleBalance: (dataHora: string) => Promise<void>;
  onCancelTrip: () => Promise<void>;
};

export type Photo = {
  name?: string;
  content?: string;
  received: string;
};

export type PhotoLoadProps = {
  photo?: Photo;
  anexadaEm: (value: string) => string;
  onEnviar: (file: File) => Promise<void>;
};

export type FieldProps = {
  label: string;
  value: string;
};
