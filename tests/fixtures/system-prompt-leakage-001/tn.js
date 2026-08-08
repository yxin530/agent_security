app.get('/debug', (req, res) => {
  const systemPrompt = process.env.SYSTEM_PROMPT;
  res.json({ message: 'OK' });
});
