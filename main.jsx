console.log('main.js loaded');

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import Codex from './components/Codex.js';

const firebaseConfig = {
  apiKey: "AIzaSyDMCMuVIxVCs0x8cE-NIYtYpgGnt5Z6C04",
  authDomain: "codexprototype-36d5e.firebaseapp.com",
  projectId: "codexprototype-36d5e",
  storageBucket: "codexprototype-36d5e.firebasestorage.app",
  messagingSenderId: "1090750532986",
  appId: "1:1090750532986:web:7cc93a303c12e6a7121ac3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
console.log('Firebase initialized');

const Backend = {
  users: new Map(),
  init: () => {
    if (!Backend.users.size) {
      Backend.users.set('scribe1', { id: 'scribe1', password: 'scribe123', tier: 'scribe', data: {} });
      Backend.users.set('archivist1', { id: 'archivist1', password: 'arch123', tier: 'archivist', data: {} });
      Backend.users.set('artificer1', { id: 'artificer1', password: 'arti123', tier: 'artificer', data: {} });
      Backend.users.set('illuminator1', { id: 'illuminator1', password: 'illu123', tier: 'illuminator', data: {} });
      Backend.users.set('codexmaster1', { id: 'codexmaster1', password: 'master123', tier: 'codexmaster', data: {} });
    }
  },
  login: (id, password) => Backend.users.get(id)?.password === password ? Backend.users.get(id) : null,
  save: async (userId, key, data) => {
    const user = Backend.users.get(userId);
    if (user) {
      if (user.tier !== 'scribe') {
        try {
          const storageRef = ref(storage, `${userId}/${key}.json`);
          await uploadString(storageRef, JSON.stringify(data));
          console.log(`Saved ${key} for ${userId}`);
        } catch (e) {
          console.error(`Save failed for ${key}:`, e);
        }
      } else {
        user.data[key] = data;
        Backend.users.set(userId, user);
      }
    }
  },
  load: async (userId, key, defaultValue) => {
    const user = Backend.users.get(userId);
    if (user && user.tier !== 'scribe') {
      try {
        const storageRef = ref(storage, `${userId}/${key}.json`);
        const url = await getDownloadURL(storageRef);
        const res = await fetch(url);
        const text = await res.text();
        return text ? JSON.parse(text) : defaultValue;
      } catch (e) {
        console.log(`Load failed for ${key}, using default:`, e);
        return defaultValue;
      }
    }
    return user?.data[key] || defaultValue;
  },
  addUser: (id, password, tier) => {
    if (!Backend.users.has(id)) {
      Backend.users.set(id, { id, password, tier, data: {} });
      return true;
    }
    return false;
  }
};
Backend.init();

const Login = ({ setUser }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const attemptLogin = () => {
    const user = Backend.login(id, password);
    if (user) setUser(user);
    else setError('Invalid credentials');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') attemptLogin();
  };

  return (
    <div className="login animate-fade-in">
      <h1>Login to Codex</h1>
      <input value={id} onChange={e => setId(e.target.value)} onKeyPress={handleKeyPress} placeholder="User ID" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="Password" />
      <button onClick={attemptLogin}>Login</button>
      {error && <p className="error">{error}</p>}
      <p>Try: scribe1/scribe123, archivist1/arch123, etc.</p>
    </div>
  );
};

const AdminPanel = ({ user, setPage }) => {
  const [newId, setNewId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTier, setNewTier] = useState('scribe');
  const [message, setMessage] = useState('');

  const addNewUser = () => {
    if (Backend.addUser(newId, newPassword, newTier)) {
      setMessage(`User ${newId} added as ${newTier}`);
      setNewId('');
      setNewPassword('');
    } else {
      setMessage(`User ${newId} already exists`);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      {(user.tier === 'codexmaster' || user.tier === 'illuminator') && (
        <>
          <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="New User ID" />
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password" />
          <select value={newTier} onChange={e => setNewTier(e.target.value)}>
            <option value="scribe">Scribe</option>
            <option value="archivist">Archivist</option>
            <option value="artificer">Artificer</option>
            {user.tier === 'codexmaster' && <option value="illuminator">Illuminator</option>}
          </select>
          <button onClick={addNewUser}>Add User</button>
          {message && <p>{message}</p>}
        </>
      )}
      <button onClick={() => setPage('home')}>Back to Home</button>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).then(() => {
      console.log('Anonymous auth successful');
      setAuthReady(true);
    }).catch(e => {
      console.error('Auth failed:', e);
      setAuthReady(true);
    });
  }, []);

  const grokGenerate = (prompt) => {
    if (!aiEnabled || (user.tier !== 'artificer' && user.tier !== 'codexmaster')) return `${prompt} (AI Disabled)`;
    const responses = ['Epic tale!', 'Creative twist!', 'Medieval flair!'];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const restrictAccess = (tierRequirement) => {
    const tiers = ['scribe', 'archivist', 'artificer', 'illuminator', 'codexmaster'];
    return tiers.indexOf(user.tier) >= tiers.indexOf(tierRequirement);
  };

  const changeTier = (newTier) => {
    if (user) setUser({ ...user, tier: newTier });
  };

  const handleRestrictedClick = () => {
    if (user.tier === 'scribe') {
      setShowUpgradePopup(true);
      return true;
    }
    return false;
  };

  if (!authReady) return <div>Loading...</div>;

  return (
    <div className={`app ${theme}`}>
      {user && (
        <div style={{ position: 'fixed', top: '10px', left: '180px', zIndex: 1000 }}>
          <select value={user.tier} onChange={e => changeTier(e.target.value)}>
            <option value="scribe">Scribe</option>
            <option value="archivist">Archivist</option>
            <option value="artificer">Artificer</option>
            <option value="illuminator">Illuminator</option>
            <option value="codexmaster">Codex Master</option>
          </select>
        </div>
      )}
      {user ? (
        <>
          <aside id="sidebar" className={sidebarCollapsed ? 'collapsed' : ''}>
            <button id="toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '>' : '<'}
            </button>
            <button onClick={() => setPage('home')}>Home</button>
            <button onClick={() => setPage('codex')}>Codex</button>
            <button onClick={() => setPage('player')}>Character Hub</button>
            <button onClick={() => setPage('campaigns')}>Campaigns</button>
            <button onClick={() => setPage('dm')}>DM Screen</button>
            <button onClick={() => setPage('forums')}>Forums</button>
            <button onClick={() => setPage('streaming')}>Streaming</button>
            {(user.tier === 'codexmaster' || user.tier === 'illuminator') && (
              <button onClick={() => setPage('admin')}>Admin</button>
            )}
          </aside>
          <div id="profile-btn" className="profile-container">
            <img src="https://via.placeholder.com/50" alt="User Hub" className="profile-img animate-hover" onClick={() => setProfileOpen(!profileOpen)} />
            <span className={`tier-${user.tier}`}>{user.tier}</span>
            {profileOpen && (
              <div id="profile-dropdown" className="profile-dropdown">
                <button onClick={() => { setPage('profile'); setProfileOpen(false); }}>Profile</button>
                <button onClick={() => { setPage('account'); setProfileOpen(false); }}>Account</button>
                <button onClick={() => { setPage('settings'); setProfileOpen(false); }}>Settings</button>
                <button onClick={() => { setUser(null); setProfileOpen(false); }}>Logout</button>
              </div>
            )}
          </div>
          <main>
            {page === 'home' && <div className="home"><h2>Home</h2></div>}
            {page === 'codex' && <Codex user={user} grokGenerate={grokGenerate} onRestrictedClick={handleRestrictedClick} />}
            {page === 'player' && <div className="player-screen"><h2>Character Hub</h2></div>}
            {page === 'campaigns' && restrictAccess('archivist') && <div className="campaigns"><h2>Campaigns</h2></div>}
            {page === 'dm' && restrictAccess('archivist') && <div className="dm-screen"><h2>DM Screen</h2></div>}
            {page === 'forums' && <div className="forums"><h2>Forums</h2></div>}
            {page === 'streaming' && restrictAccess('archivist') && <div className="streaming"><h2>Streaming</h2></div>}
            {page === 'profile' && <div className="profile"><h2>Profile</h2><p>User: {user.id}</p><p>Tier: {user.tier}</p></div>}
            {page === 'account' && <div className="account"><h2>Account</h2><p>Manage subscription (TBD)</p></div>}
            {page === 'settings' && <div className="settings"><h2>Settings</h2><p>Theme: <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</button></p></div>}
            {page === 'admin' && <AdminPanel user={user} setPage={setPage} />}
            {showUpgradePopup && (
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', border: '2px solid #000', zIndex: 2000 }}>
                <p>Upgrade to unlock this feature!</p>
                <button onClick={() => setShowUpgradePopup(false)}>Close</button>
              </div>
            )}
          </main>
        </>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);