const express = require("express");
const config = require("dotenv/config");

const posts = [
  { id: 1, title: "Post 1", user_id: 1 },
  { id: 2, title: "Post 2", user_id: 2 },
];

const app = express();

app.get("/api/posts", (req, res) => {
  return res.status(200).json(posts);
});

app.listen(3001, () => console.log('the post service listening on port 3001'))
