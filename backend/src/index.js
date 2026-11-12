export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Send a POST request with your notes.', {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      if (!env.GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            summary: 'API Key is missing!',
            keyPoints: ['Make sure .dev.vars is inside the backend folder and restart npm run dev.'],
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await request.json();
      const notes = body.notes || '';
      const apiKey = env.GEMINI_API_KEY.trim();

      // 1. Ask Google which models are enabled on your key right now
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const listData = await listRes.json();

      // Filter only Flash models that support generateContent
      const flashModels = (listData.models || [])
        .filter(
          (m) =>
            m.name.includes('flash') &&
            m.supportedGenerationMethods?.includes('generateContent')
        )
        .map((m) => m.name); // e.g., "models/gemini-3.8-flash"

      const prompt = `Read the following notes and convert them into:
1. A short, simple English summary (2-3 sentences).
2. A list of 3 to 5 important bullet points in simple English.

Return ONLY valid JSON in this exact format:
{
  "summary": "Your simple summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}

Notes:
${notes}`;

      // 2. Try each available Flash model automatically until one succeeds
      let lastError = 'No Flash models found on this API key.';
      for (const modelFullName of flashModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelFullName}:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        const geminiData = await geminiResponse.json();

        if (geminiResponse.ok) {
          const rawText = geminiData.candidates[0].content.parts[0].text;
          const parsedResult = JSON.parse(rawText);
          return new Response(JSON.stringify(parsedResult), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        lastError = `${modelFullName}: ${geminiData.error?.message || 'Failed'}`;
      }

      // If all models were busy, show why
      return new Response(
        JSON.stringify({
          summary: 'All available Gemini models are temporarily busy or unavailable:',
          keyPoints: [lastError],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          summary: 'Oops! Something went wrong.',
          keyPoints: [error.message],
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};