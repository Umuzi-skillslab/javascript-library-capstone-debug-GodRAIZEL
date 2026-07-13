import { jest } from '@jest/globals';

const pathToUI = '../src/ui.js';
const pathToLibrary = '../src/library.js';
const pathToStorage = '../src/storage.js';

describe('ui module (full coverage, DOM-focused assertions)', () => {
    let ui;
    let mockBOOKS;
    let mockMEMBERS;
    let mockBorrowBook;
    let mockFindBookByISBN;
    let mockFindMemberById;
    let mockUpdateMemberInfo;
    let mockExportLibraryData;
    let mockSaveToLocalStorage;
    let mockLibraryStats;

    beforeEach(async () => {
        jest.resetModules();

        document.body.innerHTML = `
      <div id="catalogue-list"></div>

      <input id="search" />

      <select id="filter-category">
        <option value="all">All</option>
        <option value="fiction">Fiction</option>
        <option value="reference">Reference</option>
      </select>

      <form id="borrow-form">
        <input id="member-id" />
        <input id="isbn" />
        <button type="submit">Borrow</button>
      </form>

      <div id="member-list"></div>
      <button id="export-data">Export</button>

      <div id="book-details"></div>

      <div id="member-form"></div>

      <section id="catalogue-section"></section>
      <section id="borrow-section"></section>
      <section id="member-section"></section>
      <section id="statistics-section"></section>

      <button id="catalogue-tab">Catalogue</button>
      <button id="members-tab">Members</button>
      <button id="statistics-tab">Statistics</button>

      <div class="total-books"></div>
      <div class="total-members"></div>
      <div class="books-borrowed"></div>
      <div class="avg-copies"></div>
    `;

        mockBOOKS = [
            {
                isbn: "9780547928227",
                title: "The Hobbit",
                author: "Tolkien",
                year: 1937,
                totalCopies: 5,
                availableCopies: 2,
                category: "fiction",
                checkedOut: [],
            },
            {
                isbn: "9780132350884",
                title: "Clean Code",
                author: "Robert C. Martin",
                year: 2008,
                totalCopies: 6,
                availableCopies: 6,
                category: "reference",
                checkedOut: [],
            },
        ];

        mockMEMBERS = [
            {
                id: "M001",
                name: "John Smith",
                membershipType: "standard",
                joinDate: "2020-01-01",
                borrowedBooks: [],
            },
            {
                id: "M002",
                name: "Jane Doe",
                membershipType: "premium",
                joinDate: "2020-02-02",
                borrowedBooks: [],
            },
        ];

        mockBorrowBook = jest.fn((memberId, isbn) => {
            const member = mockMEMBERS.find(m => m.id === memberId);
            const book = mockBOOKS.find(b => b.isbn === isbn);

            if (!member || !book || book.availableCopies <= 0) {
                return false;
            }

            book.availableCopies--;
            member.borrowedBooks.push(isbn);

            return true;
        });

        mockFindBookByISBN = jest.fn(
            isbn => mockBOOKS.find(b => b.isbn === isbn) || null
        );

        mockFindMemberById = jest.fn(
            id => mockMEMBERS.find(m => m.id === id) || null
        );

        mockUpdateMemberInfo = jest.fn((member, updates) => {
            Object.assign(member, updates);
        });

        mockExportLibraryData = jest.fn(() => ({
            BOOKS: mockBOOKS,
            MEMBERS: mockMEMBERS,
        }));

        mockSaveToLocalStorage = jest.fn(() => true);

        mockLibraryStats = {
            totalBooks: 0,
            totalMembers: 0,
            totalBorrowings: 0,

            updateStats: jest.fn(() => {
                mockLibraryStats.totalBooks = mockBOOKS.length;
                mockLibraryStats.totalMembers = mockMEMBERS.length;
                mockLibraryStats.totalBorrowings =
                    mockMEMBERS.reduce(
                        (sum, member) => sum + member.borrowedBooks.length,
                        0
                    );
            }),

            getAverageCopiesPerBook: jest.fn(() => 3.14),
        };

        jest.unstable_mockModule(pathToLibrary, () => ({
            BOOKS: mockBOOKS,
            MEMBERS: mockMEMBERS,
            findMemberById: mockFindMemberById,
            updateMemberInfo: mockUpdateMemberInfo,
            DigitalBook: class DigitalBook { },
            borrowBook: mockBorrowBook,
            findBookByISBN: mockFindBookByISBN,
            LibraryStats: mockLibraryStats,
        }));

        jest.unstable_mockModule(pathToStorage, () => ({
            exportLibraryData: mockExportLibraryData,
            saveToLocalStorage: mockSaveToLocalStorage,
        }));

        global.alert = jest.fn();

        jest.spyOn(console, "error").mockImplementation(() => { });
        jest.spyOn(console, "log").mockImplementation(() => { });

        ui = await import(pathToUI);
    });

    afterEach(() => {
        console.error.mockRestore();
        console.log.mockRestore();
        delete global.alert;
        jest.resetModules();
    });

    test('initializeUI wires elements, renders catalogue and updates stats', () => {
        expect(() => ui.initializeUI()).not.toThrow();

        const cards = document.querySelectorAll('#catalogue-list .book-card');
        expect(cards.length).toBe(2);
        expect(cards[0].dataset.isbn).toBe('9780547928227');

        expect(mockLibraryStats.updateStats).toHaveBeenCalled();
        expect(document.querySelector('.total-books').textContent).toBe(String(mockBOOKS.length));
        expect(document.querySelector('.total-members').textContent).toBe(String(mockMEMBERS.length));
        expect(document.querySelector('.avg-copies').textContent).toBe(String(mockLibraryStats.getAverageCopiesPerBook()));
    });

    test("setupEventListeners attaches listeners and clicking a book shows details in DOM", () => {
        ui.initializeUI();

        const firstCard = document.querySelector("#catalogue-list .book-card");

        expect(firstCard).not.toBeNull();

        firstCard.click();

        expect(document.getElementById("book-details").innerHTML)
            .toContain("The Hobbit");
    });

    test("renderBookCatalogue handles missing container and invalid input", () => {

        ui.initializeUI();

        ui.renderBookCatalogue(null);

        expect(console.error)
            .toHaveBeenCalledWith(
                "renderBookCatalogue expected an array."
            );
    });

    test('renderMemberList renders members and ignores invalid inputs', () => {
        ui.renderMemberList(mockMEMBERS);
        const rows = document.querySelectorAll('#member-list .member-row');
        expect(rows.length).toBe(2);
        expect(rows[0].dataset.memberId).toBe('M001');

        document.getElementById('member-list').remove();
        expect(() => ui.renderMemberList('not-array')).not.toThrow();
    });

    describe('handleBorrowSubmit', () => {
        beforeEach(() => {
            ui.renderBookCatalogue(mockBOOKS);
            ui.setupEventListeners();
        });

        test('alerts when fields are missing and prevents default', () => {
            const form = document.getElementById('borrow-form');

            const event = new Event('submit', {
                bubbles: true,
                cancelable: true,
            });

            form.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
            expect(global.alert).toHaveBeenCalledWith(
                'Please provide both a member ID and an ISBN.'
            );
        });

        test("borrows a book successfully and updates catalogue", () => {

            ui.initializeUI();

            document.getElementById("member-id").value = "M001";
            document.getElementById("isbn").value = "9780547928227";

            const form = document.getElementById("borrow-form");

            form.dispatchEvent(
                new Event("submit", {
                    bubbles: true,
                    cancelable: true,
                })
            );

            expect(mockBorrowBook)
                .toHaveBeenCalledWith(
                    "M001",
                    "9780547928227"
                );

            expect(
                document.querySelector(
                    '[data-isbn="9780547928227"]'
                ).textContent
            ).toContain("Available: 1");

            expect(alert)
                .toHaveBeenCalledWith(
                    "Book borrowed successfully."
                );
        });

        test('shows alert when borrow fails', () => {
            mockBorrowBook.mockReturnValue(false);

            document.getElementById('member-id').value = 'M001';
            document.getElementById('isbn').value = '9780132350884';

            document
                .getElementById('borrow-form')
                .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

            expect(global.alert).toHaveBeenCalledWith(
                'Unable to borrow this book right now.'
            );
        });

        test('handles borrow exceptions', () => {
            mockBorrowBook.mockImplementation(() => {
                throw new Error('boom');
            });

            document.getElementById('member-id').value = 'M001';
            document.getElementById('isbn').value = '9780547928227';

            document
                .getElementById('borrow-form')
                .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

            expect(console.error).toHaveBeenCalled();

            expect(global.alert).toHaveBeenCalledWith(
                'Something went wrong while borrowing the book.'
            );
        });
    });

    test('handleBookClick ignores clicks outside book-card', () => {
        document.body.click();
        expect(document.getElementById('book-details').innerHTML).toBe('');
    });

    test("handleMemberListClick edit button populates edit form and clicking row logs selection", () => {

        ui.initializeUI();
        ui.renderMemberList(mockMEMBERS);

        const editButton =
            document.querySelector(".edit-member");

        expect(editButton).not.toBeNull();

        editButton.click();

        const idInput =
            document.getElementById("new-member-id");

        expect(idInput).not.toBeNull();

        expect(idInput.value).toBe("M001");

        const memberRow =
            document.querySelector(".member-row");

        memberRow.click();

        expect(console.log)
            .toHaveBeenCalledWith(
                "Selected member: M001"
            );
    });

    test("handleSearch filters books and supports empty results", () => {

        ui.initializeUI();

        const search =
            document.getElementById("search");

        search.value = "hobbit";

        search.dispatchEvent(
            new Event("input")
        );

        let cards =
            document.querySelectorAll(".book-card");

        expect(cards).toHaveLength(1);

        expect(cards[0].textContent)
            .toContain("The Hobbit");

        search.value = "clean";

        search.dispatchEvent(
            new Event("input")
        );

        cards =
            document.querySelectorAll(".book-card");

        expect(cards).toHaveLength(1);

        expect(cards[0].textContent)
            .toContain("Clean Code");

        search.value = "does-not-exist";

        search.dispatchEvent(
            new Event("input")
        );

        expect(
            document.querySelectorAll(".book-card")
        ).toHaveLength(0);
    });

    test("handleFilterChange filters correctly", () => {

        ui.initializeUI();

        const filter =
            document.getElementById("filter-category");

        filter.value = "fiction";

        filter.dispatchEvent(
            new Event("change")
        );

        let cards =
            document.querySelectorAll(".book-card");

        expect(cards).toHaveLength(1);

        expect(cards[0].textContent)
            .toContain("The Hobbit");

        filter.value = "reference";

        filter.dispatchEvent(
            new Event("change")
        );

        cards =
            document.querySelectorAll(".book-card");

        expect(cards).toHaveLength(1);

        expect(cards[0].textContent)
            .toContain("Clean Code");

        filter.value = "all";

        filter.dispatchEvent(
            new Event("change")
        );

        expect(
            document.querySelectorAll(".book-card")
        ).toHaveLength(2);
    });

    test('handleExportClick via button click and direct call', () => {
        ui.setupEventListeners();
        document.getElementById('export-data').click();
        expect(mockExportLibraryData).toHaveBeenCalled();
        expect(mockSaveToLocalStorage).toHaveBeenCalledWith('libraryData', { BOOKS: mockBOOKS, MEMBERS: mockMEMBERS });
        expect(global.alert).toHaveBeenCalledWith('Library data exported and saved.');

        mockExportLibraryData.mockReturnValue(null);
        ui.handleExportClick();
        expect(global.alert).toHaveBeenCalledWith('Failed to export library data.');
    });

    test('displayBookDetails renders book information', () => {
        const details = document.getElementById('book-details');

        ui.displayBookDetails('NOPE');

        expect(details.textContent).toContain('Book not found.');

        ui.displayBookDetails('9780547928227');

        expect(details.textContent).toContain('The Hobbit');
        expect(details.textContent).toContain('Tolkien');
        expect(details.textContent).toContain('1937');
        expect(details.textContent).toContain('ISBN');
        expect(details.textContent).toContain('Available');
    });

    test('updateStatisticsDisplay updates DOM and booksBorrowed element and calls average copies', () => {
        mockLibraryStats.updateStats.mockClear();
        ui.updateStatisticsDisplay();
        expect(mockLibraryStats.updateStats).toHaveBeenCalled();
        expect(document.querySelector('.total-books').textContent).toBe(String(mockBOOKS.length));
        expect(document.querySelector('.books-borrowed').textContent).toBe(String(mockLibraryStats.totalBorrowings));
        expect(mockLibraryStats.getAverageCopiesPerBook).toHaveBeenCalled();
    });

    test('createMemberForm builds form and editMember populates and updates member object', () => {
        ui.createMemberForm();
        const form = document.getElementById('new-member-form');
        expect(form).toBeTruthy();

        mockFindMemberById.mockReturnValue(null);
        ui.editMember('NOPE');
        expect(global.alert).toHaveBeenCalledWith('Member not found.');

        mockFindMemberById.mockReturnValue(mockMEMBERS[0]);
        ui.editMember('M001');

        const idInput = document.getElementById('new-member-id');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const membershipTypeInput = document.getElementById('membershipType');
        const newForm = document.getElementById('new-member-form');

        expect(idInput.value).toBe('M001');
        expect(idInput.disabled).toBe(true);
        expect(nameInput.value).toBe(mockMEMBERS[0].name);

        nameInput.value = 'Updated Name';
        emailInput.value = 'updated@example.com';
        membershipTypeInput.value = 'premium';

        newForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(mockUpdateMemberInfo).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Member updated successfully.');

        expect(mockMEMBERS[0].name).toBe('Updated Name');
    });

    test('showSection toggles visibility correctly', () => {
        ui.showSection('catalogue-section');
        expect(document.getElementById('catalogue-section').style.display).toBe('block');
        expect(document.getElementById('borrow-section').style.display).toBe('block');

        ui.showSection('member-section');
        expect(document.getElementById('member-section').style.display).toBe('block');
        expect(document.getElementById('catalogue-section').style.display).toBe('none');
    });

    test('setupNavigation changes visible sections correctly', () => {
        ui.setupNavigation();

        document.getElementById('catalogue-tab').click();

        expect(
            document.getElementById('catalogue-section').style.display
        ).toBe('block');

        expect(
            document.getElementById('borrow-section').style.display
        ).toBe('block');

        expect(
            document.getElementById('member-section').style.display
        ).toBe('none');

        document.getElementById('members-tab').click();

        expect(
            document.getElementById('member-section').style.display
        ).toBe('block');

        expect(
            document.querySelectorAll('#member-list .member-row')
        ).toHaveLength(2);

        expect(
            document.getElementById('new-member-form')
        ).toBeTruthy();

        document.getElementById('statistics-tab').click();

        expect(
            document.getElementById('statistics-section').style.display
        ).toBe('block');

        expect(
            document.querySelector('.total-books').textContent
        ).toBe(String(mockBOOKS.length));

        expect(
            document.querySelector('.total-members').textContent
        ).toBe(String(mockMEMBERS.length));
    });
});