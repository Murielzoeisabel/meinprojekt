import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, ThumbsUp, Trash2 } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import {
  addCommunityMessage,
  addCommunityPost,
  deleteCommunityPost,
  getCommunityMessages,
  getCommunityPosts,
  reactToCommunityPost
} from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [name, setName] = useState('Du');
  const [postDraft, setPostDraft] = useState({
    author: '',
    text: '',
    photo: '',
    beforeWeight: '',
    nowWeight: ''
  });

  const loadCommunityData = async () => {
    const [postData, messageData] = await Promise.all([getCommunityPosts(), getCommunityMessages()]);
    setPosts(Array.isArray(postData) ? postData : []);
    setMessages(Array.isArray(messageData) ? messageData : []);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [postData, messageData] = await Promise.all([getCommunityPosts(), getCommunityMessages()]);
        if (!isMounted) return;
        setPosts(Array.isArray(postData) ? postData : []);
        setMessages(Array.isArray(messageData) ? messageData : []);
      } catch (error) {
        console.error('Fehler beim Laden der Community-Daten:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const totalReactions = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        acc.likes += post.likes;
        acc.hearts += post.hearts;
        return acc;
      },
      { likes: 0, hearts: 0 }
    );
  }, [posts]);

  const reactToPost = async (postId, type) => {
    await reactToCommunityPost(postId, type);
    await loadCommunityData();
  };

  const removePost = async (postId) => {
    await deleteCommunityPost(postId);
    await loadCommunityData();
  };

  const handlePostDraftChange = (field) => (event) => {
    setPostDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submitPost = async (event) => {
    event.preventDefault();

    if (!postDraft.author.trim() || !postDraft.text.trim()) return;

    await addCommunityPost({
      author: postDraft.author.trim(),
      text: postDraft.text.trim(),
      photo: postDraft.photo.trim(),
      beforeWeight: postDraft.beforeWeight,
      nowWeight: postDraft.nowWeight
    });

    setPostDraft({ author: '', text: '', photo: '', beforeWeight: '', nowWeight: '' });
    await loadCommunityData();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draftMessage.trim();
    if (!text) return;

    await addCommunityMessage({
      user: name.trim() || 'Du',
      text
    });

    setDraftMessage('');
    await loadCommunityData();
  };

  return (
    <AnimatedPage>
      <h1>Community Forum</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Teile Fortschritte, feuere andere an und chatte live mit der Gruppe.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <ThumbsUp size={18} color="var(--accent-primary)" />
          <strong>{totalReactions.likes}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Likes insgesamt</span>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Heart size={18} color="var(--accent-primary)" />
          <strong>{totalReactions.hearts}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Hearts insgesamt</span>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <MessageCircle size={18} color="var(--accent-primary)" />
          <strong>{messages.length}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Chat-Nachrichten</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.2rem'
        }}
      >
        <section className="card" style={{ display: 'grid', gap: '1rem' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Neuen Fortschritt teilen</h2>
          <form
            onSubmit={submitPost}
            style={{
              display: 'grid',
              gap: '0.65rem',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.8rem',
              background: 'var(--bg-color)'
            }}
          >
            <input
              className="input-field"
              placeholder="Name (z. B. Lara & Nino)"
              value={postDraft.author}
              onChange={handlePostDraftChange('author')}
              style={{ marginBottom: 0 }}
            />
            <textarea
              className="input-field"
              rows={3}
              placeholder="Was hat euch geholfen?"
              value={postDraft.text}
              onChange={handlePostDraftChange('text')}
              style={{ marginBottom: 0, resize: 'vertical' }}
            />
            <input
              className="input-field"
              placeholder="Bild-URL"
              value={postDraft.photo}
              onChange={handlePostDraftChange('photo')}
              style={{ marginBottom: 0 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <input
                className="input-field"
                placeholder="Vorher (kg)"
                value={postDraft.beforeWeight}
                onChange={handlePostDraftChange('beforeWeight')}
                style={{ marginBottom: 0 }}
              />
              <input
                className="input-field"
                placeholder="Jetzt (kg)"
                value={postDraft.nowWeight}
                onChange={handlePostDraftChange('nowWeight')}
                style={{ marginBottom: 0 }}
              />
            </div>
            <button className="btn-primary" type="submit">Beitrag veröffentlichen</button>
          </form>

          <h2 style={{ marginBottom: '0.25rem' }}>Fortschritts-Galerie</h2>
          {posts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-color)'
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '240px',
                  background: 'rgba(159, 203, 69, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.4rem'
                }}
              >
                <img
                  src={post.photo}
                  alt={post.author}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ padding: '0.9rem' }}>
                <h3 style={{ marginBottom: '0.35rem' }}>{post.author}</h3>
                {post.beforeWeight != null && post.nowWeight != null ? (
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                    {post.beforeWeight} kg - {post.nowWeight} kg
                  </p>
                ) : null}
                <p style={{ marginBottom: '0.8rem' }}>{post.text}</p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem' }}
                    onClick={() => reactToPost(post.id, 'like')}
                  >
                    <ThumbsUp size={15} /> {post.likes}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem' }}
                    onClick={() => reactToPost(post.id, 'heart')}
                  >
                    <Heart size={15} /> {post.hearts}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem' }}
                    onClick={() => removePost(post.id)}
                  >
                    <Trash2 size={15} /> Löschen
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="card" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: '0.85rem', minHeight: '620px' }}>
          <h2>Gruppen-Chat</h2>

          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.7rem',
              overflowY: 'auto',
              background: 'var(--bg-color)'
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: '0.7rem' }}>
                <strong style={{ color: 'var(--accent-primary)' }}>{msg.user}</strong>
                <p style={{ marginTop: '0.2rem' }}>{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'grid', gap: '0.65rem' }}>
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dein Name"
              style={{ marginBottom: 0 }}
            />
            <textarea
              className="input-field"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Schreibe eine Nachricht mit Umlauten, z. B. Grüße aus Köln..."
              rows={3}
              style={{ resize: 'vertical', marginBottom: 0 }}
            />
            <button className="btn-primary" type="submit">
              <Send size={16} /> Senden
            </button>
          </form>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Community;
