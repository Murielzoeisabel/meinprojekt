const prisma = require('../../prisma/client');
const { sendNewPostEmailAsync } = require('../../utils/mailer');
const { sendPushNotification } = require('../../utils/webpush');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
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

async function getAllPosts() {
  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return posts.map((post) => ({
    ...post,
    gefaelltMir: post.likes,
    daumenHoch: post.hearts
  }));
}

async function createPost(body, user, { broadcastEvent }) {
  const { author, text, photo, beforeWeight, nowWeight } = body;

  if (!author || !String(author).trim() || !text || !String(text).trim()) {
    throw new ValidationError('Autor und Text sind erforderlich.');
  }

  const parsedBeforeWeight = Number.parseFloat(beforeWeight);
  const parsedNowWeight = Number.parseFloat(nowWeight);

  const createdPost = await prisma.communityPost.create({
    data: {
      userId: user.userId,
      author: String(author).trim(),
      text: String(text).trim(),
      photo: photo && String(photo).trim()
        ? String(photo).trim()
        : 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80',
      beforeWeight: Number.isNaN(parsedBeforeWeight) ? null : parsedBeforeWeight,
      nowWeight: Number.isNaN(parsedNowWeight) ? null : parsedNowWeight,
      likes: 0,
      hearts: 0
    }
  });

  // Broadcast WebSocket event
  broadcastEvent('new-post', createdPost);

  // Send asynchronous E-Mail notification (non-blocking)
  const recipientEmail = user.email || 'onboarding@resend.dev';
  sendNewPostEmailAsync(recipientEmail, {
    author: String(author).trim(),
    text: String(text).trim(),
    postId: createdPost.id
  });

  return {
    ...createdPost,
    gefaelltMir: createdPost.likes,
    daumenHoch: createdPost.hearts
  };
}

async function deletePost(postId, user, { broadcastEvent }) {
  const existing = await prisma.communityPost.findFirst({
    where: { id: postId, userId: user.userId },
    select: { id: true }
  });
  
  if (!existing) {
    throw new NotFoundError('Post nicht gefunden oder keine Berechtigung.');
  }

  await prisma.communityPost.delete({ where: { id: postId } });

  // Broadcast WebSocket event
  broadcastEvent('delete-post', { id: postId });
  return true;
}

async function reactToPost(postId, type, { broadcastEvent }) {
  if (type !== 'like' && type !== 'thumbsUp') {
    throw new ValidationError('Ungültiger Reaktionstyp.');
  }

  const existing = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!existing) {
    throw new NotFoundError('Post nicht gefunden.');
  }

  const updatedPost = await prisma.communityPost.update({
    where: { id: postId },
    data: type === 'like'
      ? { likes: { increment: 1 } }
      : { hearts: { increment: 1 } }
  });

  // Broadcast WebSocket event
  broadcastEvent('new-reaction', updatedPost);

  return {
    ...updatedPost,
    gefaelltMir: updatedPost.likes,
    daumenHoch: updatedPost.hearts
  };
}

async function getAllMessages() {
  const messages = await prisma.communityMessage.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return messages.map((message) => ({
    id: message.id,
    user: message.userName,
    avatar: message.avatar,
    text: message.text,
    createdAt: message.createdAt
  }));
}

async function createMessage(body, user, { broadcastEvent }) {
  const { user: authorName, text, avatar } = body;

  if (!text || !String(text).trim()) {
    throw new ValidationError('Nachrichtentext ist erforderlich.');
  }

  const createdMessage = await prisma.communityMessage.create({
    data: {
      userId: user.userId,
      userName: authorName && String(authorName).trim() ? String(authorName).trim() : 'Du',
      avatar: avatar && String(avatar).trim() ? String(avatar).trim() : null,
      text: String(text).trim()
    }
  });

  const messagePayload = {
    id: createdMessage.id,
    user: createdMessage.userName,
    avatar: createdMessage.avatar,
    text: createdMessage.text,
    createdAt: createdMessage.createdAt
  };

  // Broadcast WebSocket event
  broadcastEvent('new-message', messagePayload);

  // Send push notification
  sendPushNotification({
    title: `${createdMessage.userName} schreibt im Chat`,
    body: createdMessage.text,
    url: '/community'
  }).catch(err => console.error('[PushTrigger ERROR] failed sending:', err));

  return messagePayload;
}

module.exports = {
  getAllPosts,
  createPost,
  deletePost,
  reactToPost,
  getAllMessages,
  createMessage,
  ValidationError,
  NotFoundError,
  ForbiddenError
};
