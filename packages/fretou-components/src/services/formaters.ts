const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weight = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });

export function formatCpf(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCnpj(cnpj?: string) {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function datePart(value: string): string {
  return value.slice(0, 10);
}

export function formatDate(isoDate?: string): string {
  if (!isoDate) return "—";
  const [year, month, day] = datePart(isoDate).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const time = value.split("T")[1]?.slice(0, 5);
  return time ? `${formatDate(value)} ${time}` : formatDate(value);
}

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatWeight(value: number): string {
  return `${weight.format(value)} kg`;
}