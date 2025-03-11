const Codex = ({ user, grokGenerate, onRestrictedClick }) => {
  const [codexes, setCodexes] = React.useState([]);
  const [selectedCodex, setSelectedCodex] = React.useState(null);
  const [section, setSection] = React.useState('Lore');
  const [content, setContent] = React.useState('');
  const [bookOpen, setBookOpen] = React.useState(false);
  const canvasRef = React.useRef(null);
  const [zoom, setZoom] = React.useState(1);
  const [canvasActive, setCanvasActive] = React.useState(false);

  React.useEffect(() => {
    Backend.load(user.id, 'codexes', []).then(data => {
      setCodexes(Array.isArray(data) ? data : []);
    });
  }, [user.id]);

  React.useEffect(() => {
    if (user.tier !== 'scribe') {
      Backend.save(user.id, 'codexes', codexes);
    }
    if (section === 'Maps' && selectedCodex && canvasRef.current && canvasActive) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 600, 400);
      ctx.fillStyle = '#e0d0a0';
      ctx.fillRect(0, 0, 600, 400);
      const gridSize = 30 * zoom;
      for (let x = 0; x < 600; x += gridSize) for (let y = 0; y < 400; y += gridSize) ctx.strokeRect(x, y, gridSize, gridSize);
      selectedCodex.sections.Maps.forEach(t => {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(t.x * zoom + gridSize / 2, t.y * zoom + gridSize / 2, 10 * zoom, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [codexes, section, zoom, canvasActive, user.id]);

  const createCodex = () => {
    if (onRestrictedClick && onRestrictedClick()) return;
    const newCodex = { 
      id: Date.now(), 
      name: `Codex ${codexes.length + 1}`, 
      sections: { 
        Settings: { campaign: 'D&D 5e', rules: 'D&D', ai: 'Strict' },
        Lore: '', Secrets: [], Buildings: [], Characters: [], Conditions: [], Documents: [], Ethnicities: [],
        Geographic: [], Generic: [], Items: [], Laws: [], Languages: [], Conflicts: [], Formations: [],
        Myths: [], Organizations: [], Professions: [], Prose: [], Ranks: [], Session: [], Settlements: [],
        Species: [], Spells: [], Plots: [], Tech: [], Traditions: [], Vehicles: [], Timeline: [], Relations: [], Maps: []
      } 
    };
    setCodexes([...codexes, newCodex]);
  };

  const deleteCodex = (id) => {
    if (onRestrictedClick && onRestrictedClick()) return;
    setCodexes(prev => prev.filter(c => c.id !== id));
    if (selectedCodex && selectedCodex.id === id) {
      setSelectedCodex(null);
      setBookOpen(false);
      setContent('');
    }
  };

  return React.createElement(
    'div',
    { className: 'codex' },
    React.createElement('h2', null, 'Codex'),
    !selectedCodex && [
      React.createElement(
        'div',
        { className: 'codex-form' },
        React.createElement('input', { value: content, onChange: e => setContent(e.target.value), placeholder: 'New Codex Name' }),
        React.createElement('button', { onClick: createCodex }, 'Create Codex')
      ),
      React.createElement(
        'div',
        { className: 'codex-list' },
        codexes.map(c => React.createElement(
          'div',
          { key: c.id, onClick: () => { setSelectedCodex(c); setContent(c.sections[section] || ''); setBookOpen(true); setCanvasActive(true); }, className: 'codex-cover animate-hover' },
          React.createElement('h3', null, c.name)
        ))
      )
    ],
    selectedCodex && React.createElement(
      'div',
      { className: `codex-book ${bookOpen ? 'open' : ''}` },
      React.createElement(
        'div',
        { className: 'book-cover', onClick: () => { setBookOpen(!bookOpen); if (!bookOpen) setCanvasActive(true); else setCanvasActive(false); } },
        React.createElement('h3', null, selectedCodex.name)
      ),
      bookOpen && React.createElement(
        'div',
        { className: 'book-content' },
        React.createElement('button', { onClick: () => deleteCodex(selectedCodex.id) }, 'Delete Codex')
      )
    )
  );
};
