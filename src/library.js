import {
  validateISBN,
  validateString,
  validateNumber,
  validateYear,
  validateInteger, validateEmail, validateDate, validateMembershipType, validateArray, validateObject
} from "./utils.js";

const BOOK_ERRORS = {
  noMoreCopies: "There are no more available copies for this book.",
  alreadyBorrowed: "Cannot borrow book twice.",
  invalidBookCopies:
    "Available copies cannot be more than total copies. Please provide valid values",
  digitalCheckouts: "Digital books cannot be checked out.",
  memberNotFound: (memberId) => `Member ${memberId} was not found.`,
  bookNotFound: (isbn) => `Book ${isbn} was not found.`
};

let BOOKS = [];
let MEMBERS = [];
const LATE_FEE_PER_DAY = 0.5;
const MAX_BOOKS_PER_MEMBER = 5;
const MAX_BOOKS_PER_PREMIUM_MEMBER = 10;

class Book {
  constructor(isbn, title, author, year, totalCopies, availableCopies, category) {
    // Validate constructor arguments before creating a Book object.
    validateISBN(isbn);
    this.isbn = isbn;

    validateString(title, "Title");
    this.title = title;

    validateString(author, "Author");
    this.author = author;

    validateYear(year);
    this.year = year;

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

  isAvailable() {
    return this.availableCopies > 0;
  }

  getInfo() {
    return `Name: ${this.title}\nAuthor: ${this.author}\nYear: ${this.year}\nTotal Copies: ${this.totalCopies}\nAvailable Copies: ${this.availableCopies}`;
  }

  checkOut(memberId) {
    validateString(memberId, "Member ID");

    const alreadyBorrowed = this.checkedOut.some(
      record => record.memberId === memberId
    );
    // Prevent the same member from borrowing the same physical book twice.
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

class DigitalBook extends Book {
  constructor(isbn, title, author, year, fileSize, format, category) {
    super(isbn, title, author, year, 1, 1, category);

    validateNumber(fileSize, "File Size");
    this.fileSize = fileSize;

    validateString(format, "Format");
    this.format = format;

    this.downloads = 0;
  }
  // Digital books are always available because they have unlimited downloads.
  isAvailable() {
    return true;
  }

  checkOut() {
    throw new Error(BOOK_ERRORS.digitalCheckouts);
  }

  download(memberId) {
    validateString(memberId, "Member ID");
    this.downloads++;
    return true;
  }
}

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

  getMemberInfo() {
    const { id, name, email, membershipType, joinDate, borrowedBooks } = this;

    return `Member Name: ${name}, Member ID: ${id}, Email: ${email}, Membership Type: ${membershipType}, Join Date: ${joinDate}, Borrowed Books: ${borrowedBooks.join(",") || "None"}`;
  }

  canBorrow() {
    if (this.borrowedBooks.length >= MAX_BOOKS_PER_MEMBER) {
      return false;
    }
    return true;
  }
}

class PremiumMember extends Member {
  constructor(id, name, email, joinDate) {
    super(id, name, email, "premium", joinDate);
    // Premium members have a higher borrowing limit than standard members.
    this.maxBorrowLimit = MAX_BOOKS_PER_PREMIUM_MEMBER;
  }

  canBorrow() {
    if (this.borrowedBooks.length >= this.maxBorrowLimit) {
      return false
    }

    return true;
  }
}

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

function processReturnQueue(queue) {
  validateArray(queue, "Queue");

  let index = 0;

  while (index < queue.length) {
    const item = queue[index];

    console.log(`Processing return: ${item}`);

    index++;
  }
}

function searchBooksByCategory(bookList, category, index = 0) {
  validateArray(bookList, "Book List");
  validateString(category, "Category");
  validateInteger(index, "Index");

  if (index >= bookList.length) {
    return [];
  }
  if (!bookList[index] || bookList[index].category === undefined) {
    return searchBooksByCategory(bookList, category, index + 1);
  }
  // Recursive call continues searching until every book has been processed.
  if (bookList[index].category === category) {
    return [bookList[index], ...searchBooksByCategory(bookList, category, index + 1)];
  }
  return searchBooksByCategory(bookList, category, index + 1);
}

function getBooksByAuthor(authorName) {
  validateString(authorName, "Author Name");
  return BOOKS.filter((book) => book.author === authorName);
}

function calculateTotalLateFees(memberRecord) {
  validateObject(memberRecord, "Member Record");
  validateArray(memberRecord.overdueBooks, "Member Overdue Books");
  // Reduce is used here to calculate the total late fees efficiently.
  return memberRecord.overdueBooks.reduce(
    (total, record) => total + record.daysLate * LATE_FEE_PER_DAY,
    0
  );
}

function combineBookCollections(...collections) {
  collections.forEach((collection, index) =>
    validateArray(collection, `Collection ${index + 1}`)
  );

  return collections.reduce(
    (combined, collection) => [...combined, ...collection],
    []
  );
}

function addMultipleBooks(...newBooks) {
  newBooks.forEach(book => validateObject(book, "Book"));

  BOOKS.push(...newBooks);

  return BOOKS;
}

function updateMemberInfo(member, updates) {
  validateObject(member, "Member");
  validateObject(updates, "Updates");
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

function borrowBook(memberId, isbn) {

  try {
    validateString(memberId, "Member");
    validateISBN(isbn);

    const member = findMemberById(memberId);
    const book = findBookByISBN(isbn);


    if (!member) {
      throw new Error(BOOK_ERRORS.memberNotFound(memberId));
    }
    if (!book) {
      throw new Error(BOOK_ERRORS.bookNotFound(isbn));
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

function findMemberById(id) {
  validateString(id, "Member ID");
  return MEMBERS.find((member) => member.id === id);
}

function findBookByISBN(isbn) {
  validateISBN(isbn);

  return BOOKS.find((book) => book.isbn === isbn) || null;
}

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

  getAverageCopiesPerBook() {
    const physicalBooks = BOOKS.filter(book => !(book instanceof DigitalBook));

    if (physicalBooks.length === 0) {
      return 0;
    }

    const totalCopies = physicalBooks.reduce(
      (sum, book) => sum + book.totalCopies,
      0
    );

    return Math.round((totalCopies / physicalBooks.length) * 100) / 100;
  },

  getBooksByCategoryCounts() {
    const counts = {};
    for (const book of BOOKS) {
      counts[book.category] = (counts[book.category] || 0) + 1;
    }
    return counts;
  },

  getSummary() {
    this.updateStats();
    const { totalBooks, totalMembers, totalBorrowings } = this;
    return { totalBooks, totalMembers, totalBorrowings };
  },

  getAllBookTitles() {
    return BOOKS.map((book) => book.title);
  },
};

function formatBookInfo(book) {
  validateObject(book, "Book");
  const title = book.title.trim().toUpperCase();
  const author = book.author.trim();
  return `Title: ${title}\nAuthor: ${book.author}\nISBN: ${book.isbn}\nYear: ${book.year}`;
}

function calculateFineAmount(daysLate) {
  validateInteger(daysLate, "Days Late");
  const fine = Math.max(0, daysLate) * LATE_FEE_PER_DAY;
  return Number(fine.toFixed(2));
}


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
