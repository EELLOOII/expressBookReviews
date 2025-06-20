const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Add or update the review under the username
  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review for book with ISBN ${isbn} has been added/updated.`,
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({
      message: `Review by ${username} deleted for book with ISBN ${isbn}.`,
    });
  } else {
    return res
      .status(404)
      .json({ message: "No review found for this user on this book." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
