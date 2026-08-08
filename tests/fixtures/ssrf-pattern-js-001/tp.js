app.get('/proxy', async (req, res) => {
  const result = await fetch(req.query.url);
  res.send(await result.text());
});
