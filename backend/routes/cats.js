const express = require('express');

const createCatsRouter = ({
  cats,
  weightHistory,
  calorieHistory,
  withCurrentWeight,
  parsePositiveInt,
  sendApiError,
  validateCatPayload,
  getSuggestedIdealWeight
}) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { userId } = req.query;

    if (userId !== undefined) {
      const parsedUserId = parsePositiveInt(userId);
      if (parsedUserId === null) {
        return sendApiError(res, 400, 'INVALID_QUERY_USER_ID', 'Query-Parameter "userId" muss eine positive Ganzzahl sein.', { field: 'userId' });
      }

      return res.json(cats.filter((cat) => cat.userId === parsedUserId).map(withCurrentWeight));
    }

    return res.json(cats.map(withCurrentWeight));
  });

  router.get('/:id', (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
    }

    const cat = cats.find((item) => item.id === id);
    if (!cat) {
      return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
    }

    return res.json(withCurrentWeight(cat));
  });

  router.post('/', (req, res) => {
    const validationError = validateCatPayload(req.body);
    if (validationError) {
      return sendApiError(res, 400, validationError.code, validationError.message, validationError.details);
    }

    const normalizedBreed = req.body.breed || 'Mischling';
    const normalizedSize = req.body.size || 'mittel';
    const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
      ? getSuggestedIdealWeight(normalizedBreed, normalizedSize)
      : parseFloat(req.body.idealWeight);
    const name = req.body.name.trim();

    const newCat = {
      id: cats.length > 0 ? Math.max(...cats.map((cat) => cat.id)) + 1 : 1,
      userId: req.body.userId !== undefined ? Number(req.body.userId) : null,
      name,
      age: req.body.age !== undefined ? Number(req.body.age) : null,
      breed: normalizedBreed,
      size: normalizedSize,
      idealWeight: parsedIdealWeight,
      photo: req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
    };

    cats.push(newCat);
    weightHistory[newCat.id] = [];
    calorieHistory[newCat.id] = [];

    return res.status(201).json(newCat);
  });

  router.put('/:id', (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
    }

    const catIndex = cats.findIndex((cat) => cat.id === id);
    if (catIndex === -1) {
      return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
    }

    const validationError = validateCatPayload(req.body);
    if (validationError) {
      return sendApiError(res, 400, validationError.code, validationError.message, validationError.details);
    }

    const nextBreed = req.body.breed || 'Mischling';
    const nextSize = req.body.size || 'mittel';
    const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
      ? getSuggestedIdealWeight(nextBreed, nextSize)
      : parseFloat(req.body.idealWeight);

    cats[catIndex] = {
      id,
      userId: req.body.userId !== undefined ? Number(req.body.userId) : null,
      name: req.body.name.trim(),
      age: req.body.age !== undefined ? Number(req.body.age) : null,
      breed: nextBreed,
      size: nextSize,
      idealWeight: parsedIdealWeight,
      photo: req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${req.body.name.trim()}`
    };

    return res.json(cats[catIndex]);
  });

  router.delete('/:id', (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
    }

    const catIndex = cats.findIndex((cat) => cat.id === id);
    if (catIndex === -1) {
      return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
    }

    cats.splice(catIndex, 1);
    delete weightHistory[id];
    delete calorieHistory[id];
    return res.status(204).send();
  });

  router.get('/:id/weightentries', (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
    }

    const catExists = cats.some((cat) => cat.id === id);
    if (!catExists) {
      return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
    }

    return res.json(weightHistory[id] || []);
  });

  router.post('/:id/weightentries', (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
    }

    const catExists = cats.some((cat) => cat.id === id);
    if (!catExists) {
      return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
    }

    const { weight, date } = req.body || {};
    const parsedWeight = Number(weight);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 25) {
      return sendApiError(res, 400, 'INVALID_WEIGHT', 'Feld "weight" muss eine positive Zahl kleiner/gleich 25 sein.', {
        field: 'weight',
        minExclusive: 0,
        max: 25
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    if (!weightHistory[id]) weightHistory[id] = [];
    weightHistory[id].push({ date: targetDate, weight: parsedWeight });
    weightHistory[id].sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(201).json(weightHistory[id]);
  });

  return router;
};

module.exports = createCatsRouter;
