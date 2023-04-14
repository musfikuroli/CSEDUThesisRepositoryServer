const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 4000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cseduthesisrepository.mwrh9uf.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const userDetailsCollection = client.db('ThesisRepo').collection("UsersData")
    const thesisCollection = client.db('ThesisRepo').collection("ThesisFile")


    app.post('/users', async(req,res)=>{
        const allUser = req.body
        const result = userDetailsCollection.insertOne(allUser)
        res.send(result)
    })


    app.post('/thesisFiles', async(req,res)=>{
        const papers = req.body
        const result = thesisCollection.insertOne(papers)
        res.send(result)
    })
  } finally {
  }
}
run().catch(console.log);

// mongodb connection ended

app.get("/", async (req, res) => {
  res.send("csedu thesis repository server is running");
});

app.listen(port, () => console.log(`server is running at ${port}`));
