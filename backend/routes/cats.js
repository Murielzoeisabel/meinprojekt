const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');

const createCatsRouter = ({
  parsePositiveInt,
  sendApiError,
  validateCatPayload,
  getSuggestedIdealWeight
}) => {
  const router = express.Router();

  const sizeFromPrisma = {
    KLEIN: 'klein',
    MITTEL: 'mittel',
    GROSS: 'gross'
  };

  const getOwnedCatWhere = (id, userId) => ({
    id,
    userId
  });

  const resolveCatOwnerId = async (requestedUserId) => {
    if (requestedUserId !== undefined) {
      const parsedUserId = parsePositiveInt(requestedUserId);
      if (parsedUserId === null) {
        return null;
      }

      const requestedUser = await prisma.user.findUnique({
        where: { id: parsedUserId },
        select: { id: true }
      });

      return requestedUser ? requestedUser.id : null;
    }

    const existingUser = await prisma.user.findFirst({
      orderBy: { id: 'asc' },
      select: { id: true }
    });

    if (existingUser) {
      return existingUser.id;
    }

    const fallbackUser = await prisma.user.upsert({
      where: { email: 'default@cat-slim-down.local' },
      update: {},
      create: {
        email: 'default@cat-slim-down.local',
        name: 'Default User',
        passwordHash: await bcrypt.hash('default-user-only', 12)
      },
      select: { id: true }
    });

    return fallbackUser.id;
  };

  router.get('/', async (req, res) => {
    try {
      const where = { userId: req.user.userId };

      const catsFromDatabase = await prisma.cat.findMany({
        where,
        orderBy: { id: 'asc' },
        include: {
          weightEntries: {
            orderBy: { date: 'asc' }
          }
        }
      });

      const catsWithCurrentWeight = catsFromDatabase.map((cat) => {
        const latestWeightEntry = cat.weightEntries[cat.weightEntries.length - 1] || null;

        return {
          ...cat,
          size: sizeFromPrisma[cat.size] || cat.size,
          currentWeight: latestWeightEntry ? latestWeightEntry.weight : null
        };
      });

      return res.json(catsWithCurrentWeight);
    } catch (error) {
      console.error('Fehler beim Laden der Katzen aus der Datenbank:', error);
      return res.status(500).json({
        error: 'Katzen konnten nicht aus der Datenbank geladen werden.'
      });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
      }

      const cat = await prisma.cat.findFirst({
        where: getOwnedCatWhere(id, req.user.userId),
        include: {
          weightEntries: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!cat) {
        return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
      }

      const latestWeightEntry = cat.weightEntries[cat.weightEntries.length - 1] || null;
      return res.json({
        ...cat,
        size: sizeFromPrisma[cat.size] || cat.size,
        currentWeight: latestWeightEntry ? latestWeightEntry.weight : null
      });
    } catch (error) {
      console.error('Fehler beim Laden der Cat aus der Datenbank:', error);
      return res.status(500).json({
        error: 'Cat konnte nicht aus der Datenbank geladen werden.'
      });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const validationError = validateCatPayload(req.body);
      if (validationError) {
        return sendApiError(res, 400, validationError.code, validationError.message, validationError.details);
      }

      if (req.body.userId !== undefined) {
        const parsedUserId = parsePositiveInt(req.body.userId);
        if (parsedUserId === null) {
          return sendApiError(res, 400, 'INVALID_USER_ID', 'Feld "userId" muss eine positive Ganzzahl sein.', { field: 'userId' });
        }

        if (parsedUserId !== req.user.userId) {
          return sendApiError(res, 403, 'FORBIDDEN', 'Auf diesen Benutzer kann nicht zugegriffen werden.');
        }
      }

      const normalizedBreed = req.body.breed || 'Mischling';
      const normalizedSize = req.body.size || 'mittel';
      const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
        ? getSuggestedIdealWeight(normalizedBreed, normalizedSize)
        : parseFloat(req.body.idealWeight);
      const name = req.body.name.trim();

      const sizeMap = {
        klein: 'KLEIN',
        mittel: 'MITTEL',
        gross: 'GROSS'
      };

      const createdCat = await prisma.cat.create({
        data: {
          userId: req.user.userId,
          name,
          age: req.body.age !== undefined ? Number(req.body.age) : null,
          breed: normalizedBreed,
          size: sizeMap[normalizedSize],
          idealWeight: parsedIdealWeight,
          photo: req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
        }
      });

      return res.status(201).json({
        ...createdCat,
        size: normalizedSize
      });
    } catch (error) {
      if (error?.code === 'P2003') {
        return sendApiError(
          res,
          400,
          'INVALID_USER_ID',
          'Feld "userId" verweist auf keinen existierenden User.',
          { field: 'userId' }
        );
      }

      console.error('Fehler beim Erstellen der Cat in der Datenbank:', error);
      return res.status(500).json({
        error: 'Cat konnte nicht in der Datenbank erstellt werden.'
      });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
      }

      const validationError = validateCatPayload(req.body, { requireName: false });
      if (validationError) {
        return sendApiError(res, 400, validationError.code, validationError.message, validationError.details);
      }

      const existingCat = await prisma.cat.findFirst({
        where: getOwnedCatWhere(id, req.user.userId)
      });
      if (!existingCat) {
        return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
      }

      const sizeToPrisma = {
        klein: 'KLEIN',
        mittel: 'MITTEL',
        gross: 'GROSS'
      };

      const existingSize = sizeFromPrisma[existingCat.size] || 'mittel';
      const nextBreed = req.body.breed !== undefined ? req.body.breed : existingCat.breed;
      const nextSize = req.body.size !== undefined ? req.body.size : existingSize;
      const parsedIdealWeight = req.body.idealWeight === undefined || req.body.idealWeight === ''
        ? (req.body.breed !== undefined || req.body.size !== undefined
          ? getSuggestedIdealWeight(nextBreed, nextSize)
          : existingCat.idealWeight)
        : parseFloat(req.body.idealWeight);

      const resolvedName = req.body.name !== undefined ? req.body.name.trim() : existingCat.name;
      const resolvedPhoto = req.body.photo !== undefined
        ? req.body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(resolvedName)}`
        : existingCat.photo;

      let nextUserId = existingCat.userId;
      if (req.body.userId !== undefined) {
        const parsedUserId = parsePositiveInt(req.body.userId);
        if (parsedUserId === null) {
          return sendApiError(res, 400, 'INVALID_USER_ID', 'Feld "userId" muss eine positive Ganzzahl sein.', { field: 'userId' });
        }

        if (parsedUserId !== req.user.userId) {
          return sendApiError(res, 403, 'FORBIDDEN', 'Auf diesen Benutzer kann nicht zugegriffen werden.');
        }

        nextUserId = req.user.userId;
      }

      const updatedCat = await prisma.cat.update({
        where: { id },
        data: {
          userId: nextUserId,
          name: resolvedName,
          age: req.body.age !== undefined ? Number(req.body.age) : existingCat.age,
          breed: nextBreed,
          size: sizeToPrisma[nextSize],
          idealWeight: parsedIdealWeight,
          photo: resolvedPhoto
        }
      });

      return res.json({
        ...updatedCat,
        size: nextSize
      });
    } catch (error) {
      if (error?.code === 'P2003') {
        return sendApiError(
          res,
          400,
          'INVALID_USER_ID',
          'Feld "userId" verweist auf keinen existierenden User.',
          { field: 'userId' }
        );
      }

      console.error('Fehler beim Aktualisieren der Cat in der Datenbank:', error);
      return res.status(500).json({
        error: 'Cat konnte nicht in der Datenbank aktualisiert werden.'
      });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
      }

      const existingCat = await prisma.cat.findFirst({
        where: getOwnedCatWhere(id, req.user.userId)
      });
      if (!existingCat) {
        return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
      }

      await prisma.cat.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error('Fehler beim Loeschen der Cat aus der Datenbank:', error);
      return res.status(500).json({
        error: 'Cat konnte nicht aus der Datenbank geloescht werden.'
      });
    }
  });

  router.get('/:id/weightentries', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
      }

      const cat = await prisma.cat.findFirst({
        where: getOwnedCatWhere(id, req.user.userId),
        include: {
          weightEntries: {
            orderBy: { date: 'asc' }
          }
        }
      });

      if (!cat) {
        return sendApiError(res, 404, 'CAT_NOT_FOUND', `Keine Cat mit id=${id} gefunden.`);
      }

      return res.json(
        cat.weightEntries.map((entry) => ({
          date: new Date(entry.date).toISOString().split('T')[0],
          weight: entry.weight
        }))
      );
    } catch (error) {
      console.error('Fehler beim Laden der Gewichtseintraege aus der Datenbank:', error);
      return res.status(500).json({
        error: 'Gewichtseintraege konnten nicht aus der Datenbank geladen werden.'
      });
    }
  });

  router.post('/:id/weightentries', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return sendApiError(res, 400, 'INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
      }

      const catExists = await prisma.cat.findFirst({
        where: getOwnedCatWhere(id, req.user.userId),
        select: { id: true }
      });
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
      const parsedDate = new Date(`${targetDate}T00:00:00.000Z`);
      if (Number.isNaN(parsedDate.getTime())) {
        return sendApiError(res, 400, 'INVALID_DATE', 'Feld "date" muss ein gueltiges Datum im Format YYYY-MM-DD sein.', {
          field: 'date'
        });
      }

      await prisma.weightEntry.upsert({
        where: {
          catId_date: {
            catId: id,
            date: parsedDate
          }
        },
        create: {
          catId: id,
          date: parsedDate,
          weight: parsedWeight
        },
        update: {
          weight: parsedWeight
        }
      });

      const entries = await prisma.weightEntry.findMany({
        where: { catId: id },
        orderBy: { date: 'asc' }
      });

      return res.status(201).json(
        entries.map((entry) => ({
          date: new Date(entry.date).toISOString().split('T')[0],
          weight: entry.weight
        }))
      );
    } catch (error) {
      console.error('Fehler beim Speichern des Gewichtseintrags in der Datenbank:', error);
      return res.status(500).json({
        error: 'Gewichtseintrag konnte nicht in der Datenbank gespeichert werden.'
      });
    }
  });

  return router;
};

module.exports = createCatsRouter;
