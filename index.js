const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const roomsCollection = client.db("hostelNestDB").collection("roomsDB");
    const userCollection = client.db("hostelNestDB").collection("userDB");
    const bookingCollection = client.db("hostelNestDB").collection("bookingDB");
    // rooms related api
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    // user related api
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.json(result);
    });
    // booking related api
    app.post("/booking", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.send(result);
    });

    app.patch("/userBooking/:id", async (req, res) => {
      const id = req.params.id;
      const { userId, room_id } = req.body;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid room ID" });
      }
      const query = { _id: new ObjectId(id), "seats.id": room_id };
      const options = { upsert: true };
      const update = {
        $set: {
          "seats.$.userID": userId,
          "seats.$.status": "booked",
        },
      };

      try {
        const result = await roomsCollection.updateOne(query, update, options);
        res.send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });
    ///...........
    app.get("/jahid", async (req, res) => {
      try {
        const booking = await bookingCollection
          .aggregate([
            {
              $addFields: {
                bookingId: {
                  $convert: { input: "$bookingId", to: "objectId" },
                },
                userId: { $convert: { input: "$userId", to: "objectId" } },
              },
            },
            {
              $lookup: {
                from: "roomsDB",
                localField: "bookingId",
                foreignField: "_id",
                as: "booking_info",
              },
            },
            { $unwind: "$booking_info" },
            {
              $addFields: {
                "booking_info.seats": {
                  $map: {
                    input: "$booking_info.seats",
                    as: "seat",
                    in: {
                      $cond: {
                        if: { $eq: ["$$seat.id", "$room_id"] },
                        then: {
                          $mergeObjects: ["$$seat", { userId: "$userId" }],
                        },
                        else: "$$seat",
                      },
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                booking_info: 1,
              },
            },
          ])
          .toArray();

        res.send(booking);
      } catch (error) {
        console.log(error);
        res.status(500).send("কিছু সমস্যা হয়েছে");
      }
    });

    // ....................

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
