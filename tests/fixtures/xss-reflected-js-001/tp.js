app.get('/hello', (req, res) => {
  res.send(req.query.name);
});
