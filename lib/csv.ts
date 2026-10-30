// Minimal CSV writer. Cells that start with = + - @ are prefixed with ' so spreadsheet apps
// don't run them as formulas when someone opens the file.
function cell(value: unknown) {
  let text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: unknown[][]) {
  // BOM so Excel reads the file as UTF-8
  return "﻿" + [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}

export function csvResponse(filename: string, csv: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\w.-]+/g, "-")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
