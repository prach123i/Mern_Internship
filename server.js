const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const Employee = require("./models/employee");  // Import the Employee model

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect("mongodb://localhost:27017/mernproject", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Session configuration
app.use(
  session({
    secret: "$intern1",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/myNewDatabase" }),
  })
);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  next();
};


// Routes
app.use("/auth", authRoutes); 
app.use("/employee", employeeRoutes);  // This should handle all employee-related routes

// Main pages
app.get("/", (req, res) => res.render("login", { error: null }));
app.get("/dashboard", (req, res) => res.render("dashboard"));
app.get("/create-employee",isAuthenticated, (req, res) => res.render("create-employee"));

// Fetch employee list
app.get("/employee-list",isAuthenticated, async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetch all employees from the database
    res.render("employee-list", { employees });
  } catch (err) {
    console.log("Error fetching employees:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Invalid username or password" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
