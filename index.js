const express = require("express");
//--------------------------//
const multer = require("multer");
const path = require("path");
//--------------------------//
//--------------------------//
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//--------------------------//
const cors = require("cors");
const {
  MongoClient,
  GridFSBucket,
  ServerApiVersion,
  ObjectId,
  mongodb,
} = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 2000;

const app = express();
app.use(cors());
app.use(express.json());

//---------------------------//
// const upload = multer({ dest: "uploads/" });
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
      upload.fields([{ name: "pdf", maxCount: 1 }]),
      // { name: "latex", maxCount: 1 },

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
        const pdf = req.files["pdf"][0].buffer;
        // const latex = req.files["latex"][0].buffer;
        const date = new Date();

        // console.log(`pdf buffer length: ${pdf?.length}`);
        // console.log(`latex buffer length: ${latex?.length}`);

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
          date,
        };

        // console.log(`pdf data type: ${typeof pdf}`);
        // console.log(`latex data type: ${typeof latex}`);

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
          res.status(200).send({
            acknowledged: true,
            message: "File submitted successfully",
          });
        });
      }
    );

    //----------------------------------//

    //-----------------------------------//
    app.get("/oneThesisFile/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const objectOne = new ObjectId(id);
        const cursor = await thesisCollection.findOne({ _id: objectOne });
        if (!cursor) {
          console.log("File not found");
          return res.status(404).send("File not found");
        }
        const pdfBuffer = cursor.pdf.buffer;
        if (!pdfBuffer || pdfBuffer.length === 0) {
          console.log("PDF file is empty");
          return res.status(500).send("PDF file is empty");
        }
        res.setHeader("Content-Type", "application/pdf");
        res.send(pdfBuffer);
      } catch (err) {
        console.log("Error retrieving PDF file", err);
        res.status(500).send("Error retrieving PDF file");
      }
    });

    //-----------------------------------//

    app.get("/thesisFiles/:id", async (req, res) => {
      const id = req.params.id;
      const objectOne = new ObjectId(id);
      const query = { _id: objectOne };
      const cursor = thesisCollection.find(query);

      const oneFile = await cursor.toArray();

      res.send(oneFile);
    });
    // deleting data
    app.delete("/thesisFiles/:id", async (req, res) => {
      const id = req.params.id;
      const objectOne = new ObjectId(id);
      const query = { _id: objectOne };
      const result = await thesisCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        res.send("Successfully deleted document with ID " + id);
      } else {
        res.status(404).send("Document with ID " + id + " not found");
      }
    });

    app.get("/submission/:email", async (req, res) => {
      const emailData = req.params.email;
      const query = { email: emailData };
      const cursor = thesisCollection.find(query);

      const oneFile = await cursor.toArray();

      res.send(oneFile);
    });

    app.get("/pages/:year", async (req, res) => {
      const year = req.params.year;
      const query = { publicationYear: year };
      const cursor = thesisCollection.find(query);

      const oneFile = await cursor.toArray();

      res.send(oneFile);
    });
    app.get("/thesisFiles", async (req, res) => {
      const query = {};
      const thesisData = await thesisCollection
        .find(query)
        .sort({ publicationYear: -1 })
        .toArray();
      res.send(thesisData);
    });

    app.get("/publicationYear", async (req, res) => {
      const pipeline = [
        {
          $group: {
            _id: "$publicationYear",
          },
        },
        {
          $project: {
            _id: 0,
            publicationYear: "$_id",
          },
        },
      ];

      const thesisYear = await thesisCollection
        .aggregate(pipeline)
        .sort({ publicationYear: -1 })
        .toArray();
      res.send(thesisYear);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("csedu thesis repository server is running");
});

app.listen(port, () => console.log(`server is running at ${port}`));
