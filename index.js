const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middle wares ------------------- 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jl5j5.mongodb.net/?retryWrites=true&w=majority`;
const { json } = require('express');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_shh, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    });
}

async function run() {
    try {
        await client.connect();
        const billCollection = client.db("powerHack").collection("bills");
        const userCollection = client.db("powerHack").collection("user");

        app.get('/billing-list', verifyJWT, async (req, res) => {
            let query = {};
            const searched = req.query.search;
            const page = parseInt(req.query.page)
            const size = 10;
            if (searched) {
                const result = await billCollection.find({
                    "$or": [
                        { "fullName": { $regex: req.query.search } },
                        { "phone": { $regex: req.query.search } },
                        { "email": { $regex: req.query.search } }

                    ]
                }).sort({ _id: -1 }).skip(page * 10).limit(size).toArray()
                return res.send({ result })
            }
            else {
                const result = await billCollection.find({}).sort({ _id: -1 }).skip(page * 10).limit(size).toArray()
                return res.send({ result })
            }


        })
        app.get('/billingCount', async (req, res) => {
            const count = await billCollection.estimatedDocumentCount()
            res.send({ count })
        })



        app.post('/add-billing', verifyJWT, async (req, res) => {
            const billing = req.body;
            const result = await billCollection.insertOne(billing)
            res.send(result)
        })
        app.put('/update-billing/:id', verifyJWT, async (req, res) => {
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
        });

        app.post('/registration', async (req, res) => {
            const data = req.body;
            const email = data.email
            const userPass = data.password;
            const password = await bcrypt.hash(userPass, 10)
            const user = await userCollection.find({}).toArray();
            let isUser;
            user.forEach(us => {
                if (us.email === email) {

                    return isUser = true
                } else {
                    return isUser = false
                }
            })

            if (isUser) {
                console.log(isUser)
                res.send({ message: 'User already Registered' })
            } else {
                const newUser = { email, password }
                const result = await userCollection.insertOne(newUser)
                res.send(result)
            }
        })
        app.post('/login', async (req, res) => {
            const email = req.body.email;
            const password = req.body.password;
            const user = await userCollection.findOne({ email })
            if (!user) {
                return res.send({ message: 'user/password does not exist' })
            }
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ email: user.email }, process.env.JWT_shh,)
                if (token) {
                    return res.send({ message: 'ok done', token })
                } else {
                    return res.send({ message: 'user/password does not exist' })
                }

            }
            res.send({ message: 'user/password does not exist' });
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