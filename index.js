const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())


//MongoDB connection
const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Pass}@cluster0.caivj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//const uri = "mongodb://localhost:27017";
console.log(uri);

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
    // For coffee
    const database = client.db("coffeeDB");
    const dataCollection = database.collection("coffee");
    //For user signup & signin
    const userCollection = database.collection("user");

    //GET
    app.get('/coffee',async(req,res)=>{
      const cursor = dataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //GET for single document
    app.get('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await dataCollection.findOne(query);
      res.send(result);
    })

    //POST 
    app.post('/coffee',async(req,res)=>{
      const newCoffee = req.body;
      console.log('new coffee',newCoffee);
      const result = await dataCollection.insertOne(newCoffee);
      res.send(result);
    }) 
   
    //PUT 
    app.put('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      const updateCoffee = req.body;
      console.log('updateCoffee & id',updateCoffee,id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {

        $set: {
        coffeeName : updateCoffee.name,
        Quantity: updateCoffee.quantity,
        supplier: updateCoffee.supplier,
        taste: updateCoffee.taste,
        category: updateCoffee.category,
        details: updateCoffee.details,
        photo:updateCoffee.photo
        },
  
      };
      const result = await dataCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //Delete
    app.delete('/coffee/:id',async(req,res)=>{
      const id = req.params.id;
      console.log('Deleted id',id);
      const query = { _id: new ObjectId(id)};
      const result = await dataCollection.deleteOne(query);
      res.send(result);
    })
    
    //For Users API
    
    //GET
    app.get('/user',async(req,res)=>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //post
    app.post('/user',async(req,res)=>{
      const user = req.body;
      console.log('new user',user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    //Patch
    app.patch('/user',async(req,res)=>{
      const user = req.body;
      const filter = { email: user.email};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          lastLoginAt: user.lastLoginAt
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //Delete
    app.delete('/user/:id',async(req,res)=>{
      const id = req.params.id;
      console.log('deleted id',id);
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('coffee port is running')
})

app.listen(port, () => {
  console.log(`the number of port is: ${port}`)
})