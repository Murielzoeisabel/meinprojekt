const express = require('express');
const communityService = require('./community.service');

const createCommunityRouter = ({
  parsePositiveInt,
  sendApiError,
  broadcastEvent
}) => {
  const router = express.Router();

  router.get('/posts', async (req, res) => {
    try {
      const posts = await communityService.getAllPosts();
      return res.json(posts);
    } catch (error) {
      console.error('Fehler beim Laden der Community-Posts:', error);
      return res.status(500).json({ error: 'Community-Posts konnten nicht geladen werden.' });
    }
  });

  router.post('/posts', async (req, res) => {
    try {
      const post = await communityService.createPost(req.body, req.user, { broadcastEvent });
      return res.status(201).json(post);
    } catch (error) {
      if (error instanceof communityService.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Fehler beim Erstellen eines Community-Posts:', error);
      return res.status(500).json({ error: 'Beitrag konnte nicht erstellt werden.' });
    }
  });

  router.delete('/posts/:id', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      if (id === null) {
        return res.status(400).json({ error: 'Ungueltige Post-ID.' });
      }

      await communityService.deletePost(id, req.user, { broadcastEvent });
      return res.json({ success: true });
    } catch (error) {
      if (error instanceof communityService.NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Fehler beim Loeschen eines Community-Posts:', error);
      return res.status(500).json({ error: 'Post konnte nicht geloescht werden.' });
    }
  });

  router.post('/posts/:id/reactions', async (req, res) => {
    try {
      const id = parsePositiveInt(req.params.id);
      const { type } = req.body;

      if (id === null) {
        return res.status(400).json({ error: 'Ungueltige Post-ID.' });
      }

      const post = await communityService.reactToPost(id, type, { broadcastEvent });
      return res.json(post);
    } catch (error) {
      if (error instanceof communityService.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof communityService.NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      console.error('Fehler beim Speichern einer Reaktion:', error);
      return res.status(500).json({ error: 'Reaktion konnte nicht gespeichert werden.' });
    }
  });

  router.get('/messages', async (req, res) => {
    try {
      const messages = await communityService.getAllMessages();
      return res.json(messages);
    } catch (error) {
      console.error('Fehler beim Laden der Community-Nachrichten:', error);
      return res.status(500).json({ error: 'Nachrichten konnten nicht geladen werden.' });
    }
  });

  router.post('/messages', async (req, res) => {
    try {
      const message = await communityService.createMessage(req.body, req.user, { broadcastEvent });
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof communityService.ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Fehler beim Erstellen einer Community-Nachricht:', error);
      return res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden.' });
    }
  });

  return router;
};

module.exports = createCommunityRouter;
