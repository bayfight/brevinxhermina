import * as XLSX from 'xlsx';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
) {
  // Transform data to match column structure
  const exportData = data.map((row) => {
    const transformedRow: Record<string, any> = {};
    columns.forEach((col) => {
      transformedRow[col.header] = row[col.key];
    });
    return transformedRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = columns.map((col) => ({
    wch: col.width || 15,
  }));
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
