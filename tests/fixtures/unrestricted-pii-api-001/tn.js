router.get('/users/:id', async (req, res) => {
  if (req.user.id !== req.params.id) throw new ForbiddenError();
  const u = await User.findById(req.params.id);
  res.json({ nric: u.nric });
});
