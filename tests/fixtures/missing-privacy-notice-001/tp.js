router.post('/register', (req, res) => {
  User.create(req.body);
  res.send('OK');
});
