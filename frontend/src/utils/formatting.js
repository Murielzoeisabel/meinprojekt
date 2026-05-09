/**
 * Formatiert ein Gewicht mit Dezimalstellen und Unit
 * z.B: 5.7 kg
 */
export const formatWeight = (weight, decimals = 1) => {
  if (weight === null || weight === undefined) {
    return '—';
  }
  const num = Number(weight);
  if (isNaN(num)) return '—';
  return `${num.toFixed(decimals)} kg`;
};

/**
 * Berechnet den Gewichtsverlust in Prozent
 * z.B: von 6.4 kg zu 5.7 kg = ~10.94%
 */
export const calculateWeightLossPercent = (startWeight, currentWeight) => {
  if (!startWeight || !currentWeight || startWeight === 0) {
    return 0;
  }

  const start = Number(startWeight);
  const current = Number(currentWeight);

  if (isNaN(start) || isNaN(current)) {
    return 0;
  }

  if (start <= current) {
    return 0; // Gewicht ist gleich oder gestiegen
  }

  return Math.round(((start - current) / start) * 10000) / 100; // Zwei Dezimalstellen
};

/**
 * Formatiert ein Datum zu deutschem Format
 * z.B: "12.05.2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

/**
 * Berechnet Tage seit einem Datum
 */
export const daysSinceDate = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch {
    return null;
  }
};

/**
 * Rundet eine Zahl auf eine bestimmte Anzahl von Dezimalstellen
 */
export const round = (num, decimals = 0) => {
  if (num === null || num === undefined) return null;
  const n = Number(num);
  if (isNaN(n)) return null;
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
