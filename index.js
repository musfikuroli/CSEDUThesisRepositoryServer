const express = require("express");
//--------------------------//
const multer = require("multer");
const path = require("path");
//--------------------------//
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId, mongodb } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 2000;

const app = express();
app.use(cors());
app.use(express.json());

//---------------------------//
const upload = multer({ dest: "uploads/" });
//---------------------------//

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cseduthesisrepository.mwrh9uf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const userDetailsCollection = client
      .db("ThesisRepo")
      .collection("UsersData");
    const thesisCollection = client.db("ThesisRepo").collection("ThesisFile");

    app.post("/users", async (req, res) => {
      const allUser = req.body;
      const result = userDetailsCollection.insertOne(allUser);
      res.send(result);
    });

    //----------------------------------//
    app.post(
      "/thesisFiles",
      upload.fields([
        { name: "pdf", maxCount: 1 },
        { name: "latex", maxCount: 1 },
      ]),
      (req, res) => {
        const {
          memberOne,
          memberTwo,
          email,
          description,
          publicationYear,
          supervisor,
          projectTitle,
          category,
        } = req.body;
        const pdf = req.files.pdf[0];
        const latex = req.files.latex[0];
        const date = new Date();

        // create new file object to insert into database
        const newFile = {
          memberOne,
          memberTwo,
          email,
          description,
          publicationYear,
          supervisor,
          projectTitle,
          category,
          pdf,
          latex,
          date,
        };

        // insert new file into database
        thesisCollection.insertOne(newFile, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send({
              acknowledged: false,
              message: "Failed to insert file into database",
            });
            return;
          }
          console.log(result.ops[0]);
          res.status(200).send({
            acknowledged: true,
            message: "File submitted successfully",
          });
        });
      }
    );
    //----------------------------------//

    // app.get("/thesisFiles/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const objectOne = new ObjectId(id);
    //   const query = { _id: objectOne };
    //   const cursor = thesisCollection.find(query);
    //   const oneFile = await cursor.toArray();
    //   res.send(oneFile);
    // });
    app.get("/thesisFiles", async (req, res) => {
      const query = {};
      const thesisData = await thesisCollection.find(query).toArray();
      res.send(thesisData);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("csedu thesis repository server is running");
});

app.listen(port, () => console.log(`server is running at ${port}`));
