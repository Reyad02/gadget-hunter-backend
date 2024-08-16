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
      const sortDate = req?.query?.sortDate
      const filterCategory = req?.query?.filterCategory;
      const filterBrand = req?.query?.filterBrand;
      const minPrice = req?.query?.minPrice ? parseFloat(req?.query?.minPrice) : null;
      const maxPrice = req?.query?.maxPrice ? parseFloat(req?.query?.maxPrice) : null;

      let sortOrder = {};
      let query = {};

      if (filterCategory !== "none") {
        query.category = filterCategory
      }
      if (filterBrand !== "none") {
        query.brandName = filterBrand
      }

      if (minPrice !== null && maxPrice !== null) {
        query.price = { $gte: minPrice, $lte: maxPrice };
      } else if (minPrice !== null) {
        query.price = { $gte: minPrice };
      } else if (maxPrice !== null) {
        query.price = { $lte: maxPrice };
      }

      if (sortPrice === "low") {
        sortOrder.price = 1;
      } else if (sortPrice === "high") {
        sortOrder.price = -1;
      }

      if (sortDate === "new") {
        sortOrder.creationDate = -1;
      } else if (sortDate === "old") {
        sortOrder.creationDate = 1;
      }

      const allGadgets = await gadgets.find(query).sort(sortOrder).skip((page - 1) * limit).limit(limit).toArray();
      res.send({ allGadgets, page, limit });
    })

    app.get('/allGadgets', async (req, res) => {
      const sortPrice = req?.query?.sortPrice;
      const sortDate = req?.query?.sortDate;
      // const filterCategory = req?.query?.filterCategory;

      let sortOrder = {};
      // let query = {};

      // if (filterCategory !== "none") {
      //   query.category = filterCategory
      // }

      if (sortPrice === "low") {
        sortOrder.price = 1;
      } else if (sortPrice === "high") {
        sortOrder.price = -1;
      }

      if (sortDate === "new") {
        sortOrder.creationDate = -1;
      } else if (sortDate === "old") {
        sortOrder.creationDate = 1;
      }

      const fullGadgetsSets = await gadgets.find().sort(sortOrder).toArray();
      res.send(fullGadgetsSets);

    });

    app.get('/category', async (req, res) => {
      try {
        const categories = await gadgets.aggregate([
          { $group: { _id: "$category" } }
        ]).toArray();

        // Transform the result to just an array of categories
        const categoryList = categories.map(cat => cat._id);

        res.send(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send({ error: 'An error occurred while fetching the categories.' });
      }
    });

    app.get('/brand', async (req, res) => {
      try {
        const brands = await gadgets.aggregate([
          { $group: { _id: "$brandName" } }
        ]).toArray();

        // Transform the result to just an array of categories
        const brandList = brands.map(brand => brand._id);

        res.send(brandList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send({ error: 'An error occurred while fetching the categories.' });
      }
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})