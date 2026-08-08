router.get('/profile', async (req, res) => {
  const u = await User.findById(req.user.id);
  res.json(u);
});
