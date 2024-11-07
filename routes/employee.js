const express = require("express");
const multer = require("multer");
const Employee = require("../models/employee");

const router = express.Router();

// Set up Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

// Create Employee route (GET)
router.get("/create-employee", (req, res) => {
    res.render("create-employee"); // Render the create-employee page if logged in
  });
  
// Create Employee route (POST)
router.post("/create", upload.single("img"), async (req, res) => {
  const { name, email, mobile, designation, gender, course } = req.body;
  const img = req.file ? req.file.filename : "";  // Check if there's a file uploaded

  const newEmployee = new Employee({ name, email, mobile, designation, gender, course, img });
  try {
    await newEmployee.save();
    res.redirect("/employee/list");  // Redirect after creating employee
  } catch (err) {
    console.log("Error creating employee:", err);
    res.status(500).send("Error creating employee");
  }
});

// Get Employee list route
router.get("/list", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render("employee-list", { employees });
  } catch (err) {
    console.log("Error retrieving employees:", err);
    res.status(500).send("Error retrieving employee list");
  }
});

// Edit Employee route (GET)
router.get("/edit/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).send("Employee not found");
    }
    res.render("edit-employee", { employee });
  } catch (error) {
    res.status(500).send("Error retrieving employee");
  }
});

// Edit Employee route (POST)
router.post("/edit/:id", upload.single("img"), async (req, res) => {
  const { name, email, mobile, designation, gender, course } = req.body;
  const img = req.file ? req.file.filename : undefined;

  const updateData = { name, email, mobile, designation, gender, course };
  if (img) updateData.img = img;

  try {
    await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.redirect("/employee/list");
  } catch (error) {
    res.status(500).send("Error updating employee");
  }
});

// Delete Employee route
router.get("/delete/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/employee/list");
  } catch (err) {
    console.log("Error deleting employee:", err);
    res.status(500).send("Error deleting employee");
  }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {  // Check if the user is logged in
      return res.redirect('/login');  // Redirect to the login page if not logged in
    }
  
    // Render the dashboard page
    res.render('dashboard', {
      user: req.session.user, // Pass user data to the template
    });
});

module.exports = router;
