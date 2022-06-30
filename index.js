const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares ------------------- 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello From power hack')
})

app.listen(port, () => {
  console.log(`Power Hack listening on port ${port}`)
})