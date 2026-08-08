router.get('/dsar', async (req, res) => {
  const data = await User.findById(req.user.id);
  res.json(data);
});
