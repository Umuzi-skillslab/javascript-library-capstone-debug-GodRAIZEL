// ui.js - DOM manipulation and event handling.

import {
  BOOKS,
  DigitalBook,
  borrowBook,
  findBookByISBN,
  LibraryStats
} from "./library.js";
import { exportLibraryData, saveToLocalStorage } from "./storage.js";

let catalogueContainer;
let searchInput;
let filterDropdown;

/** Entry point: locates the key DOM elements and wires everything up. */
export function initializeUI() {
  catalogueContainer = document.querySelector("#catalogue-list");
  searchInput = document.getElementById("search");
  filterDropdown = document.querySelector("#filter-category");

  if (!catalogueContainer || !searchInput || !filterDropdown) {
    console.error("One or more required DOM elements were not found; UI may not work correctly.");
  }

  setupEventListeners();
  renderBookCatalogue(BOOKS);
  updateStatisticsDisplay(); // ✅ update stats on first load
}

/** Wires up all event listeners (7+ listeners, 2+ using delegation). */
export function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
  if (filterDropdown) {
    filterDropdown.addEventListener("change", handleFilterChange);
  }

  const borrowForm = document.getElementById("borrow-form");
  if (borrowForm) {
    borrowForm.addEventListener("submit", handleBorrowSubmit);
  }

  if (catalogueContainer) {
    catalogueContainer.addEventListener("click", handleBookClick);
  }

  const memberList = document.getElementById("member-list");
  if (memberList) {
    memberList.addEventListener("click", handleMemberListClick);
  }

  const exportButton = document.getElementById("export-data");
  if (exportButton) {
    exportButton.addEventListener("click", handleExportClick);
  }

  const catalogueTab = document.getElementById("catalogue-tab");
  if (catalogueTab) {
    catalogueTab.addEventListener("click", () => renderBookCatalogue(BOOKS));
  }
}

/** Renders a list of books into the catalogue container. */
export function renderBookCatalogue(bookList) {
  if (!catalogueContainer) {
    console.error("Catalogue container not found.");
    return;
  }
  if (!Array.isArray(bookList)) {
    console.error("renderBookCatalogue expected an array.");
    return;
  }

  catalogueContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const book of bookList) {
    const available =
      book instanceof DigitalBook ? "Unlimited" : book.availableCopies;

    const bookCard = document.createElement("div");
    bookCard.className = "book-card";
    bookCard.dataset.isbn = book.isbn;
    bookCard.innerHTML = `
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Available: ${available}</p>
    `;
    fragment.appendChild(bookCard);
  }

  catalogueContainer.appendChild(fragment);
}

/** Renders the member list using map + template literals. */
export function renderMemberList(memberList) {
  const container = document.getElementById("member-list");
  if (!container || !Array.isArray(memberList)) return;

  container.innerHTML = memberList
    .map(
      (member) => `
        <div class="member-row" data-member-id="${member.id}">
          ${member.name} (${member.membershipType})
        </div>`
    )
    .join("");
}

/** Handles the borrow form submission. */
export function handleBorrowSubmit(event) {
  event.preventDefault();

  const memberIdInput = document.getElementById("member-id");
  const isbnInput = document.getElementById("isbn");
  if (!memberIdInput || !isbnInput) return;

  const memberId = memberIdInput.value.trim();
  const isbn = isbnInput.value.trim();
  if (!memberId || !isbn) {
    alert("Please provide both a member ID and an ISBN.");
    return;
  }

  try {
    const success = borrowBook(memberId, isbn);

    if (success) {
      alert("Book borrowed successfully.");
      renderBookCatalogue(BOOKS);
      updateStatisticsDisplay(); // ✅ only refresh after success
    } else {
      alert("Unable to borrow this book right now.");
    }
  } catch (error) {
    console.error(`handleBorrowSubmit error: ${error.message}`);
    alert("Something went wrong while borrowing the book.");
  } finally {
    event.target?.reset?.();
  }
}

/** Event-delegation handler for clicks anywhere inside the catalogue. */
export function handleBookClick(event) {
  const bookCard = event.target.closest?.(".book-card");
  if (!bookCard) return;
  displayBookDetails(bookCard.dataset.isbn);
}

/** Event-delegation handler for clicks anywhere inside the member list. */
export function handleMemberListClick(event) {
  const memberRow = event.target.closest?.(".member-row");
  if (!memberRow) return;
  console.log(`Selected member: ${memberRow.dataset.memberId}`);
}

/** Filters the catalogue by search term as the user types. */
export function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const results = BOOKS.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.category && book.category.toLowerCase().includes(searchTerm))
    );
  });
  renderBookCatalogue(results);
}

/** Filters the catalogue by selected category. */
export function handleFilterChange() {
  if (!filterDropdown) return;
  const selectedCategory = filterDropdown.value;
  const filtered =
    selectedCategory === "all"
      ? BOOKS
      : BOOKS.filter((book) => book.category === selectedCategory);
  renderBookCatalogue(filtered);
}

/** Exports current library data and persists it to localStorage. */
export function handleExportClick() {
  const data = exportLibraryData();
  if (!data) {
    alert("Failed to export library data.");
    return;
  }

  // ✅ verify storage helper: pass object or string depending on implementation
  const saved = saveToLocalStorage("libraryData", data);
  alert(saved ? "Library data exported and saved." : "Failed to save library data.");
}

/** Displays full details for a single book by ISBN. */
export function displayBookDetails(isbn) {
  const detailsContainer = document.getElementById("book-details");
  if (!detailsContainer) return;

  const book = findBookByISBN(isbn);
  if (!book) {
    detailsContainer.innerHTML = `<p>Book not found.</p>`;
    return;
  }

  const available =
    book instanceof DigitalBook ? "Unlimited" : book.availableCopies;

  detailsContainer.innerHTML = `
    <div class="book-details">
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>ISBN:</strong> ${book.isbn}</p>
      <p><strong>Year:</strong> ${book.year}</p>
      <p><strong>Category:</strong> ${book.category}</p>
      <p><strong>Available:</strong> ${available}</p>
    </div>
  `;
}

/** Updates the statistics panel using LibraryStats and textContent. */
export function updateStatisticsDisplay() {
  LibraryStats.updateStats();

  const totalBooksEl = document.querySelector(".total-books");
  const totalMembersEl = document.querySelector(".total-members");
  const booksBorrowedEl = document.querySelector(".books-borrowed");
  const avgCopiesEl = document.querySelector(".avg-copies");

  if (!totalBooksEl || !totalMembersEl || !booksBorrowedEl) return;

  totalBooksEl.textContent = LibraryStats.totalBooks;
  totalMembersEl.textContent = LibraryStats.totalMembers;
  booksBorrowedEl.textContent = LibraryStats.totalBorrowings;

  if (avgCopiesEl && typeof LibraryStats.getAverageCopiesPerBook === "function") {
    avgCopiesEl.textContent = LibraryStats.getAverageCopiesPerBook();
  }
}

/** Dynamically builds the "add member" form. */
export function createMemberForm() {
  const formContainer = document.getElementById("member-form");
  if (!formContainer) return;

  formContainer.innerHTML = `
    <form id="new-member-form">
      <label for="member-id">Member ID</label>
      <input
        type="text"
        id="member-id"
        name="member-id"
        placeholder="Unique ID"
        required
      >

      <label for="name">Name</label>
      <input type="text" id="name" placeholder="Full name" required>

      <label for="email">Email</label>
      <input type="email" id="email" placeholder="you@example.com" required>

      <label for="membershipType">Membership Type</label>
      <select id="membershipType" required>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
      </select>

      <label for="joinDate">Join Date</label>
      <input type="date" id="joinDate" required>

      <button type="submit">Add Member</button>
    </form>
  `;
}

// Wait for DOMContentLoaded
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeUI);
}