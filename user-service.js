const express = require("express");
const config = require("dotenv/config");

const users = [
  { id: 1, name: "Ky" },
  { id: 2, name: "Phuong" },
];

const app = express();

app.get("/api/users", (req, res) => {
  return res.status(200).json(users);
});

app.listen(3000, () => console.log('the user service listening on port 3000'))
