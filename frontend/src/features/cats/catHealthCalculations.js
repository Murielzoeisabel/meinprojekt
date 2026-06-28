/**
 * Berechnet das ideale Gewicht einer Katze basierend auf Größe und Alter
 * Quelle: Veterinärmedizinische Faustregel
 */
export const calculateIdealWeight = (size, ageYears) => {
  if (!size || ageYears === null || ageYears === undefined) return null;

  const sizeStr = String(size).toLowerCase().trim();
  const age = Number(ageYears);

  if (isNaN(age) || age < 0) return null;

  const baseWeights = {
    'klein': { min: 2.5, max: 3.5 },
    'small': { min: 2.5, max: 3.5 },
    'mittel': { min: 3.5, max: 4.5 },
    'medium': { min: 3.5, max: 4.5 },
    'gross': { min: 4.5, max: 5.5 },
    'large': { min: 4.5, max: 5.5 }
  };

  const category = baseWeights[sizeStr];
  if (!category) return null;

  // Jungkatzen: +10% pro Jahr bis 1 Jahr
  if (age < 1) {
    const growthFactor = 1 + (age * 0.1);
    return {
      min: Math.round(category.min * growthFactor * 100) / 100,
      max: Math.round(category.max * growthFactor * 100) / 100
    };
  }

  // Ab 7 Jahren: -2% pro Jahr (Senioren werden leichter)
  if (age >= 7) {
    const seniorFactor = 1 - ((age - 7) * 0.02);
    const minSenior = Math.max(category.min * 0.8, category.min * seniorFactor); // Min. 80%
    const maxSenior = Math.max(category.max * 0.8, category.max * seniorFactor);
    return {
      min: Math.round(minSenior * 100) / 100,
      max: Math.round(maxSenior * 100) / 100
    };
  }

  // Erwachsenen-Gewicht (1-7 Jahre)
  return {
    min: Math.round(category.min * 100) / 100,
    max: Math.round(category.max * 100) / 100
  };
};

/**
 * Berechnet, ob eine Katze übergewichtig ist
 * Basierend auf aktuellem Gewicht vs. idealem Gewicht
 */
export const getWeightStatus = (currentWeight, idealWeightMin, idealWeightMax) => {
  if (!currentWeight || idealWeightMin === null || idealWeightMax === null) {
    return null;
  }

  const weight = Number(currentWeight);
  const min = Number(idealWeightMin);
  const max = Number(idealWeightMax);

  if (isNaN(weight) || isNaN(min) || isNaN(max)) {
    return null;
  }

  if (weight < min) {
    return { status: 'underweight', label: 'Untergewicht' };
  }

  if (weight <= max) {
    return { status: 'ideal', label: 'Idealgewicht' };
  }

  const percentOver = Math.round(((weight - max) / max) * 100);
  return { status: 'overweight', label: 'Übergewicht', percentOver };
};

/**
 * Gibt Fütterungsempfehlung in kcal basierend auf Gewicht und Status
 */
export const getCalorieRecommendation = (weight, status) => {
  if (!weight || !status) return null;

  const w = Number(weight);
  if (isNaN(w) || w <= 0) return null;

  const statusStr = String(status).toLowerCase().trim();

  // Basierend auf wissenschaftlichen Richtlinien
  const caloriePerKg = {
    'ideal': 70,        // Normalgewicht: 70 kcal/kg
    'underweight': 80,  // Untergewicht: 80 kcal/kg (mehr Aufbau)
    'overweight': 50    // Übergewicht: 50 kcal/kg (sanftes Abnehmen)
  };

  const factor = caloriePerKg[statusStr];
  if (factor === undefined) return null;

  return Math.round(w * factor);
};
