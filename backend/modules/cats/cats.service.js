const prisma = require('../../prisma/client');

class ValidationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

async function createCat(body, user, { validateCatPayload, parsePositiveInt, getSuggestedIdealWeight }) {
  const validationError = validateCatPayload(body);
  if (validationError) {
    throw new ValidationError(validationError.code, validationError.message, validationError.details);
  }

  if (body.userId !== undefined) {
    const parsedUserId = parsePositiveInt(body.userId);
    if (parsedUserId === null) {
      throw new ValidationError('INVALID_USER_ID', 'Feld "userId" muss eine positive Ganzzahl sein.', { field: 'userId' });
    }

    if (parsedUserId !== user.userId) {
      throw new ForbiddenError('Auf diesen Benutzer kann nicht zugegriffen werden.');
    }
  }

  const normalizedBreed = body.breed || 'Mischling';
  const normalizedSize = body.size || 'mittel';
  const parsedIdealWeight = body.idealWeight === undefined || body.idealWeight === ''
    ? getSuggestedIdealWeight(normalizedBreed, normalizedSize)
    : parseFloat(body.idealWeight);
  const name = body.name.trim();

  const sizeMap = {
    klein: 'KLEIN',
    mittel: 'MITTEL',
    gross: 'GROSS'
  };

  const createdCat = await prisma.cat.create({
    data: {
      userId: user.userId,
      name,
      age: body.age !== undefined ? Number(body.age) : null,
      breed: normalizedBreed,
      size: sizeMap[normalizedSize],
      idealWeight: parsedIdealWeight,
      photo: body.photo || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
    }
  });

  return {
    ...createdCat,
    size: normalizedSize
  };
}

async function deleteCat(catIdStr, user, { parsePositiveInt }) {
  const id = parsePositiveInt(catIdStr);
  if (id === null) {
    throw new ValidationError('INVALID_CAT_ID', 'Pfadparameter "id" muss eine positive Ganzzahl sein.', { field: 'id' });
  }

  const existingCat = await prisma.cat.findFirst({
    where: { id, userId: user.userId }
  });
  if (!existingCat) {
    throw new NotFoundError(`Keine Cat mit id=${id} gefunden.`);
  }

  await prisma.cat.delete({ where: { id } });
  return true;
}

module.exports = {
  createCat,
  deleteCat,
  ValidationError,
  NotFoundError,
  ForbiddenError
};
