import { useState } from 'react';

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Now this function talks directly to your Cloudflare Worker!
  const handleSummarize = async () => {
    if (!notes.trim()) {
      alert('Please paste some notes first!');
      return;
    }

    setLoading(true);
    setSummary('');
    setKeyPoints([]);

    try {
      // 1. Send your notes to the Cloudflare Worker on port 8787
      const response = await fetch('http://localhost:8787', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      // 2. Read the JSON reply coming back from the Worker
      const data = await response.json();

      // 3. Display the Worker's reply on your screen
      setSummary(data.summary);
      setKeyPoints(data.keyPoints);
    } catch (error) {
      alert('Could not reach the backend! Make sure your Cloudflare Worker is running.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>AI Notes Summarizer</h1>
      <p>Paste your lengthy notes below to get a simple summary and key points.</p>

      <textarea
        rows="8"
        placeholder="Paste your lengthy notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px' }}
      />

      <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSummarize}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Summarizing...' : 'Summarize Notes'}
        </button>

        <button
          onClick={() => { setNotes(''); setSummary(''); setKeyPoints([]); }}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      {summary && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Simple Summary</h2>
          <p>{summary}</p>

          <h3>Important Points</h3>
          <ul>
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;