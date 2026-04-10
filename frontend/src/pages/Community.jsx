import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Cat, MessageCircle, Send, Sparkles, ThumbsUp } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import './Community.css';
import {
  addCommunityMessage,
  addCommunityPost,
  getCommunityMessages,
  getCommunityPosts,
  reactToCommunityPost
} from '../services/api';

void motion;

const REACTION_STATS_KEY = 'community-reaction-stats-v1';
const PROFILE_NAME_KEY = 'cat-slim-down-profile-name';
const PROFILE_IMAGE_KEY = 'cat-slim-down-profile-image';
const CHAT_EMOJIS = ['😺', '😻', '🎉', '💪', '👏', '❤️', '🔥', '🥳', '🐾', '👍'];

const normalizeName = (value) => String(value || '').trim().toLowerCase();

const loadReactionStats = () => {
  try {
    const raw = localStorage.getItem(REACTION_STATS_KEY);
    if (!raw) return { givenLikes: 0, givenThumbs: 0 };
    const parsed = JSON.parse(raw);
    return {
      givenLikes: Number(parsed?.givenLikes || 0),
      givenThumbs: Number(parsed?.givenThumbs || 0)
    };
  } catch {
    return { givenLikes: 0, givenThumbs: 0 };
  }
};

const loadProfileName = () => {
  try {
    const storedName = localStorage.getItem(PROFILE_NAME_KEY);
    return storedName && storedName.trim() ? storedName.trim() : 'Du';
  } catch {
    return 'Du';
  }
};

const loadProfileImage = () => {
  try {
    const storedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    return storedImage && storedImage.trim() ? storedImage.trim() : '';
  } catch {
    return '';
  }
};

const getFallbackAvatar = (userName) => `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(userName || 'Du')}`;

const getMentionMatch = (value) => value.match(/(^|\s)@([^\s@]{0,30})$/);

const renderTextWithMentions = (text) => {
  const parts = String(text || '').split(/(@[^\s@]+)/g);
  return parts.map((part, index) => {
    if (/^@[^\s@]+$/.test(part)) {
      return (
        <span
          key={`${part}-${index}`}
          style={{ color: 'var(--accent-primary)', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', borderRadius: '8px', padding: '0 0.22rem' }}
        >
          {part}
        </span>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [name, setName] = useState(loadProfileName);
  const [profileImage, setProfileImage] = useState(loadProfileImage);
  const [reactionStats, setReactionStats] = useState(loadReactionStats);
  const [errorMsg, setErrorMsg] = useState('');
  const [postDraft, setPostDraft] = useState({
    author: '',
    text: '',
    photo: '',
    beforeWeight: '',
    nowWeight: ''
  });
  const [mentionSuggestions, setMentionSuggestions] = useState([]);

  const loadCommunityData = async () => {
    try {
      const [postData, messageData] = await Promise.all([getCommunityPosts(), getCommunityMessages()]);
      setPosts(Array.isArray(postData) ? postData : []);
      setMessages(Array.isArray(messageData) ? messageData : []);
    } catch {
      setErrorMsg('Community-Daten konnten nicht geladen werden.');
    }
  };

  useEffect(() => {
    localStorage.setItem(REACTION_STATS_KEY, JSON.stringify(reactionStats));
  }, [reactionStats]);

  useEffect(() => {
    setProfileImage(loadProfileImage());
  }, []);

  useEffect(() => {
    const syncProfileImage = () => setProfileImage(loadProfileImage());
    window.addEventListener('focus', syncProfileImage);
    window.addEventListener('profile-updated', syncProfileImage);
    return () => {
      window.removeEventListener('focus', syncProfileImage);
      window.removeEventListener('profile-updated', syncProfileImage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [postData, messageData] = await Promise.all([getCommunityPosts(), getCommunityMessages()]);
        if (cancelled) return;
        setPosts(Array.isArray(postData) ? postData : []);
        setMessages(Array.isArray(messageData) ? messageData : []);
      } catch (error) {
        if (!cancelled) {
          console.error('Fehler beim Laden der Community-Daten:', error);
        }
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const totalReactions = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        acc.gefaelltMir += Number(post.gefaelltMir ?? post.likes ?? 0);
        acc.daumenHoch += Number(post.daumenHoch ?? post.hearts ?? 0);
        return acc;
      },
      { gefaelltMir: 0, daumenHoch: 0 }
    );
  }, [posts]);

  const viewerName = (name || '').trim() || 'Du';
  const myReceivedReactions = useMemo(() => {
    const normalizedViewerName = normalizeName(viewerName);

    return posts.reduce(
      (acc, post) => {
        if (normalizeName(post.author) !== normalizedViewerName) return acc;

        acc.likes += Number(post.gefaelltMir ?? post.likes ?? 0);
        acc.thumbs += Number(post.daumenHoch ?? post.hearts ?? 0);
        return acc;
      },
      { likes: 0, thumbs: 0 }
    );
  }, [posts, viewerName]);

  const supportBadge = useMemo(() => {
    const supportGiven = reactionStats.givenThumbs;

    if (supportGiven >= 40) {
      return { title: 'Support-Profi', subtitle: `${supportGiven} Unterstützungen vergeben` };
    }
    if (supportGiven >= 20) {
      return { title: 'Community-Supporter', subtitle: `${supportGiven} Unterstützungen vergeben` };
    }
    if (supportGiven >= 10) {
      return { title: 'Mutmacher', subtitle: `${supportGiven} Unterstützungen vergeben` };
    }

    return null;
  }, [reactionStats.givenThumbs]);

  const mentionCandidates = useMemo(() => {
    const names = new Set();

    messages.forEach((msg) => {
      const candidate = String(msg.user || '').trim();
      if (candidate) names.add(candidate);
    });

    posts.forEach((post) => {
      const candidate = String(post.author || '').trim();
      if (candidate) names.add(candidate);
    });

    if (viewerName.trim()) names.add(viewerName.trim());

    return Array.from(names).sort((a, b) => a.localeCompare(b, 'de'));
  }, [messages, posts, viewerName]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [messages]);

  const formatMessageDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(parsed);
  };

  const formatMessageTime = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '--:--';
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  };

  const reactToPost = async (postId, type) => {
    try {
      setErrorMsg('');
      await reactToCommunityPost(postId, type);
      setReactionStats((prev) => ({
        givenLikes: prev.givenLikes + (type === 'like' ? 1 : 0),
        givenThumbs: prev.givenThumbs + (type === 'thumbsUp' ? 1 : 0)
      }));
      await loadCommunityData();
    } catch {
      setErrorMsg('Reaktion konnte nicht gespeichert werden.');
    }
  };

  const handlePostDraftChange = (field) => (event) => {
    setPostDraft((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submitPost = async (event) => {
    event.preventDefault();

    if (!postDraft.author.trim() || !postDraft.text.trim()) return;

    try {
      setErrorMsg('');
      await addCommunityPost({
        author: postDraft.author.trim(),
        text: postDraft.text.trim(),
        photo: postDraft.photo.trim(),
        beforeWeight: postDraft.beforeWeight,
        nowWeight: postDraft.nowWeight
      });

      setPostDraft({ author: '', text: '', photo: '', beforeWeight: '', nowWeight: '' });
      await loadCommunityData();
    } catch {
      setErrorMsg('Beitrag konnte nicht veröffentlicht werden.');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draftMessage.trim();
    if (!text) return;

    try {
      setErrorMsg('');
      await addCommunityMessage({
        user: name.trim() || 'Du',
        avatar: profileImage || undefined,
        text
      });

      setDraftMessage('');
      setMentionSuggestions([]);
      await loadCommunityData();
    } catch {
      setErrorMsg('Nachricht konnte nicht gesendet werden.');
    }
  };

  const handleDraftMessageChange = (event) => {
    const value = event.target.value;
    setDraftMessage(value);

    const match = getMentionMatch(value);
    if (!match) {
      setMentionSuggestions([]);
      return;
    }

    const query = String(match[2] || '').toLowerCase();
    const filtered = mentionCandidates
      .filter((candidate) => candidate.toLowerCase().includes(query))
      .slice(0, 6);

    setMentionSuggestions(filtered);
  };

  const insertMention = (userName) => {
    setDraftMessage((prev) => prev.replace(/(^|\s)@([^\s@]{0,30})$/, (_, leadingWhitespace) => `${leadingWhitespace}@${userName} `));
    setMentionSuggestions([]);
  };

  const insertEmoji = (emoji) => {
    setDraftMessage((prev) => `${prev}${emoji}`);
  };

  return (
    <AnimatedPage>
      {errorMsg && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239, 68, 68, 0.45)', color: 'var(--danger)' }}>
          {errorMsg}
        </div>
      )}

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          marginBottom: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background:
            'radial-gradient(circle at 85% 20%, rgba(251, 191, 36, 0.24), transparent 36%), linear-gradient(130deg, rgba(16, 185, 129, 0.16), rgba(59, 130, 246, 0.12))',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.16)',
            right: '-60px',
            top: '-70px',
            filter: 'blur(2px)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', color: 'var(--accent-primary)', fontWeight: 700, position: 'relative' }}>
          <Sparkles size={16} />
          Community Forum
        </div>

        <h1 style={{ margin: '0 0 0.45rem 0', position: 'relative' }}>Gemeinsam leichter ans Ziel</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '780px', lineHeight: 1.6, position: 'relative' }}>
          Teile Fortschritte, motiviere andere Katzeneltern und feiere jeden kleinen Erfolg zusammen mit der Community.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.9rem', position: 'relative' }}>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.24 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '999px', padding: '0.25rem 0.62rem', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <MessageCircle size={14} /> {messages.length} Chatnachrichten
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.24 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '999px', padding: '0.25rem 0.62rem', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <Cat size={14} /> {posts.length} Fortschrittsbeiträge
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.24 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', borderRadius: '999px', padding: '0.25rem 0.62rem', fontSize: '0.84rem', fontWeight: 700 }}
          >
            <ThumbsUp size={14} /> {totalReactions.gefaelltMir + totalReactions.daumenHoch} Reaktionen gesamt
          </motion.span>
        </div>
      </motion.div>

      <div className="community-stats-grid">
        <div className="card card-hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Cat size={18} color="var(--accent-primary)" />
          <strong>{reactionStats.givenLikes}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Von dir vergeben: Super süß</span>
        </div>
        <div className="card card-hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <ThumbsUp size={18} color="var(--accent-primary)" />
          <strong>{reactionStats.givenThumbs}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Von dir vergeben: Daumen hoch</span>
        </div>
        <div className="card card-hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Cat size={18} color="var(--accent-primary)" />
          <strong>{myReceivedReactions.likes + myReceivedReactions.thumbs}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>
            Auf deine Beiträge erhalten ({viewerName})
          </span>
        </div>
        <div className="card card-hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <MessageCircle size={18} color="var(--accent-primary)" />
          <strong>{messages.length}</strong>
          <span style={{ color: 'var(--text-secondary)' }}>Textnachrichten im Gruppen-Chat</span>
        </div>
      </div>

      <p style={{ marginTop: '-0.4rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
        <strong>Hinweis:</strong> Super süß = niedliches Foto, Daumen hoch = Unterstützung beim Abnehmfortschritt.
      </p>

      {supportBadge && (
        <div
          className="card"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid rgba(234, 179, 8, 0.42)', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(251, 191, 36, 0.06))' }}
        >
          <Award size={20} color="#a16207" />
          <div>
            <strong style={{ color: '#854d0e' }}>Abzeichen: {supportBadge.title}</strong>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)' }}>
              Danke fürs Unterstützen anderer Katzen beim Abnehmweg - {supportBadge.subtitle}.
            </p>
          </div>
        </div>
      )}

      <p style={{ marginTop: '-0.8rem', marginBottom: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
        Gesamt in der Community: {totalReactions.gefaelltMir} Super-süß-Reaktionen und {totalReactions.daumenHoch} Unterstützungs-Daumen.
      </p>

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
                <p style={{ marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Reaktionen: Super süß für Niedlichkeits-Faktor, Daumen hoch für Unterstützung beim Abnehmweg.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem' }}
                    onClick={() => reactToPost(post.id, 'like')}
                  >
                    <Cat size={15} /> Super süß ({post.gefaelltMir ?? post.likes ?? 0})
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.45rem 0.9rem' }}
                    onClick={() => reactToPost(post.id, 'thumbsUp')}
                  >
                    <ThumbsUp size={15} /> Abnehmweg unterstützen ({post.daumenHoch ?? post.hearts ?? 0})
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="card" style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: '0.85rem', minHeight: '620px' }}>
          <h2>Gruppen-Chat</h2>

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
              onChange={handleDraftMessageChange}
              placeholder="Schreibe eine Nachricht"
              rows={3}
              style={{ resize: 'vertical', marginBottom: 0 }}
            />
            {mentionSuggestions.length > 0 && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', background: 'var(--surface-color)', padding: '0.35rem' }}>
                <p style={{ margin: '0 0 0.35rem 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nutzer taggen:</p>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {mentionSuggestions.map((candidate) => (
                    <button
                      key={candidate}
                      type="button"
                      onClick={() => insertMention(candidate)}
                      style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '999px', padding: '0.22rem 0.58rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      @{candidate}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CHAT_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  title={`Emoji ${emoji} einfügen`}
                  style={{
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.24rem 0.45rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button className="btn-primary" type="submit">
              <Send size={16} /> Senden
            </button>
          </form>

          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '0.7rem',
              overflowY: 'auto',
              background: 'var(--bg-color)'
            }}
          >
            {sortedMessages.map((msg, index) => {
              const currentDateLabel = formatMessageDate(msg.createdAt);
              const prevDateLabel = index > 0 ? formatMessageDate(sortedMessages[index - 1].createdAt) : null;
              const showDateSeparator = index === 0 || currentDateLabel !== prevDateLabel;
              const isOwnMessage = normalizeName(msg.user) === normalizeName(viewerName);
              const messageAvatar = isOwnMessage && profileImage
                ? profileImage
                : (msg.avatar || getFallbackAvatar(msg.user));

              return (
                <div key={msg.id} style={{ marginBottom: '0.7rem' }}>
                  {showDateSeparator && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0 0.6rem 0' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
                        {currentDateLabel}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <img
                      src={messageAvatar}
                      alt={`Profilbild von ${msg.user}`}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.7rem' }}>
                        <strong style={{ color: 'var(--accent-primary)' }}>{msg.user}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatMessageTime(msg.createdAt)}</span>
                      </div>
                      <p style={{ marginTop: '0.2rem' }}>{renderTextWithMentions(msg.text)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Community;
