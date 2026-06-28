import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

void motion;

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hallo! Ich bin dein KI-Tierarzt-Assistent (Beta). Frag mich alles rund um die Gesundheit und das Abnehmen deiner Katze!", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const replyTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
    }

    replyTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: "Gute Frage! Als KI rate ich dir, langsam vorzugehen. Ein Gewichtsverlust von 1-2% pro Woche ist ideal. Hochwertiges Nassfutter und etwas Bewegung helfen super!", sender: 'ai' }]);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '25px', // slightly offset against scrollbar
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageSquare size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '25px',
              width: '350px',
              height: '550px',
              backgroundColor: 'var(--surface-color)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid var(--border-color)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: 'var(--accent-primary)', padding: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={24} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>KI-Assistent</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  {msg.sender === 'ai' && <div style={{ background: 'var(--bg-color)', color: 'var(--accent-primary)', padding: '6px', borderRadius: '50%', height: '32px' }}><Bot size={18} /></div>}
                  <div style={{ 
                    background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-color)', 
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '10px 14px', 
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    borderTopRightRadius: msg.sender === 'user' ? 0 : '16px',
                    borderTopLeftRadius: msg.sender === 'ai' ? 0 : '16px',
                    lineHeight: '1.4'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg-color)', color: 'var(--accent-primary)', padding: '6px', borderRadius: '50%', height: '32px' }}><Bot size={18} /></div>
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <span style={{ padding: '10px 14px', background: 'var(--bg-color)', borderRadius: '16px', display: 'inline-block', fontSize: '0.9rem' }}>...</span>
                  </motion.div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div style={{ padding: '0.8rem', borderTop: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.9rem', borderRadius: '20px' }} 
                  placeholder="Frag mich etwas..." 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 0.8rem', borderRadius: '20px' }}><Send size={18} /></button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default FloatingChat;
