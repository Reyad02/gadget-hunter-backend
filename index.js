const express = require('express')
const app = express()
const port = 3000
require('dotenv').config();
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(express.json());
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.dr6rgwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const database = client.db("gadget-hunter");
    const gadgets = database.collection("gadgets");

    app.get('/gadgets', async (req, res) => {
      const page = parseInt(req?.query?.page)
      const limit = parseInt(req?.query?.limit)
      const sortPrice = req?.query?.sortPrice
      const sortDate = req?.query?.sortDate /// new, old

      let sortOrder = {};

      if (sortPrice === "low") {
        sortOrder.price = 1;  // Ascending order
      } else if (sortPrice === "high") {
        sortOrder.price = -1; // Descending order
      }

      if (sortDate === "new") {
        sortOrder.creationDate = -1;  // Newest first (descending order)
      } else if (sortDate === "old") {
        sortOrder.creationDate = 1;   // Oldest first (ascending order)
      }

      const allGadgets = await gadgets.find().sort(sortOrder).skip((page - 1) * limit).limit(limit).toArray();
      res.send({ allGadgets, page, limit });
    })

    // app.get('/allGadgets', async (req, res) => {
    //   const sortPrice = req?.query?.sortPrice
    //   const sortDate = req?.query?.sortDate /// new, old
    //   // console.log("sortPrice", sortPrice);
    //   let fullGadgetsSets;
    //   if (sortPrice === "low") {
    //     fullGadgetsSets = await gadgets.find().sort({ "price": 1 }).toArray();
    //   }
    //   else if (sortPrice === "high") {
    //     fullGadgetsSets = await gadgets.find().sort({ "price": -1 }).toArray();
    //   }
    //   // if (sortCreationDate === "newest") {
    //   //   sortOrder.creationDate = -1;  // Newest first (descending order)
    //   // } else if (sortCreationDate === "oldest") {
    //   //   sortOrder.creationDate = 1;   // Oldest first (ascending order)
    //   // }
    //   else {
    //     fullGadgetsSets = await gadgets.find().toArray();
    //   }
    //   res.send(fullGadgetsSets);
    // })

    app.get('/allGadgets', async (req, res) => {
      const sortPrice = req?.query?.sortPrice;
      const sortDate = req?.query?.sortDate; // "new" or "old"

      let sortOrder = {};

      if (sortPrice === "low") {
        sortOrder.price = 1;  // Ascending order
      } else if (sortPrice === "high") {
        sortOrder.price = -1; // Descending order
      }

      // Handle sorting by creation date
      if (sortDate === "new") {
        sortOrder.creationDate = -1;  // Newest first (descending order)
      } else if (sortDate === "old") {
        sortOrder.creationDate = 1;   // Oldest first (ascending order)
      }

      // If no sorting criteria is provided, set sortOrder to an empty object (no sorting)
      // if (!sortPrice && !sortDate) {
      //   sortOrder = {};
      // }

      // try {
      const fullGadgetsSets = await gadgets.find().sort(sortOrder).toArray();
      res.send(fullGadgetsSets);
      // } catch (error) {
      //   res.status(500).send({ error: 'An error occurred while fetching the gadgets.' });
      // }
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})