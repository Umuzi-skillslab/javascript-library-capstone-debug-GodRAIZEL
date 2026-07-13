# Library Management System

## System Overview

This project is a modern JavaScript Library Management System developed using ES6 modules and object-oriented programming principles. It allows users to manage physical and digital books, library members, borrowing operations, library statistics, searching, filtering, exporting data, and local storage persistence. The application follows a modular architecture consisting of separate **library**, **UI**, **storage**, and **utility** modules to improve maintainability and code organization.

---

# Critical Errors Found

A total of **30+ issues** were identified and resolved.

| Severity         | Examples                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Critical (8)** | Missing variable declarations, missing `super()` calls, missing constructor validation, missing JSON/localStorage error handling, UI initialization before DOM loaded, incomplete automated test suite, missing borrowing validation, missing navigation.                                                                                                                                                                                              |
| **Major (15)**   | Incorrect borrowing logic, incomplete checkout process, missing DigitalBook overrides, missing statistics functions, incomplete recursive search, inefficient array operations, incomplete rendering functions, missing event listeners, search/filter logic errors, missing member validation, incomplete storage functionality, missing inheritance behaviour, incomplete export functionality, inefficient DOM rendering, incomplete test coverage. |
| **Minor (10+)**  | Duplicate DOM IDs, outdated `var` declarations, inconsistent formatting, missing template literals, missing null checks, incomplete assertions, limited edge-case testing, formatting improvements, reusable validation helpers, improved code readability.                                                                                                                                                                                            |

---

# Fixes Implemented

### Book & Member Systems

* Added constructor validation.
* Completed checkout and borrowing logic.
* Implemented availability checking.
* Added membership duration calculation.
* Added reusable validation helpers.

### DigitalBook & PremiumMember

* Corrected inheritance using `super()`.
* Overrode methods where behaviour differs from parent classes.
* Added premium borrowing limits.
* Implemented download tracking.

### Library Functions

* Added recursive searching.
* Implemented statistics calculations.
* Added comprehensive error handling.
* Replaced manual loops with modern array methods.

### User Interface

* Added navigation between sections.
* Implemented dynamic catalogue rendering.
* Added event delegation.
* Added searching, filtering and borrow validation.
* Improved statistics display.

### Storage

* Added JSON serialization/deserialization.
* Added localStorage validation.
* Added exception handling with try-catch.

### Testing

* Expanded the provided starter tests.
* Created new test suites for `ui.js`, `storage.js`, and `utils.js`.
* Added edge cases, browser mocks, and jsdom DOM testing.
* Achieved **95%+ overall code coverage** with all tests passing.

---

# Modern JavaScript Features

The project demonstrates modern ES6+ features including:

* ES6 Modules (`import` / `export`)
* Classes and inheritance
* `super()`
* Arrow functions
* Template literals
* Object & array destructuring
* Spread operator (`...`)
* Rest parameters
* Array methods (`map`, `filter`, `reduce`, `find`, `flatMap`)
* `for...of` loops
* `const` and `let`
* Default parameters
* Optional chaining (`?.`)
* Try-catch exception handling
* Recursive functions
* JSON serialization
* Local Storage API

---

# Architecture Improvements

The original single-file implementation was refactored into separate modules:

* **library.js** – Business logic, classes, and library operations.
* **ui.js** – DOM manipulation and event handling.
* **storage.js** – JSON and localStorage functionality.
* **utils.js** – Shared validation and helper functions.

This modular design improves maintainability, readability, testing, and separation of concerns.

---

# Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

# Running the Application

Start the application using your preferred local server (such as Live Server in VS Code).

Open:

```
index.html
```

in your browser.

---

# Running the Tests

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

The completed project contains **112 passing tests** with **over 95% overall code coverage**, exceeding the required **80% minimum coverage**.
