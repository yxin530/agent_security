router.get('/users/:id', async (req, res) => {
  const u = await User.findById(req.params.id);
  res.json({ nric: u.nric });
});
