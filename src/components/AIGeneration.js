const AIGeneration = ({ section, update }) => {
  const [prompt, setPrompt] = React.useState('');

  const generateContent = async () => {
    try {
      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, section })
      });
      const data = await response.json();
      update(section, data.content);
    } catch (e) {
      console.error('AI generation failed:', e);
    }
  };

  return (
    <div className="ai-generation">
      <input
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={`Generate ${section}...`}
      />
      <button onClick={generateContent}>Generate</button>
    </div>
  );
};