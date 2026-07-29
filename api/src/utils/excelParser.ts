import * as XLSX from "xlsx";

export function parseExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  return rows;
}
