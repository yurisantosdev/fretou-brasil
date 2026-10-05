"use client";

import { useEffect, useMemo, useState } from "react";

export type TableColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
};

export function Table<T>({
  columns,
  rows,
  getRowId,
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
}: TableProps<T>) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage((atual) => Math.min(atual, totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const inicio = (page - 1) * pageSize;
    return rows.slice(inicio, inicio + pageSize);
  }, [rows, page, pageSize]);

  const inicio = rows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, rows.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(13,32,86,0.06)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-canvas">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-5 py-3 text-xs font-bold tracking-[0.14em] text-muted uppercase"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-sm text-muted">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={getRowId(row)} className="border-b border-line last:border-b-0">
                  {columns.map((column) => (
                    <td key={column.header} className="px-5 py-4 text-sm text-navy">
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Mostrando {inicio}–{fim} de {rows.length}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-navy">
            Itens por página
            <select
              value={pageSize}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy"
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((atual) => atual - 1)}
            >
              Anterior
            </button>
            <span className="min-w-16 text-center text-sm font-semibold text-navy">
              {page} de {totalPages}
            </span>
            <button
              type="button"
              className="h-10 cursor-pointer rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((atual) => atual + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
