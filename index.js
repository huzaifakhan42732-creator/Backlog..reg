import express from "express";

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Server is running successfully 🚀");
});

// Example API
app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
