function login(req, res) {
  req.session.user = { id: 1 };
  res.send('ok');
}
