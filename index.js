const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middle wares ------------------- 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jl5j5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
      await client.connect();
      const billCollection = client.db("powerHack").collection("bills");

      app.get('/billing-list', async (req, res) => {
          const query = {}
          const page = parseInt(req.query.page)
          const searched = req.query.searched
          const size = 10;
          const result = await billCollection.find(query).skip(page * 10).limit(size).toArray()
          res.send({ result })
      })
      app.get('/billingCount', async (req, res) => {
          const count = await billCollection.estimatedDocumentCount()
          res.send({ count })
      })

      app.post('/add-billing', async (req, res) => {
          const billing = req.body;
          const result = await billCollection.insertOne(billing)
          res.send(result)
      })
      app.put('/update-billing/:id', async (req, res) => {
          const id = req.params.id;
          const newBill = req.body;
          const filter = { _id: ObjectId(id) }
          const options = { upsert: true }
          const updateDoc = {
              $set: newBill
          };
          const result = await billCollection.updateOne(filter, updateDoc, options)
          res.send(result)
      })

      app.delete('/delete-billing/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) }
          const result = await billCollection.deleteOne(query);
          res.send(result);
      })
  } finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello From power hack')
})

app.listen(port, () => {
  console.log(`Power Hack listening on port ${port}`)
})