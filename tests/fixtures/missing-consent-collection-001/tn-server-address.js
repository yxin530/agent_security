const express = require('express');
const app = express();
const server = app.listen(3000, () => {
  const addr = server.address();
  console.log(`Server listening on ${typeof addr === 'string' ? addr : addr.port}`);
});
