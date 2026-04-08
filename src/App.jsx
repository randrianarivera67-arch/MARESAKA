import { useState, useEffect } from 'react';
import { auth, provider, db } from './firebase';
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp
} from 'firebase/firestore';

// ─────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('home');

  useEffect(() => {
    // ✅ FIX #1 - unsubscribe onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Loader />;
  if (!user) return <Login />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="logo">🌿 Maresaka</span>
        <span className="user-chip">
          {user.photoURL && <img src={user.photoURL} alt="" className="avatar" />}
          {user.displayName || user.email}
        </span>
        <button className="btn-logout" onClick={() => signOut(auth)}>Logout</button>
      </header>

      <main className="content">
        {page === 'home'          && <Home />}
        {page === 'messages'      && <Messages user={user} />}
        {page === 'marketplace'   && <Marketplace />}
        {page === 'friends'       && <Friends />}
        {page === 'profile'       && <Profile user={user} />}
      </main>

      <nav className="bottomnav">
        {[
          { id: 'home',        icon: '🏠', label: 'Accueil' },
          { id: 'messages',    icon: '💬', label: 'Messages' },
          { id: 'marketplace', icon: '🛒', label: 'Marché' },
          { id: 'friends',     icon: '👥', label: 'Amis' },
          { id: 'profile',     icon: '👤', label: 'Profil' },
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            className={`nav-btn ${page === id ? 'active' : ''}`}
            onClick={() => setPage(id)}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────
function Loader() {
  return (
    <div className="loader-screen">
      <div className="spinner" />
      <p>Maresaka…</p>
    </div>
  );
}

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
function Login() {
  const [err, setErr] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      setErr('Erreur connexion: ' + e.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">🌿</div>
        <h1>Maresaka</h1>
        <p className="login-sub">Marketplace & Chat Gratuit</p>
        {err && <p className="error-msg">{err}</p>}
        <button className="btn-google" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.48 3.6 14.24l7.08 5.5C12.4 13.58 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.58C43.18 37.3 46.1 31.38 46.1 24.5z"/>
            <path fill="#FBBC05" d="M10.68 28.26A14.57 14.57 0 0 1 9.5 24c0-1.48.26-2.9.68-4.26l-7.08-5.5A22.97 22.97 0 0 0 1 24c0 3.77.9 7.33 2.6 10.5l7.08-6.24z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.58c-1.82 1.22-4.14 1.94-6.32 1.94-6.26 0-11.6-4.08-13.32-9.74l-7.08 6.24C7.07 42.52 14.82 47 24 47z"/>
          </svg>
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// HOME
// ─────────────────────────────────────────
function Home() {
  const posts = [
    { id: 1, user: 'Rakoto', text: 'Bonjour Maresaka! 🎉', time: 'Il y a 2 min' },
    { id: 2, user: 'Rabe',   text: 'Misy smartphone amidy, 150 000 Ar 📱', time: 'Il y a 5 min' },
    { id: 3, user: 'Soa',    text: 'Maniry hahalala ny marketplace!', time: 'Il y a 10 min' },
  ];

  return (
    <div className="page">
      <h2 className="page-title">🏠 Fil d'actualité</h2>
      {posts.map(p => (
        <div key={p.id} className="post-card">
          <div className="post-header">
            <div className="post-avatar">{p.user[0]}</div>
            <div>
              <strong>{p.user}</strong>
              <span className="post-time">{p.time}</span>
            </div>
          </div>
          <p className="post-text">{p.text}</p>
          <div className="post-actions">
            <button className="post-btn">👍 J'aime</button>
            <button className="post-btn">💬 Commenter</button>
            <button className="post-btn">↗️ Partager</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// MESSAGES (Realtime Firestore)
// ─────────────────────────────────────────
function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    // ✅ FIX #5 - unsubscribe listener
    const unsubscribe = onSnapshot(q, snapshot => {
      // ✅ FIX #2 - use doc.id as key
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const send = async () => {
    // ✅ FIX #3 - trim() + error handling
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: text.trim(),
        // ✅ FIX - fallback si displayName null
        user: user.displayName || user.email || 'Anonyme',
        uid: user.uid,
        createdAt: serverTimestamp(), // ✅ serverTimestamp > new Date()
      });
      setText('');
    } catch (e) {
      alert('Erreur envoi: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="page messages-page">
      <h2 className="page-title">💬 Messages</h2>
      <div className="msg-list">
        {messages.map((m) => (
          <div key={m.id} className={`msg-bubble ${m.uid === user.uid ? 'mine' : 'theirs'}`}>
            {m.uid !== user.uid && <span className="msg-user">{m.user}</span>}
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <div className="msg-input-row">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Écrire un message…"
          className="msg-input"
        />
        <button onClick={send} disabled={sending} className="btn-send">
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MARKETPLACE
// ─────────────────────────────────────────
function Marketplace() {
  const items = [
    { id: 1, title: 'Smartphone Samsung', price: '150 000 Ar', seller: 'Rakoto', emoji: '📱' },
    { id: 2, title: 'Vélo VTT',           price: '200 000 Ar', seller: 'Rabe',   emoji: '🚲' },
    { id: 3, title: 'Table en bois',       price: '80 000 Ar',  seller: 'Soa',    emoji: '🪑' },
    { id: 4, title: 'Livre scolaire',      price: '5 000 Ar',   seller: 'Hery',   emoji: '📚' },
  ];

  return (
    <div className="page">
      <h2 className="page-title">🛒 Marketplace</h2>
      <div className="market-grid">
        {items.map(item => (
          <div key={item.id} className="market-card">
            <div className="market-emoji">{item.emoji}</div>
            <h3>{item.title}</h3>
            <p className="market-price">{item.price}</p>
            <p className="market-seller">👤 {item.seller}</p>
            <button className="btn-contact">Contacter</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FRIENDS
// ─────────────────────────────────────────
function Friends() {
  const friends = [
    { id: 1, name: 'Rakoto Andriantsoa', status: 'En ligne' },
    { id: 2, name: 'Rabe Jean',          status: 'Hors ligne' },
    { id: 3, name: 'Soa Marie',          status: 'En ligne' },
  ];

  return (
    <div className="page">
      <h2 className="page-title">👥 Amis</h2>
      {friends.map(f => (
        <div key={f.id} className="friend-row">
          <div className="friend-avatar">{f.name[0]}</div>
          <div className="friend-info">
            <strong>{f.name}</strong>
            <span className={`status ${f.status === 'En ligne' ? 'online' : 'offline'}`}>
              {f.status}
            </span>
          </div>
          <button className="btn-msg">💬</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────
function Profile({ user }) {
  return (
    <div className="page profile-page">
      <h2 className="page-title">👤 Profil</h2>
      <div className="profile-card">
        {user.photoURL
          ? <img src={user.photoURL} alt="avatar" className="profile-photo" />
          : <div className="profile-initials">{(user.displayName || user.email || '?')[0]}</div>
        }
        {/* ✅ FIX - fallback displayName */}
        <h3>{user.displayName || 'Utilisateur'}</h3>
        <p>{user.email}</p>
        <div className="profile-stats">
          <div className="stat"><strong>0</strong><span>Posts</span></div>
          <div className="stat"><strong>0</strong><span>Amis</span></div>
          <div className="stat"><strong>0</strong><span>Ventes</span></div>
        </div>
        <button className="btn-logout-full" onClick={() => signOut(auth)}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
