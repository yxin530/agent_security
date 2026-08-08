router.post('/register', (req, res) => {
  User.create(req.body);
  res.json({ privacyPolicyUrl: '/privacy' });
});
