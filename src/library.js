// Library Management System - Starter Code with Complex Errors
import {
  validateISBN,
  validateString,
  validateNumber,
  validateYear,
  validateInteger, validateEmail, validateDate, validateMembershipType, validateArray, validateObject
} from "./utils.js";

// Global state management (scoping issues)
const BOOK_ERRORS = {
  noMoreCopies: "There are no more available copies for this book.",
  alreadyBorrowed: "Cannot borrow book twice.",
  invalidBookCopies:
    "Available copies cannot be more than total copies. Please provide valid values",
  digitalCheckouts: "Digital books cannot be checked out.",
  memberNotFound: (memberId) => `Member ${memberId} was not found.`,
  bookNotFound: (isbn) => `Book ${isbn} was not found.`
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
  constructor(isbn, title, author, year, totalCopies, availableCopies, category) {
    validateISBN(isbn);
    this.isbn = isbn;

    validateString(title, "Title");
    this.title = title;

    validateString(author, "Author");
    this.author = author;

    validateYear(year);
    this.year = year;

    // Missing: availableCopies and totalCopies properties
    validateInteger(totalCopies, "Total Copies", true);
    this.totalCopies = totalCopies;

    validateInteger(availableCopies, "Available Copies");
    if (availableCopies > totalCopies) {
      throw new Error(BOOK_ERRORS.invalidBookCopies);
    }
    this.availableCopies = availableCopies;

    validateString(category, "Category");
    this.category = category;

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

    if (alreadyBorrowed) {
    throw new Error(BOOK_ERRORS.alreadyBorrowed);
  }

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
  constructor(isbn, title, author, year, fileSize, format, category) {
    // Missing: super() call with correct parameters
    super(isbn, title, author, year, 0, 0, category);

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
    this.downloads++;
    return true;
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

    return `Member Name: ${name}, Member ID: ${id}, Email: ${email}, Membership Type: ${membershipType}, Join Date: ${joinDate}, Borrowed Books: ${borrowedBooks.join(",")}`;
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
function searchBooksByCategory(bookList, category, index = 0) {
  validateArray(bookList, "Book List");
  validateString(category, "Category");
  validateInteger(index, "Index");
  // Missing: base case
  // Missing: undefined/null checks
  // Wrong comparison

  if (index >= bookList.length) {
    return [];
  }
  if (!bookList[index] || bookList[index].category === undefined) {
    return searchBooksByCategory(bookList, category, index + 1);
  }
  if (bookList[index].category === category) {
    return [bookList[index], ...searchBooksByCategory(bookList, category, index + 1)];
  }
  return searchBooksByCategory(bookList, category, index + 1);
}

// Function missing array methods
function getBooksByAuthor(authorName) {
  validateString(authorName, "Author Name");
  return BOOKS.filter((book) => book.author === authorName);
}

// Function that should use reduce
function calculateTotalLateFees(memberRecord) {
  validateObject(memberRecord, "Member Record");
  validateArray(memberRecord.overdueBooks, "Member Overdue Books");
  return memberRecord.overdueBooks.reduce(
    (total, record) => total + record.daysLate * LATE_FEE_PER_DAY,
    0
  );
}

// Function missing spread operator
function combineBookCollections(...collections) {
  collections.forEach((collection, index) =>
    validateArray(collection, `Collection ${index + 1}`)
  );

  return collections.reduce(
    (combined, collection) => [...combined, ...collection],
    []
  );
}

// Function missing rest parameters
function addMultipleBooks(...newBooks) {
  newBooks.forEach(book => validateObject(book, "Book"));

  BOOKS.push(...newBooks);

  return BOOKS;
}

// Function missing destructuring
function updateMemberInfo(member, updates) {
  validateObject(member, "Member");
  validateObject(updates, "Updates");
  // Should destructure updates object

  const {
    name = member.name,
    email = member.email,
    membershipType = member.membershipType,
  } = updates;

  if (name !== member.name) {
    validateString(name, "Name");
  }

  if (email !== member.email) {
    validateEmail(email);
  }

  if (membershipType !== member.membershipType) {
    validateMembershipType(membershipType);
  }

  member.name = name;
  member.email = email;
  member.membershipType = membershipType;

  return member;
}

// Function with no error handling
function borrowBook(memberId, isbn) {
  // Missing: try-catch block
  // Missing: validation for undefined/null
  // Missing: typeof checks

  try {
    validateString(memberId, "Member");
    validateISBN(isbn);

    const member = findMemberById(memberId);
    const book = findBookByISBN(isbn);


    if (!member) {
      throw new Error(BOOK_ERRORS.memberNotFound(memberId));
    }
    if (!book) {
      throw new Error(BOOK_ERRORS.bookNotFoundNot(isbn));
    }
    if (!member.canBorrow() || !book.isAvailable()) {
      return false;
    }

    book.checkOut(memberId);
    member.borrowedBooks.push(isbn);
    return true;
  } catch (error) {
    console.error(`borrowBook error: ${error.message}`);
    return false;
  }
}

// Helper functions with errors
function findMemberById(id) {
  // Should use find method
  validateString(id, "Member ID");
  return MEMBERS.find((member) => member.id === id);
}

function findBookByISBN(isbn) {
  validateISBN(isbn);

  // Wrong loop choice
  return BOOKS.find((book) => book.isbn === isbn) || null;
}

// Statistics object with missing methods
const LibraryStats = {
  totalBooks: 0,
  totalMembers: 0,
  totalBorrowings: 0,

  updateStats() {
    this.totalBooks = BOOKS.length;
    this.totalMembers = MEMBERS.length;
    this.totalBorrowings = MEMBERS.reduce((sum, member) => sum + member.borrowedBooks.length, 0);
  },

  getMostPopularBook() {
    if (BOOKS.length === 0) return null;
    return BOOKS.reduce(
      (mostPopular, book) =>
        book.checkedOut.length > (mostPopular ? mostPopular.checkedOut.length : -1) ? book : mostPopular,
      null
    );
  },

  // Uses the Math object for calculations.
  getAverageCopiesPerBook() {
    if (BOOKS.length === 0) return 0;
    const total = BOOKS.reduce((sum, book) => sum + book.totalCopies, 0);
    return Math.round((total / BOOKS.length) * 100) / 100;
  },

  // Uses a for-of loop.
  getBooksByCategoryCounts() {
    const counts = {};
    for (const book of BOOKS) {
      counts[book.category] = (counts[book.category] || 0) + 1;
    }
    return counts;
  },

  // Returns an object built via destructuring.
  getSummary() {
    this.updateStats();
    const { totalBooks, totalMembers, totalBorrowings } = this;
    return { totalBooks, totalMembers, totalBorrowings };
  },

  getAllBookTitles() {
    return BOOKS.map((book) => book.title);
  },
};

// Function with string manipulation errors
function formatBookInfo(book) {
  validateObject(book, "Book");
  // Should use template literals
  const title = book.title.trim().toUpperCase();
  return `Title: ${title}\nAuthor: ${book.author}\nISBN: ${book.isbn}\nYear: ${book.year}`;
}

// Function with number/type issues
function calculateFineAmount(daysLate) {
  // Missing: typeof check
  // Missing: NaN handling
  // Missing: null/undefined check
  validateInteger(daysLate,"Days Late");
  const fine = Math.max(0, daysLate) * LATE_FEE_PER_DAY;
  return Number(fine.toFixed(2));
}

// Missing: module exports
export {
  Book,
  DigitalBook,
  Member,
  PremiumMember,
  LibraryStats,
  borrowBook,
  addMultipleBooks,
  findBookByISBN,
  findMemberById,
  findOverdueBooks,
  processReturnQueue,
  searchBooksByCategory,
  getBooksByAuthor,
  calculateTotalLateFees,
  combineBookCollections,
  updateMemberInfo,
  formatBookInfo,
  calculateFineAmount,
  BOOKS,
  MEMBERS,
};
// Missing: proper data structure for ISBN lookups (Map/Set)
