import { useState } from 'react';

function App() {
  // 1. Memory boxes (State) to store what the user types and what the AI returns
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. What happens when the user clicks "Summarize Notes"
  const handleSummarize = () => {
    if (!notes.trim()) {
      alert('Please paste some notes first!');
      return;
    }

    setLoading(true);

    // Fake test result for Hour 2 (We will connect real Gemini AI in Hour 4!)
    setTimeout(() => {
      setSummary('This is a simple English summary of your pasted notes.');
      setKeyPoints([
        'First important point from your notes',
        'Second important point from your notes',
        'Third important point from your notes',
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>AI Notes Summarizer</h1>
      <p>Paste your lengthy notes below to get a simple summary and key points.</p>

      {/* Big Input Box */}
      <textarea
        rows="8"
        placeholder="Paste your lengthy notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px' }}
      />

      {/* Action Buttons */}
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

      {/* Result Section (Only shows up once a summary exists) */}
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