function login(req, res) {
  req.session.regenerate(() => {
    req.session.user = { id: 1 };
    res.send('ok');
  });
}