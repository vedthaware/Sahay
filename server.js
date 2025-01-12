import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON data
app.use(bodyParser.json());

// Create a connection pool to MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Ved@2020", // replace with your MySQL password
  database: "mysql", // replace with your actual database name
});

// Save Profile API
// Backend route to handle profile update (POST)
// Save Profile API
// Backend route to handle profile update (POST)
app.post("/api/profile", async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    dateOfBirth,
    educationalStatus,
    institution,
    fieldOfStudy,
    careerInterests,
    specificCareerPaths,
    industriesOfInterest,
    careerAssessmentTest,
    strongestSkills,
    careerKnowledgeLevel,
    personalizedCounseling,
    resourcesOfInterest,
    referralSource,
    shortTermGoals,
    longTermAspirations,
    assistanceNeeded,
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO profin (
        full_name, email, phone_number, date_of_birth, educational_status, institution,
        field_of_study, career_interests, specific_career_paths, industries_of_interest,
        career_assessment_test, strongest_skills, career_knowledge_level, personalized_counseling,
        resources_of_interest, referral_source, short_term_goals, long_term_aspirations, assistance_needed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        educationalStatus,
        institution,
        fieldOfStudy,
        careerInterests,
        specificCareerPaths,
        industriesOfInterest,
        careerAssessmentTest ? 1 : 0, // Convert boolean to tinyint(1)
        strongestSkills,
        careerKnowledgeLevel,
        personalizedCounseling ? 1 : 0, // Convert boolean to tinyint(1)
        resourcesOfInterest,
        referralSource,
        shortTermGoals,
        longTermAspirations,
        assistanceNeeded,
      ]
    );

    // Send the user's ID back in the response
    const userId = result.insertId;
    res.status(201).json({ message: "Profile saved successfully", userId });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});


// View Profile API (GET)
app.get("/api/viewprofile", async (req, res) => {
  const userId = req.query.userId;  // Assume userId is passed as query parameter

  try {
    const [result] = await db.execute("SELECT * FROM profin WHERE id = 1", [userId]);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send("Profile not found");
    }
  } catch (err) {
    res.status(500).send("Error fetching profile");
  }
});

// Signup API
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [user] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user[0].id }, "your_jwt_secret", { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Subscribe API
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    await db.execute("INSERT INTO Subscribers (email) VALUES (?)", [email]);
    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Email is already subscribed." });
    } else {
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "An error occurred. Please try again." });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
