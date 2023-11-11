const express = require('express');
const { MongoClient, ServerApiVersion, MongoAWSError, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.imeoc20.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db('careerCenterDB').collection('user');
        const jobsCollection = client.db('careerCenterDB').collection('jobs');
        const myBids = client.db('careerCenterDB').collection('bids');
        const googleUserCollection = client.db('careerCenterDB').collection('googleUser');


        app.patch('/jobs/:id', async (req, res) => {
            const jobId = req.params.id;
            const updatedJob = req.body;

            if (!ObjectId.isValid(jobId)) {
                console.error('Invalid ObjectId:', jobId);
                return res.status(400).send('Invalid ObjectId');
            }

            try {
                const result = await jobsCollection.updateOne({ _id: new ObjectId(jobId) }, { $set: updatedJob });
                res.send(result);
            } catch (error) {
                console.error('Error updating job:', error);
                res.status(500).send('Internal Server Error');
            }
        });


        app.get('/myJobs', async (req, res) => {
            const userEmail = req.query.email;
            try {
                const result = await jobsCollection.find({ email: userEmail }).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching user jobs:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get('/jobs/:id', async (req, res) => {
            const jobId = req.params.id;
            const objectId = new ObjectId(jobId);
            const result = await jobsCollection.findOne({ _id: objectId });
            res.send(result);
        })

        app.delete('/jobs/:id', async (req, res) => {
            const jobId = req.params.id;
            // console.log(jobId);
            try {
                const result = await jobsCollection.deleteOne({ _id: new ObjectId(jobId) });
                res.send(result);
            } catch (error) {
                console.error('Error deleting job:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post("/myBids", async (req, res) => {
            const data = req.body;
            const result = myBids.insertOne(data);
            res.send(result);
        });

        app.get("/myBids", async (req, res) => {
            const result = await myBids.find().toArray();
            res.send(result);
        })
        app.post('/jobs', async (req, res) => {
            const job = req.body;
            console.log(job);
            const result = await jobsCollection.insertOne(job);
            res.send(result);
        })
        app.get('/category/:id', async (req, res) => {
            const path = req.params.id;
            const result = await jobsCollection.find({ category: path }).toArray();
            res.send(result.reverse());
        })

        app.get('/jobs/:id', async (req, res) => {
            const path = req.params.id;
            const objectId = new ObjectId(path);
            const result = await jobsCollection.findOne({ _id: objectId });
            res.send(result);
        })

        app.get('/jobs', async (req, res) => {
            try {
                const cursor = jobsCollection.find();
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                res.status(500).send('Internal Server Error');
            }

        });


        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const job = await cursor.toArray();
            res.send(job);
        });

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.post('/googleUser', async (req, res) => {
            const googleUser = req.body;
            console.log(googleUser);
            const result = await googleUserCollection.insertOne(googleUser);
            res.send(result);
        });

        app.get('/googleUser', async (req, res) => {
            const cursor = googleUserCollection.find();
            const googleUser = await cursor.toArray();
            res.send(googleUser);
        });

        app.get('/user', async (req, res) => {
            const cursor = userCollection.find();
            const user = await cursor.toArray();
            res.send(user);
        });

        app.patch('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('career center server is running')
});

app.listen(port, () => {
    console.log(`server is running on PORT: ${port}`)
});