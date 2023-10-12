const PORT = 8000;
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // This middleware is required to parse JSON request bodies

// Connect to MongoDB Atlas
const connectionString = process.env.MONGODB_URI;
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch(err => {
    console.error("Error connecting to MongoDB Atlas:", err);
});

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const phoneRegex = /^\+?[1-9]\d{1,14}$/;  // Basic international phone number validation

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { username, password, email, phoneNumber } = req.body;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "User created!" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Username, Email, or Phone number already exists" });
        } else {
            res.status(500).json({ message: "Error signing up" });
        }
    }
});

// Login Route

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  // Create a JWT token
  const token = jwt.sign({ userId: user._id }, 'yourSecretKey');  // In a real application, use a more secure secret
  res.json({ message: "Logged in successfully", token, username: user.username });
});



app.get("/deals", async (req, res) => {
    const searchTerm = req.query.search || "deals of the day";  
    try {
        const body = {
            "source": "amazon_search",
            "domain": "com",
            "query": searchTerm,  
            "parse": true,
            "pages": 1
        };

        const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + Buffer.from(`${process.env.OXYLABS_USERNAME}:${process.env.OXYLABS_PASSWORD}`).toString("base64")
            }
        });
        
        const data = await response.json();
        const results = data.results[0].content.results.organic;
        const filteredDeals = results.filter(deal => deal.price_strikethrough);
        const sortedByBestDeal = filteredDeals.sort((b, a) => (
            ((a.price_strikethrough - a.price) / a.price_strikethrough * 100) -
            ((b.price_strikethrough - b.price) / b.price_strikethrough * 100)
        ));

        res.send(sortedByBestDeal);
    
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching deals" });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
