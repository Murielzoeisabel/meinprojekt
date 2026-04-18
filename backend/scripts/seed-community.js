const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/client');

const COMMUNITY_JSON_PATH = path.join(__dirname, '..', 'data', 'community.json');

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNonNegativeInt = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(parsed));
};

const toDateOrNow = (value) => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

async function main() {
  if (!fs.existsSync(COMMUNITY_JSON_PATH)) {
    throw new Error(`community.json nicht gefunden: ${COMMUNITY_JSON_PATH}`);
  }

  const raw = fs.readFileSync(COMMUNITY_JSON_PATH, 'utf8');
  const parsed = JSON.parse(raw);

  const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
  const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

  const postRows = posts
    .map((post) => {
      const text = post?.text ? String(post.text).trim() : '';
      if (!text) {
        return null;
      }

      return {
        author: post?.author ? String(post.author).trim() : 'Unbekannt',
        text,
        photo: post?.photo ? String(post.photo).trim() : null,
        beforeWeight: toNumberOrNull(post?.beforeWeight),
        nowWeight: toNumberOrNull(post?.nowWeight),
        likes: toNonNegativeInt(post?.likes, 0),
        hearts: toNonNegativeInt(post?.hearts, 0),
        createdAt: toDateOrNow(post?.createdAt)
      };
    })
    .filter(Boolean);

  const messageRows = messages
    .map((message) => {
      const text = message?.text ? String(message.text).trim() : '';
      if (!text) {
        return null;
      }

      return {
        userName: message?.userName
          ? String(message.userName).trim()
          : (message?.user ? String(message.user).trim() : 'Du'),
        avatar: message?.avatar ? String(message.avatar).trim() : null,
        text,
        createdAt: toDateOrNow(message?.createdAt)
      };
    })
    .filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.postReaction.deleteMany({});
    await tx.communityPost.deleteMany({});
    await tx.communityMessage.deleteMany({});

    if (postRows.length > 0) {
      await tx.communityPost.createMany({ data: postRows });
    }

    if (messageRows.length > 0) {
      await tx.communityMessage.createMany({ data: messageRows });
    }
  });

  console.log(`Community-Seed erfolgreich: ${postRows.length} Posts, ${messageRows.length} Messages importiert.`);
}

main()
  .catch((error) => {
    console.error('Community-Seed fehlgeschlagen:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
