app.post('/chat', async (req, res) => {
  const reply = await openai.chat.completions.create({ messages: [] });
  res.send(sanitizeHtml(reply.choices[0].message.content));
});
