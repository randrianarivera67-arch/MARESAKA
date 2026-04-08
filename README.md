# 🌿 Maresaka - Marketplace & Chat Gratuit

Application React + Firebase — 100% Gratuit

---

## 🚀 Déploiement (GitHub + Render) - Étapes complètes

### ÉTAPE 1 — Créer le projet Firebase (gratuit)

1. Allez sur https://console.firebase.google.com
2. Cliquez **Créer un projet**
3. Activez **Authentication** → Sign-in method → **Google** ✅
4. Activez **Firestore Database** → Mode production → choisissez une région
5. Allez dans **Paramètres du projet** (⚙️) → **Vos applications** → Ajoutez une app Web
6. Copiez les valeurs `firebaseConfig`

### ÉTAPE 2 — Configurer les variables d'environnement localement

```bash
cp .env.example .env.local
# Éditez .env.local et collez vos valeurs Firebase
```

### ÉTAPE 3 — Tester en local

```bash
npm install
npm run dev
# Ouvrez http://localhost:5173
```

### ÉTAPE 4 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - Maresaka"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/maresaka.git
git push -u origin main
```

⚠️ **IMPORTANT**: Ne commitez JAMAIS le fichier `.env.local` !
Le `.gitignore` est déjà configuré pour l'ignorer.

### ÉTAPE 5 — Déployer sur Render (gratuit)

1. Allez sur https://render.com → Créez un compte gratuit
2. **New +** → **Static Site**
3. Connectez votre repo GitHub `maresaka`
4. Configurez:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Ajoutez les **Environment Variables** (même que `.env.example`):
   - `VITE_FIREBASE_API_KEY` = votre valeur
   - `VITE_FIREBASE_AUTH_DOMAIN` = votre valeur
   - *(répétez pour toutes les variables)*
6. Cliquez **Create Static Site**

✅ Render rebuild automatiquement à chaque `git push` !

---

### ÉTAPE 6 — Configurer Firebase Auth domain

Dans Firebase Console → Authentication → Settings → **Authorized domains**:
Ajoutez votre URL Render (ex: `maresaka.onrender.com`)

### ÉTAPE 7 — Appliquer les règles Firestore

Dans Firebase Console → Firestore → **Rules**:
Copiez le contenu de `firestore.rules` et publiez.

---

## 📁 Structure du projet

```
maresaka/
├── src/
│   ├── App.jsx          # Composant principal + toutes les pages
│   ├── firebase.js      # Configuration Firebase
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── firestore.rules      # Règles sécurité Firestore
├── .env.example         # Template variables d'env
├── .gitignore           # ⚠️ .env.local est ignoré
└── README.md
```

## 🐛 Bugs corrigés

| # | Bug | Fix appliqué |
|---|-----|--------------|
| 1 | Memory leak `onAuthStateChanged` | Unsubscribe dans cleanup |
| 2 | `key={index}` dans messages | Utilise `doc.id` Firestore |
| 3 | Pas de `trim()` sur input | `text.trim()` + error handling |
| 4 | Tailwind CDN (ne marche pas en prod) | CSS custom à la place |
| 5 | Memory leak `onSnapshot` | Unsubscribe dans cleanup |
| 6 | `new Date()` au lieu de `serverTimestamp()` | `serverTimestamp()` Firestore |
| 7 | `displayName` peut être null | Fallback `user.email` |
| 8 | Firebase config hardcodée | Variables `.env` via Vite |

## 💰 Coût total: 0 Ar

- Firebase Free Tier: 1GB storage, 50K reads/jour, 20K writes/jour
- Render Static Site: Gratuit
- GitHub: Gratuit
