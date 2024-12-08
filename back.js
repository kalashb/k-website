const express = require("express");
const app = express();

// Serve files from the 'public' directory
app.use("/files", express.static("public/files"));

// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
