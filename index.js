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


async function run(){
try{
    await client.connect();
    console.log('Database Connected')
}
finally{

}
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From power hack')
})

app.listen(port, () => {
  console.log(`Power Hack listening on port ${port}`)
})