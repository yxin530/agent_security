app.get('/proxy', async (req, res) => {
  if (!allowedHosts.includes(req.query.hostname)) throw new Error();
  const result = await fetch(req.query.url);
  res.send(await result.text());
});
