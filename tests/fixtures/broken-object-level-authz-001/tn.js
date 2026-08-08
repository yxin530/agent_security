app.get('/items/:id', async (req, res) => {
  const item = await db.find({ id: req.params.id });
  if (item.userId !== req.user.id) throw new ForbiddenError();
  res.json(item);
});
