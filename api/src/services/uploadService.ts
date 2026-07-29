import { prisma } from "../prisma";
import { parseExcel } from "../utils/excelParser";
import { extractColumnMetadata } from "../utils/dataOperations";

export async function uploadDataset(file: Express.Multer.File) {
  const rows = parseExcel(file.buffer);

  if (!rows.length) {
    throw new Error(
      "The uploaded Excel file is empty or contains only headers.",
    );
  }

  const headers = Object.keys(rows[0]);

  // Dataset metadata
  const fileInfo = extractColumnMetadata(rows);

  // Save everything in one transaction
  const dataset = await prisma.$transaction(async (tx) => {
    // Insert dataset
    const createdDataset = await tx.datasets.create({
      data: {
        filename: file.originalname,
        row_count: fileInfo.rowCount,
        column_count: fileInfo.columnCount,
        quality_score: fileInfo.qualityScore,
        trust_score: fileInfo.trustScore,
        value_score: fileInfo.valueScore,
      },
    });

    // Insert all columns
    await tx.column_catalog.createMany({
      data: fileInfo.columnMetrics.map((column) => ({
        dataset_id: createdDataset.id,
        column_name: column.columnName,
        data_type: column.dataType,
        is_sensitive: column.isSensitive,
        sensitive_tag: column.sensitiveTag,
        null_count: column.nullCount,
        duplicate_count: column.duplicateCount,
        invalid_values: column.invalidValues,
        null_percentage: column.nullPercentage,
      })),
    });
    return createdDataset;
  });

  return {
    filename: dataset.filename,
    rowCount: Number(fileInfo.rowCount),
    columnCount: Number(fileInfo.columnCount),
    qualityScore: fileInfo.qualityScore,
    trustScore: fileInfo.trustScore,
    valueScore: fileInfo.valueScore,
    headers,
  };
}