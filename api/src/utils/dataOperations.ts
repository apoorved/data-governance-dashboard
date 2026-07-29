/**
 * Sensitive data patterns for auto-classification
 */
const SENSITIVE_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]{10,}$/,
  credit_card: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  passport: /^[A-Z]{2}\d{7}$/,
  date_of_birth: /^\d{4}-\d{2}-\d{2}$/,
};

/**
 * Sensitive data tags
 */
type SensitiveTag =
  | "email"
  | "phone"
  | "credit_card"
  | "date_of_birth"
  | "unknown";

/**
 * Column metrics interface
 */
export interface ColumnMetrics {
  columnName: string;
  dataType: string;
  isSensitive: boolean;
  sensitiveTag: SensitiveTag;
  nullCount: number;
  duplicateCount: number;
  invalidValues: number;
  nullPercentage: number;
  qualityScore: number;
}

/**
 * Dataset metrics interface
 */
export interface DatasetMetrics {
  rowCount: bigint;
  columnCount: bigint;
  qualityScore: number;
  trustScore: number;
  valueScore: number;
  columnMetrics: ColumnMetrics[];
}

/**
 * Detect sensitive data
 */
function detectSensitiveData(
  sampleValues: string[],
): { isSensitive: boolean; tag: SensitiveTag } {
  const validSamples = sampleValues.filter(
    (v) => typeof v === "string" && v.trim() !== "",
  );

  if (!validSamples.length) {
    return {
      isSensitive: false,
      tag: "unknown",
    };
  }

  for (const [tag, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    const matches = validSamples.filter((v) => pattern.test(v.trim())).length;

    if (matches / validSamples.length >= 0.7) {
      return {
        isSensitive: true,
        tag: tag as SensitiveTag,
      };
    }
  }

  return {
    isSensitive: false,
    tag: "unknown",
  };
}

/**
 * Infer datatype
 */
function inferDataType(sampleValues: string[]): string {
  const validSamples = sampleValues.filter((v) => v.trim() !== "");

  if (!validSamples.length) {
    return "unknown";
  }

  const intCount = validSamples.filter((v) => /^-?\d+$/.test(v)).length;

  const floatCount = validSamples.filter((v) =>
    /^-?\d+(\.\d+)?$/.test(v),
  ).length;

  const dateCount = validSamples.filter((v) =>
    /^\d{4}-\d{2}-\d{2}$/.test(v),
  ).length;

  const boolCount = validSamples.filter((v) =>
    /^(true|false|yes|no|0|1)$/i.test(v),
  ).length;

  const pct = (count: number) => (count / validSamples.length) * 100;

  if (pct(intCount) >= 80) return "integer";
  if (pct(floatCount) >= 80) return "float";
  if (pct(dateCount) >= 80) return "date";
  if (pct(boolCount) >= 80) return "boolean";

  return "string";
}

/**
 * Calculate metrics for one column
 */
function calculateColumnMetrics(
  columnName: string,
  values: unknown[],
  rowCount: number,
): ColumnMetrics {
  const stringValues = values.map((v) =>
    v == null ? "" : String(v),
  );

  const nonNullValues = stringValues.filter((v) => v.trim() !== "");

  const nullCount = rowCount - nonNullValues.length;

  const nullPercentage =
    rowCount === 0 ? 0 : (nullCount / rowCount) * 100;

  const uniqueValues = new Set(nonNullValues);

  const duplicateCount = nonNullValues.length - uniqueValues.size;

  const invalidValues = stringValues.filter(
    (v) => v.trim() === "",
  ).length;

  const sampleValues = nonNullValues.slice(
    0,
    Math.min(100, nonNullValues.length),
  );

  const { isSensitive, tag } =
    detectSensitiveData(sampleValues);

  const dataType = inferDataType(sampleValues);

  const duplicatePercentage =
    nonNullValues.length === 0
      ? 0
      : (duplicateCount / nonNullValues.length) * 100;

  const validPercentage =
    rowCount === 0
      ? 0
      : ((rowCount - invalidValues) / rowCount) * 100;

  const qualityScore =
    (100 - nullPercentage) * 0.4 +
    (100 - duplicatePercentage) * 0.35 +
    validPercentage * 0.25;

  return {
    columnName,
    dataType,
    isSensitive,
    sensitiveTag: tag,
    nullCount,
    duplicateCount,
    invalidValues,
    nullPercentage,
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
  };
}

/**
 * Trust score
 */
function calculateTrustScore(
  columnMetrics: ColumnMetrics[],
  qualityScore: number,
): number {
  if (!columnMetrics.length) {
    return 0;
  }

  const avgNullPercentage =
    columnMetrics.reduce(
      (sum, col) => sum + col.nullPercentage,
      0,
    ) / columnMetrics.length;

  const avgDuplicatePercentage =
    columnMetrics.reduce((sum, col) => {
      const total =
        col.nullCount + col.duplicateCount;

      return (
        sum +
        (total === 0
          ? 0
          : (col.duplicateCount / total) * 100)
      );
    }, 0) / columnMetrics.length;

  const completenessScore = 100 - avgNullPercentage;

  const consistencyScore = 100 - avgDuplicatePercentage;

  const classificationScore = columnMetrics.every(
    (col) =>
      col.isSensitive || col.dataType !== "unknown",
  )
    ? 100
    : 70;

  return Math.min(
    100,
    Math.max(
      0,
      qualityScore * 0.4 +
        completenessScore * 0.3 +
        consistencyScore * 0.2 +
        classificationScore * 0.1,
    ),
  );
}

/**
 * Placeholder value score
 */
function calculateValueScore(): number {
  return 50;
}

/**
 * Extract metadata
 */
export function extractColumnMetadata(
  rows: Record<string, unknown>[],
): DatasetMetrics {
  if (!rows.length) {
    return {
      rowCount: 0n,
      columnCount: 0n,
      qualityScore: 0,
      trustScore: 0,
      valueScore: 0,
      columnMetrics: [],
    };
  }

  const headers = Object.keys(rows[0]);

  const columnMetrics = headers.map((header) => {
    const values = rows.map((row) => row[header]);

    return calculateColumnMetrics(
      header,
      values,
      rows.length,
    );
  });

  const qualityScore =
    columnMetrics.reduce(
      (sum, col) => sum + col.qualityScore,
      0,
    ) / columnMetrics.length;

  const trustScore = calculateTrustScore(
    columnMetrics,
    qualityScore,
  );

  const valueScore = calculateValueScore();

  return {
    rowCount: BigInt(rows.length),
    columnCount: BigInt(headers.length),
    qualityScore,
    trustScore,
    valueScore,
    columnMetrics,
  };
}