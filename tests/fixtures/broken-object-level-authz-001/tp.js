app.get('/items/:id', async (req, res) => {
  const item = await db.find({ id: req.params.id });
  res.json(item);
});
