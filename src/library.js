// Library Management System - Starter Code with Complex Errors
import {
  validateISBN,
  validateString,
  validateNumber,
  validateYear,
  validateInteger, validateEmail, validateDate, validateMembershipType
} from "./utils.js";

// Global state management (scoping issues)
const BOOK_ERRORS = {
  noMoreCopies: "There are no more available copies for this book.",
  alreadyBorrowed: "Cannot borrow book twice.",
  invalidBookCopies:
    "Available copies cannot be more than total copies. Please provide valid values",
  digitalCheckouts: "Digital books cannot be checked out.",
};
let BOOKS = [{
    isbn: "978...",
    title: "Clean Code",
    author: "Robert Martin",
    year: 2008,
    availableCopies: 2,
    totalCopies: 5,
    checkedOut: []
  },
  {
    isbn: "978...",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    year: 1999,
    availableCopies: 1,
    totalCopies: 3,
    checkedOut: []
  }]; // Missing declaration
let MEMBERS = []; // Wrong: should use let
const LATE_FEE_PER_DAY = 0.5;
const MAX_BOOKS_PER_MEMBER = 5; // Missing const
const MAX_BOOKS_PER_PREMIUM_MEMBER = 10;

// Book class with multiple issues
class Book {
  constructor(isbn, title, author, year, totalCopies, availableCopies) {
    validateISBN(isbn);
    this.isbn = isbn;

    validateString(title, "Title");
    this.title = title;

    validateString(author, "Author");
    this.author = author;

    validateYear(year, "Year");
    this.year = year;

    // Missing: availableCopies and totalCopies properties
    validateInteger(totalCopies, "Total Copies", true);
    this.totalCopies = totalCopies;

    validateInteger(availableCopies, "Available Copies");
    if (availableCopies > totalCopies) {
      throw new Error(BOOK_ERRORS.invalidBookCopies);
    }
    this.availableCopies = availableCopies;

    this.checkedOut = [];
  }

  // Missing: method to check availability
  isAvailable() {
    return this.availableCopies > 0;
  }
  // Missing: method to get book info using template literals

  getInfo() {
    return `Name: ${this.title}\nAuthor: ${this.author}\nYear: ${this.year}\nTotal Copies: ${this.totalCopies}\nAvailable Copies: ${this.availableCopies}`;
  }

  checkOut(memberId) {
    // No validation for available copies
    validateString(memberId, "Member ID");

    const alreadyBorrowed = this.checkedOut.some(
      record => record.memberId === memberId
    );

    const borrowDate = new Date();

    if (this.isAvailable()) {
      this.checkedOut.push({
        memberId,
        borrowDate: borrowDate.toISOString()
      });

      this.availableCopies--;
      return true;
    }

    throw new Error(BOOK_ERRORS.noMoreCopies);
  }

}

// Digital book class with inheritance problems
class DigitalBook extends Book {
  constructor(isbn, title, author, year, fileSize, format) {
    // Missing: super() call with correct parameters
    super(isbn, title, author, year, 0, 0);

    validateNumber(fileSize, "File Size");
    this.fileSize = fileSize;

    validateString(format, "Format");
    this.format = format;

    this.downloads = 0;
  }

  isAvailable() {
    return true;
  }

  checkOut() {
    throw new Error(BOOK_ERRORS.digitalCheckouts);
  }

  download(memberId) {
    // Should override differently than physical checkout
    validateString(memberId, "Member ID");
    this.downloads += 1;
  }
}

// Member class with errors
class Member {
  constructor(id, name, email, membershipType, joinDate) {
    validateString(id, "Member ID");
    this.id = id;

    validateString(name, "Name");
    this.name = name;

    validateEmail(email);
    this.email = email;

    validateMembershipType(membershipType);
    this.membershipType = membershipType;

    validateDate(joinDate);
    this.joinDate = joinDate;

    this.borrowedBooks = [];
  }

  // Missing: method to calculate membership duration
  getMembershipDuration() {
    let joinDateObject = new Date(this.joinDate);
    let currentDate = new Date();

    let years = currentDate.getFullYear() - joinDateObject.getFullYear();
    let months = currentDate.getMonth() - joinDateObject.getMonth();
    let days = currentDate.getDate() - joinDateObject.getDate();

    if (days < 0) {
      months -= 1;
      let prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      );
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `Membership Duration: ${years} years ${months} months ${days} days`;
  }

  // Missing: method using destructuring
  getMemberInfo() {
    const { id, name, email, membershipType, joinDate, borrowedBooks } = this;

    return `Member Name: ${name}, Member ID: ${id}, Email: ${email}, Membership Type: ${membershipType}, Join Date: ${joinDate}, Borrowed Books: ${borrowedBooks}`;
  }

  canBorrow() {
    // Wrong comparison operator
    if (this.borrowedBooks.length >= MAX_BOOKS_PER_MEMBER) {
      return false;
    }
    return true;
  }
}

// Premium member with inheritance issues
class PremiumMember extends Member {
  constructor(id, name, email, joinDate) {
    super(id, name, email, "premium", joinDate);
    this.maxBorrowLimit = MAX_BOOKS_PER_PREMIUM_MEMBER;
  }

  // Should override canBorrow to allow more books
  canBorrow() {
    if (this.borrowedBooks.length >= this.maxBorrowLimit) {
      return false
    }

    return true;
  }
}

// Complex function with nested loops and errors
function findOverdueBooks(daysOverdue) {
  validateInteger(daysOverdue, "Days Overdue", true);

  const today = new Date();

  return BOOKS.flatMap(book =>
    book.checkedOut
      .filter(record => {
        const borrowDate = new Date(record.borrowDate);

        const daysBorrowed = Math.floor(
          (today - borrowDate) / (1000 * 60 * 60 * 24)
        );

        return daysBorrowed >= daysOverdue;
      })
      .map(record => ({
        book,
        memberId: record.memberId,
        borrowDate: record.borrowDate,
        daysBorrowed: Math.floor(
          (today - new Date(record.borrowDate)) /
            (1000 * 60 * 60 * 24)
        )
      }))
  );
}

// Function with while loop error
function processReturnQueue(queue) {
    validateArray(queue, "Queue");

    let index = 0;

    while (index < queue.length) {
        const item = queue[index];

        console.log(`Processing return: ${item}`);

        index++;
    }
}

// Recursive function with multiple errors
function searchBooksByCategory(bookList, category, index) {
  // Missing: base case
  // Missing: undefined/null checks
  // Wrong comparison

  if ((bookList[index].category = category)) {
    return [bookList[index]].concat(
      searchBooksByCategory(bookList, category, index + 1),
    );
  }

  return searchBooksByCategory(bookList, category, index + 1);
}

// Function missing array methods
function getBooksByAuthor(authorName) {
  var result = [];

  // Should use filter method
  for (var i = 0; i < books.length; i++) {
    if (books[i].author == authorName) {
      // Should use ===
      result.push(books[i]);
    }
  }

  return result;
}

// Function that should use reduce
function calculateTotalLateFees(memberRecord) {
  var total = 0;

  // Should use reduce on array
  for (var i = 0; i < memberRecord.overdueBooks.length; i++) {
    total = total + memberRecord.overdueBooks[i].daysLate * LATE_FEE_PER_DAY;
  }

  return total;
}

// Function missing spread operator
function combineBookCollections(fiction, nonFiction, reference) {
  // Should use spread operator
  var combined = [];

  for (var i = 0; i < fiction.length; i++) combined.push(fiction[i]);
  for (var i = 0; i < nonFiction.length; i++) combined.push(nonFiction[i]);
  for (var i = 0; i < reference.length; i++) combined.push(reference[i]);

  return combined;
}

// Function missing rest parameters
function addMultipleBooks(book1, book2, book3) {
  // Should use rest parameters to accept unlimited books
  books.push(book1);
  books.push(book2);
  books.push(book3);
}

// Function missing destructuring
function updateMemberInfo(member, updates) {
  // Should destructure updates object
  member.name = updates.name;
  member.email = updates.email;
  member.membershipType = updates.membershipType;

  return member;
}

// Function with no error handling
function borrowBook(memberId, isbn) {
  // Missing: try-catch block
  // Missing: validation for undefined/null
  // Missing: typeof checks

  var member = findMemberById(memberId);
  var book = findBookByISBN(isbn);

  // No check if member or book exists
  if (member.canBorrow()) {
    book.checkOut(memberId);
    member.borrowedBooks.push(isbn);
    return true;
  }

  return false;
}

// Helper functions with errors
function findMemberById(id) {
  // Should use find method
  for (var i = 0; i < members.length; i++) {
    if ((members[i].id = id)) {
      // Wrong operator
      return members[i];
    }
  }
  // Returns undefined implicitly - should handle explicitly
}

function findBookByISBN(isbn) {
  var i = 0;

  // Wrong loop choice
  while (i < books.length) {
    if (books[i].isbn === isbn) {
      return books[i];
    }
    i = i + 1;
  }

  return null;
}

// Statistics object with missing methods
var LibraryStats = {
  totalBooks: 0,
  totalMembers: 0,
  totalBorrowings: 0,

  // Missing: method using Math object for calculations
  // Missing: method using for-of loop
  // Missing: method returning object with destructuring

  updateStats: function () {
    this.totalBooks = books.length;
    this.totalMembers = members.length;
  },

  getMostPopularBook: function () {
    // Inefficient implementation - should use reduce
    var maxCheckouts = 0;
    var popularBook = null;

    for (var i = 0; i < books.length; i++) {
      if (books[i].checkedOut.length > maxCheckouts) {
        maxCheckouts = books[i].checkedOut.length;
        popularBook = books[i];
      }
    }

    return popularBook;
  },
};

// Function with string manipulation errors
function formatBookInfo(book) {
  // Should use template literals
  var info = "Title: " + book.title + "\n";
  info = info + "Author: " + book.author + "\n";
  info = info + "Year: " + book.year;

  // Missing: proper string methods (trim, toUpperCase, etc.)

  return info;
}

// Function with number/type issues
function calculateFineAmount(daysLate) {
  // Missing: typeof check
  // Missing: NaN handling
  // Missing: null/undefined check

  var fine = daysLate * LATE_FEE_PER_DAY;

  // Should use toFixed for currency
  return fine;
}

// Missing: module exports
// Missing: proper data structure for ISBN lookups (Map/Set)
let book1 = new Book(null, "FGHJ", "Him", 2020, 500, 500);

console.log(book1);
