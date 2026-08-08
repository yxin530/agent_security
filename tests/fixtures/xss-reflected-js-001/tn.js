app.get('/hello', (req, res) => {
  res.send(validator.escape(req.query.name));
});
