const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port= process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.g8zp6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const roomsCollection=client.db('hostelNestDB').collection('roomsDB')
    const userCollection=client.db('hostelNestDB').collection('userDB')
    const bookingCollection=client.db('hostelNestDB').collection('bookingDB')

// user related api
    app.post('/user',async(req,res)=>{
      const user =req.body
      const result=await userCollection.insertOne(user)
      res.send(result)
    })
    app.get('/user',async(req,res)=>{
      const result=await userCollection.find().toArray()
      res.send(result)
    })
// booking related api
    app.post('/booking',async(req,res)=>{
      const bookingData=req.body
      const result=await bookingCollection.insertOne(bookingData)
      res.send(result)

    })

    app.get('/booking',async(req,res)=>{
      const result=await bookingCollection.find().toArray()
      res.send(result)
    })



    
    // await client.connect();
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello, Express and MongoDB server!");
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
