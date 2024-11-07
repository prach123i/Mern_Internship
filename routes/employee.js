const express = require("express");
const multer = require("multer");
const Employee = require("../models/employee");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

router.get("/create-employee", (req, res) => {
    res.render("create-employee"); 
  });
  
router.post("/create", upload.single("img"), async (req, res) => {
  const { name, email, mobile, designation, gender, course } = req.body;
  const img = req.file ? req.file.filename : "";  

  const newEmployee = new Employee({ name, email, mobile, designation, gender, course, img });
  try {
    await newEmployee.save();
    res.redirect("/employee/list");  
  } catch (err) {
    console.log("Error creating employee:", err);
    res.status(500).send("Error creating employee");
  }
});

router.get("/list", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render("employee-list", { employees });
  } catch (err) {
    console.log("Error retrieving employees:", err);
    res.status(500).send("Error retrieving employee list");
  }
});

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

router.get("/delete/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/employee/list");
  } catch (err) {
    console.log("Error deleting employee:", err);
    res.status(500).send("Error deleting employee");
  }
});


router.get('/dashboard', (req, res) => {
    if (!req.session.user) {  
      return res.redirect('/login');  
    }
  
    res.render('dashboard', {
      user: req.session.user, 
    });
});

module.exports = router;
