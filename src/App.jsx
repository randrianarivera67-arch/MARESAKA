import { useState, useEffect, useRef } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, setDoc, getDoc, where } from "firebase/firestore";

function Loader() {
  return <div className="loader-screen"><div className="spinner"/><p>Maresaka…</p></div>;
}

function Login() {
  const [err, setErr] = useState("");
  const handle = async () => {
    try { await signInWithPopup(auth, provider); }
    catch(e) { setErr("Erreur connexion: " + e.message); }
  };
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">🌿</div>
        <h1>Maresaka</h1>
        <p className="login-sub">Marketplace & Chat Gratuit</p>
        {err && <p className="error-msg">{err}</p>}
        <button className="btn-google" onClick={handle}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.48 3.6 14.24l7.08 5.5C12.42 13.58 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.58C43.18 37.3 46.1 31.38 46.1 24.5z"/><path fill="#FBBC05" d="M10.68 28.26A14.57 14.57 0 0 1 9.5 24c0-1.48.26-2.9.68-4.26L3.1 14.24A23.97 23.97 0 0 0 0 24c0 3.77.9 7.33 2.6 10.51l7.08-6.25z"/><path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.08-5.5C18-5.58c-1.82 1.22-4.14 1.94-6.26 0-11.6-4.08-13.32-9.74l-7.08 6.24C7.07 42.52 14.82 47 24 47z"/></svg>
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
}

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [text, setText] = useState("");
  const [postType, setPostType] = useState("post");
  const [imgPreview, setImgPreview] = useState(null);
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [lieu, setLieu] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStories(all.filter(p => p.type === "story"));
      setPosts(all.filter(p => p.type !== "story"));
    });
  }, []);

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!text.trim() && !imgPreview) return;
    setSending(true);
    try {
      await addDoc(collection(db, "posts"), {
        uid: user.uid, user: user.displayName || user.email,
        photoURL: user.photoURL || "", text: text.trim(),
        image: imgPreview || "", type: postType,
        price: price.trim(), contact: contact.trim(), lieu: lieu.trim(),
        createdAt: serverTimestamp(),
      });
      setText(""); setImgPreview(null); setPrice(""); setContact(""); setLieu("");
    } catch(e) { alert("Erreur: " + e.message); }
    setSending(false);
  };

  return (
    <div className="page">
      <div className="story-bar">
        <div className="story-item story-add">
          <div className="story-circle add-circle">+</div>
          <span>Ma story</span>
        </div>
        {stories.map(s => (
          <div key={s.id} className="story-item">
            <div className="story-circle">
              {s.photoURL ? <img src={s.photoURL} alt=""/> : s.user?.[0]}
            </div>
            <span>{s.user?.split(" ")[0]}</span>
          </div>
        ))}
      </div>

      <div className="post-input-card">
        <div className="post-type-tabs">
          {[["post","📝 Post"],["story","🔵 Story"],["vente","🛒 Vente"]].map(([id,label]) => (
            <button key={id} className={`type-tab ${postType===id?"active":""}`} onClick={() => setPostType(id)}>{label}</button>
          ))}
        </div>
        <div className="post-input-row">
          <div className="post-avatar-sm">
            {user.photoURL ? <img src={user.photoURL} alt=""/> : user.displayName?.[0]}
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={postType==="story"?"Écrivez votre story…":postType==="vente"?"Description du produit…":"Quoi de neuf?"}
            className="post-textarea" rows={2}/>
        </div>
        {postType === "vente" && (
          <div className="vente-fields">
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="💰 Prix (ex: 50 000 Ar)" className="vente-input"/>
            <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="📞 Contact" className="vente-input"/>
            <input value={lieu} onChange={e=>setLieu(e.target.value)} placeholder="📍 Lieu" className="vente-input"/>
          </div>
        )}
        {imgPreview && (
          <div className="img-preview-wrap">
            <img src={imgPreview} alt="preview" className="img-preview"/>
            <button onClick={() => setImgPreview(null)} className="remove-img">✕</button>
          </div>
        )}
        <div className="post-actions-row">
          <label className="attach-btn">📷 Photo/Vidéo
            <input type="file" accept="image/*,video/*" onChange={handleImg} style={{display:"none"}}/>
          </label>
          <button onClick={submit} disabled={sending} className="btn-post">{sending?"…":"Publier"}</button>
        </div>
      </div>

      {posts.map(p => (
        <div key={p.id} className={`post-card${p.type==="vente"?" post-vente":""}`}>
          <div className="post-header">
            <div className="post-avatar-sm">
              {p.photoURL ? <img src={p.photoURL} alt=""/> : p.user?.[0]}
            </div>
            <div>
              <strong>{p.user}</strong>
              {p.type==="vente" && <span className="badge-vente">Vente</span>}
            </div>
          </div>
          {p.text && <p className="post-text">{p.text}</p>}
          {p.image && <img src={p.image} alt="" className="post-img"/>}
          {p.type==="vente" && (
            <div className="vente-info">
              {p.price && <span>💰 {p.price}</span>}
              {p.contact && <span>📞 {p.contact}</span>}
              {p.lieu && <span>📍 {p.lieu}</span>}
            </div>
          )}
          <div className="post-footer">
            <button className="post-btn">👍 J'aime</button>
            <button className="post-btn">💬 Commenter</button>
            <button className="post-btn">↗️ Partager</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Video() {
  return (
    <div className="page">
      <h2 className="page-title">🎬 Vidéos</h2>
      <div className="video-card">
        <div className="video-placeholder">▶️<p>Vidéos bientôt disponibles</p></div>
      </div>
    </div>
  );
}

function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setDoc(doc(db, "users", user.uid), {
      uid: user.uid, displayName: user.displayName||user.email,
      photoURL: user.photoURL||"", online: true, lastSeen: serverTimestamp(),
    }, { merge: true });
    const q = query(collection(db, "users"), where("online","==",true));
    return onSnapshot(q, snap => setOnlineUsers(snap.docs.map(d=>d.data()).filter(u=>u.uid!==user.uid)));
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    return onSnapshot(q, snap => {
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()})));
      setTimeout(() => bottomRef.current?.scrollIntoView({behavior:"smooth"}), 100);
    });
  }, []);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(), user: user.displayName||user.email,
        uid: user.uid, photoURL: user.photoURL||"", createdAt: serverTimestamp(),
      });
      setText("");
    } catch(e) { alert("Erreur: " + e.message); }
    setSending(false);
  };

  return (
    <div className="page messages-page">
      <div className="online-bar">
        <span className="online-title">🟢 En ligne</span>
        <div className="online-scroll">
          {onlineUsers.length===0
            ? <span className="no-online">Personne en ligne</span>
            : onlineUsers.map(u => (
              <div key={u.uid} className="online-user">
                <div className="online-avatar-wrap">
                  {u.photoURL ? <img src={u.photoURL} alt=""/> : <div className="online-init">{u.displayName?.[0]}</div>}
                  <span className="online-dot"/>
                </div>
                <span>{u.displayName?.split(" ")[0]}</span>
              </div>
            ))
          }
        </div>
      </div>
      <div className="msg-list">
        {messages.map(m => (
          <div key={m.id} className={`msg-bubble ${m.uid===user.uid?"mine":"theirs"}`}>
            {m.uid!==user.uid && <span className="msg-user">{m.user}</span>}
            <p>{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div className="msg-input-row">
        <input value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Écrire un message…" className="msg-input"/>
        <button onClick={send} disabled={sending} className="btn-send">{sending?"…":"➤"}</button>
      </div>
    </div>
  );
}

function Friends({ user }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), snap => {
      setSuggestions(snap.docs.map(d=>d.data()).filter(u=>u.uid!==user.uid));
    });
  }, [user]);

  const doSearch = () => {
    if (!search.trim()) return;
    setResults(suggestions.filter(u =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ));
  };

  return (
    <div className="page">
      <h2 className="page-title">👥 Amis</h2>
      <div className="search-bar">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&doSearch()}
          placeholder="🔍 Retrouver des amis…" className="search-input"/>
        <button onClick={doSearch} className="btn-search">Chercher</button>
      </div>
      {results.length > 0 && (
        <div className="friends-section">
          <h3>Résultats</h3>
          {results.map(u => (
            <div key={u.uid} className="friend-row">
              <div className="friend-avatar">{u.photoURL?<img src={u.photoURL} alt=""/>:u.displayName?.[0]}</div>
              <div className="friend-info"><strong>{u.displayName||u.email}</strong></div>
              <button className="btn-add">+ Ajouter</button>
            </div>
          ))}
        </div>
      )}
      <div className="friends-section">
        <h3>💡 Suggestions d'amis</h3>
        {suggestions.slice(0,5).map(u => (
          <div key={u.uid} className="friend-row">
            <div className="friend-avatar">{u.photoURL?<img src={u.photoURL} alt=""/>:u.displayName?.[0]}</div>
            <div className="friend-info"><strong>{u.displayName||u.email}</strong></div>
            <button className="btn-add">+ Ajouter</button>
          </div>
        ))}
        {suggestions.length===0 && <p className="empty-msg">Aucune suggestion pour l'instant</p>}
      </div>
    </div>
  );
}

function Profile({ user }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.displayName||"");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(user.photoURL||"");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db,"users",user.uid)).then(d => { if(d.exists()) setBio(d.data().bio||""); });
  }, [user]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name, });
      await setDoc(doc(db,"users",user.uid), {
        uid: user.uid, displayName: name, email: user.email, photoURL: photo, bio, online: true,
      }, { merge: true });
      setEditing(false);
    } catch(e) { alert("Erreur: "+e.message); }
    setSaving(false);
  };

  return (
    <div className="page profile-page">
      <h2 className="page-title">👤 Profil</h2>
      <div className="profile-card">
        <div className="profile-photo-wrap">
          {photo ? <img src={photo} alt="avatar" className="profile-photo"/> : <div className="profile-initials">{user.displayName?.[0]||"?"}</div>}
          {editing && (
            <label className="change-photo-btn">📷
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
          )}
        </div>
        {editing ? (
          <div className="profile-edit">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom" className="edit-input"/>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio…" className="edit-bio" rows={3}/>
            <div className="edit-btns">
              <button onClick={save} disabled={saving} className="btn-save">{saving?"…":"✅ Enregistrer"}</button>
              <button onClick={()=>setEditing(false)} className="btn-cancel">Annuler</button>
            </div>
          </div>
        ) : (
          <>
            <h3>{user.displayName||"Utilisateur"}</h3>
            <p className="profile-email">{user.email}</p>
            {bio && <p className="profile-bio">{bio}</p>}
            <button onClick={()=>setEditing(true)} className="btn-edit-profile">✏️ Modifier le profil</button>
          </>
        )}
        <div className="profile-stats">
          <div className="stat"><strong>0</strong><span>Posts</span></div>
          <div className="stat"><strong>0</strong><span>Amis</span></div>
          <div className="stat"><strong>0</strong><span>Ventes</span></div>
        </div>
        <button className="btn-logout-full" onClick={()=>signOut(auth)}>Se déconnecter</button>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <div className="page">
      <h2 className="page-title">⚙️ Paramètres de compte</h2>
      <div className="settings-list">
        <div className="setting-item"><span>🔔 Notifications</span><input type="checkbox" defaultChecked/></div>
        <div className="setting-item"><span>🌙 Mode sombre</span><input type="checkbox"/></div>
        <div className="setting-item"><span>🔒 Confidentialité</span><span>›</span></div>
        <div className="setting-item"><span>📱 À propos</span><span>v1.0</span></div>
        <button className="btn-logout-full" onClick={()=>signOut(auth)}>🚪 Se déconnecter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
      if (u) {
        setDoc(doc(db,"users",u.uid), {
          uid: u.uid, displayName: u.displayName||u.email,
          email: u.email, photoURL: u.photoURL||"",
          online: true, lastSeen: serverTimestamp(),
        }, { merge: true });
      }
    });
  }, []);

  if (loading) return <Loader/>;
  if (!user) return <Login/>;

  const navItems = [
    {id:"home",icon:"🏠",label:"Accueil"},
    {id:"video",icon:"🎬",label:"Vidéo"},
    {id:"messages",icon:"💬",label:"Messages"},
    {id:"friends",icon:"👥",label:"Amis"},
    {id:"profile",icon:"👤",label:"Profil"},
  ];

  const menuItems = [...navItems, {id:"settings",icon:"⚙️",label:"Paramètres de compte"}];

  const navigate = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <div className="app-shell">
      {menuOpen && <div className="menu-overlay" onClick={()=>setMenuOpen(false)}/>}
      <div className={`sidebar ${menuOpen?"open":""}`}>
        <div className="sidebar-header">
          {user.photoURL ? <img src={user.photoURL} alt="" className="sidebar-avatar"/> : <div className="sidebar-initials">{user.displayName?.[0]}</div>}
          <div><strong>{user.displayName}</strong><p>{user.email}</p></div>
        </div>
        {menuItems.map(item => (
          <button key={item.id} className={`sidebar-item ${page===item.id?"active":""}`} onClick={()=>navigate(item.id)}>
            {item.icon} {item.label}
          </button>
        ))}
        <button className="sidebar-item sidebar-logout" onClick={()=>signOut(auth)}>🚪 Se déconnecter</button>
      </div>

      <header className="topbar">
        <button className="hamburger" onClick={()=>setMenuOpen(!menuOpen)}>
          <span/><span/><span/>
        </button>
        <span className="logo">🌿 Maresaka</span>
        {user.photoURL && <img src={user.photoURL} alt="" className="avatar"/>}
      </header>

      <main className="content">
        {page==="home"     && <Home user={user}/>}
        {page==="video"    && <Video/>}
        {page==="messages" && <Messages user={user}/>}
        {page==="friends"  && <Friends user={user}/>}
        {page==="profile"  && <Profile user={user}/>}
        {page==="settings" && <Settings/>}
      </main>

      <nav className="bottomnav">
        {navItems.map(({id,icon,label}) => (
          <button key={id} className={`nav-btn ${page===id?"active":""}`} onClick={()=>setPage(id)}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
