const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res
        .status(409)
        .json({ message: `User ${username} already exists!` });
    }
  } else {
    // Return error if username or password is missing
    return res.status(400).json({
      message: "Unable to register user. Username or Password is missing",
    });
  }
});

// Get the book list available in the shop using async/await
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await Promise.resolve(books);
    res.send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN using Promises
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  Promise.resolve(books[isbn])
    .then((book) => {
      if (book) {
        res.send(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch(() =>
      res.status(500).json({ message: "Error retrieving book by ISBN" })
    );
});

// Get book details based on author using async/await
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.author === author)
    );
    res.send(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by author" });
  }
});

// Get all books based on title using async/await
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const filteredBooks = await Promise.resolve(
      Object.values(books).filter((book) => book.title === title)
    );
    res.send(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books by title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  res.send(book.reviews);
});

module.exports.general = public_users;
