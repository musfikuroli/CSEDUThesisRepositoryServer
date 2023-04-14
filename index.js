const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {
  } finally {
  }
}
run().catch(console.log);

// mongodb connection ended

app.get("/", async (req, res) => {
  res.send("csedu thesis repository server is running");
});

app.listen(port, () => console.log(`server is running at ${port}`));
