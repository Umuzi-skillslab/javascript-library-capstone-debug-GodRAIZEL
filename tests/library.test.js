import { jest } from '@jest/globals';

import {
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
} from '../src/library.js';

describe('Book Class', () => {
    test('should create a book instance', () => {
        var book = new Book('9780547928227', 'Test Book', 'Author Name', 2020, 5, 5, 'test-category');

        expect(book.isbn).toBe('9780547928227');
        expect(book.title).toBe('Test Book');
        expect(book.author).toBe('Author Name');
        expect(book.year).toBe(2020);
        expect(book.totalCopies).toBe(5);
        expect(book.availableCopies).toBe(5);
        expect(book.category).toBe('test-category');
    });

    test('checkOut reduces availableCopies and prevents double borrow', () => {
        const book = new Book('9780735211292', 'Checkout Book', 'Author B', 2019, 2, 2, 'fiction');
        expect(book.isAvailable()).toBe(true);
        const ok = book.checkOut('MEM1');
        expect(ok).toBe(true);
        expect(book.availableCopies).toBe(1);
        expect(() => book.checkOut('MEM1')).toThrow();
        const ok2 = book.checkOut('MEM2');
        expect(ok2).toBe(true);
        expect(book.availableCopies).toBe(0);
        expect(() => book.checkOut('MEM3')).toThrow();
    });

    test('getInfo returns formatted string with template literals', () => {
        const book = new Book('9780061120084', 'Info Book', 'Author C', 2018, 3, 3, 'non-fiction');
        const info = book.getInfo();
        expect(typeof info).toBe('string');
        expect(info).toContain('Name: Info Book');
        expect(info).toContain('Author: Author C');
        expect(info).toContain('Total Copies: 3');
    });

    test('throws when available copies exceed total copies', () => {
        expect(() =>
            new Book(
                '9780132350884',
                'Bad Book',
                'Author',
                2020,
                2,
                5,
                'fiction'
            )
        ).toThrow();
    });
});

describe('DigitalBook Class', () => {
    test('DigitalBook inherits Book and sets digital-specific fields', () => {
        const d = new DigitalBook('9781492056355', 'Digital Title', 'D Author', 2021, 2.5, 'PDF', 'digital');
        expect(d.isbn).toBe('9781492056355');
        expect(d.title).toBe('Digital Title');
        expect(d.fileSize).toBe(2.5);
        expect(d.format).toBe('PDF');
        expect(d.downloads).toBe(0);
        expect(d.totalCopies).toBe(1);
        expect(d.availableCopies).toBe(1);
        expect(d.isAvailable()).toBe(true);
    });

    test('DigitalBook.download increments downloads and checkOut throws', () => {
        const d = new DigitalBook('9780596517748', 'Digital 2', 'D2', 2022, 1.1, 'EPUB', 'digital');
        expect(d.download('M1')).toBe(true);
        expect(d.downloads).toBe(1);
        expect(() => d.checkOut('M1')).toThrow();
    });
});

describe('Member Class', () => {
    test('canBorrow returns boolean', () => {
        var member = new Member('MB1', 'John Doe', 'john@example.com', 'standard', '2020-01-01');
        var result = member.canBorrow();
        expect(typeof result).toBe('boolean');
    });

    test('borrow limit enforced for standard member', () => {
        var member = new Member('MB2', 'Jane Doe', 'jane@example.com', 'standard', '2020-01-01');
        member.borrowedBooks = new Array(5);
        expect(member.canBorrow()).toBe(false);
        member.borrowedBooks = new Array(4);
        expect(member.canBorrow()).toBe(true);
    });

    test('getMembershipDuration returns a descriptive string', () => {
        const joinDate = new Date();
        joinDate.setFullYear(joinDate.getFullYear() - 2);
        const iso = joinDate.toISOString().slice(0, 10);
        const member = new Member('MB3', 'Dur', 'dur@example.com', 'standard', iso);
        const dur = member.getMembershipDuration();
        expect(typeof dur).toBe('string');
        expect(dur).toMatch(/Membership Duration:/);
    });
});

describe('PremiumMember Class', () => {
    test('PremiumMember inherits Member and has higher limit', () => {
        const pm = new PremiumMember('PM1', 'Premium', 'prem@example.com', '2020-01-01');
        expect(pm instanceof Member).toBe(true);
        pm.borrowedBooks = new Array(9);
        expect(pm.canBorrow()).toBe(true);
        pm.borrowedBooks = new Array(10);
        expect(pm.canBorrow()).toBe(false);
    });
});

describe('Library Functions', () => {
    const originalBooks = BOOKS.slice();
    const originalMembers = MEMBERS.slice();

    beforeEach(() => {
        BOOKS.length = 0;
        originalBooks.forEach(b => BOOKS.push(b));
        MEMBERS.length = 0;
        originalMembers.forEach(m => MEMBERS.push(m));
    });

    afterAll(() => {
        BOOKS.length = 0;
        originalBooks.forEach(b => BOOKS.push(b));
        MEMBERS.length = 0;
        originalMembers.forEach(m => MEMBERS.push(m));
    });

    test('findBookByISBN returns book', () => {
        const sample = BOOKS[0];
        const book = findBookByISBN(sample.isbn);
        expect(book).toBeDefined();
        expect(book.isbn).toBe(sample.isbn);
    });

    test('findBookByISBN returns null for valid-but-missing ISBN', () => {
        const res = findBookByISBN('9781111111111');
        expect(res).toBeNull();
    });

    test('findMemberById returns member', () => {
        const sample = MEMBERS[0];
        const member = findMemberById(sample.id);
        expect(member).toBeDefined();
        expect(member.id).toBe(sample.id);
    });

    test('borrowBook returns false for invalid member', () => {
        expect(borrowBook('NOPE', BOOKS[0].isbn)).toBe(false);
    });

    test('borrowBook returns false for invalid ISBN format', () => {
        expect(borrowBook(MEMBERS[0].id, '000-000')).toBe(false);
    });

    test('borrowBook borrows a physical book successfully and cleans up', () => {
        const member = MEMBERS[0];
        const phys = BOOKS.find(b => !(b instanceof DigitalBook) && b.availableCopies > 0);
        if (phys) {
            const prev = phys.availableCopies;
            const prevCheckedOut = phys.checkedOut.slice();
            const res = borrowBook(member.id, phys.isbn);
            expect(typeof res).toBe('boolean');
            if (res) {
                expect(phys.availableCopies).toBe(prev - 1);
                phys.availableCopies = prev;
                member.borrowedBooks = member.borrowedBooks.filter(isbn => isbn !== phys.isbn);
                phys.checkedOut = phys.checkedOut.filter(record => record.memberId !== member.id);
                prevCheckedOut.forEach(r => {
                    if (!phys.checkedOut.some(x => x.memberId === r.memberId && x.borrowDate === r.borrowDate)) {
                        phys.checkedOut.push(r);
                    }
                });
            }
        } else {
            const tmp = new Book('9782222222222', 'Tmp', 'Tmp', 2010, 1, 1, 'tmp');
            BOOKS.push(tmp);
            const res = borrowBook(member.id, tmp.isbn);
            expect(res).toBe(true);
            BOOKS.pop();
            member.borrowedBooks = member.borrowedBooks.filter(isbn => isbn !== tmp.isbn);
        }
    });

    test('getBooksByAuthor returns array and handles no matches', () => {
        const author = BOOKS[0].author;
        const arr = getBooksByAuthor(author);
        expect(Array.isArray(arr)).toBe(true);
        expect(arr.every(b => b.author === author)).toBe(true);
        const none = getBooksByAuthor('NoSuchAuthorXYZ');
        expect(Array.isArray(none)).toBe(true);
        expect(none.length).toBe(0);
    });
});

describe('Array Operations', () => {
    test('combineBookCollections uses spread and returns combined array', () => {
        const a = [1, 2];
        const b = [3, 4];
        const combined = combineBookCollections(a, b);
        expect(Array.isArray(combined)).toBe(true);
        expect(combined).toEqual([1, 2, 3, 4]);
    });

    test('addMultipleBooks uses rest parameters and pushes books (with cleanup)', () => {
        const before = BOOKS.length;
        const b1 = new Book('9783333333333', 'A', 'X', 2001, 1, 1, 'c');
        const b2 = new Book('9784444444444', 'B', 'Y', 2002, 1, 1, 'c');
        addMultipleBooks(b1, b2);
        expect(BOOKS.length).toBe(before + 2);
        BOOKS.pop();
        BOOKS.pop();
    });

    test('getBooksByAuthor uses filter correctly', () => {
        const author = BOOKS[0].author;
        const res = getBooksByAuthor(author);
        expect(res.every(b => b.author === author)).toBe(true);
    });
});

describe('Recursive Functions', () => {
    test('searchBooksByCategory finds books and respects base case', () => {
        const category = BOOKS[0].category;
        const found = searchBooksByCategory(BOOKS, category);
        expect(Array.isArray(found)).toBe(true);
        expect(found.length).toBeGreaterThanOrEqual(1);
        const empty = searchBooksByCategory([], category);
        expect(Array.isArray(empty)).toBe(true);
        expect(empty.length).toBe(0);
    });

    test('searchBooksByCategory handles missing category fields gracefully', () => {
        const list = [{ isbn: 'x' }, { isbn: 'y', category: 'a' }];
        const res = searchBooksByCategory(list, 'a');
        expect(Array.isArray(res)).toBe(true);
        expect(res.length).toBe(1);
    });
});

describe('Error Handling', () => {
    test('borrowBook logs and returns false on thrown errors', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const res = borrowBook(null, null);
        expect(res).toBe(false);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    test('findBookByISBN returns null when valid-but-missing', () => {
        const res = findBookByISBN('9785555555555');
        expect(res).toBeNull();
    });
});

describe('String Operations', () => {
    test('formatBookInfo trims and uppercases title', () => {
        const b = new Book('9786666666666', '  lower title  ', 'Auth', 1990, 1, 1, 'c');
        const out = formatBookInfo(b);
        expect(out).toContain('Title: LOWER TITLE');
        expect(out).toContain('Author: Auth');
    });
});

describe('Math Operations', () => {
    test('calculateFineAmount returns number and correct value', () => {
        var fine = calculateFineAmount(5);
        expect(typeof fine).toBe('number');
        expect(fine).toBeCloseTo(5 * 0.5, 2);
    });

    test('calculateFineAmount handles zero and negative gracefully', () => {
        expect(calculateFineAmount(0)).toBe(0);
        expect(() => calculateFineAmount(-3)).toThrow();
    });

    test('calculateTotalLateFees returns total fine for member record', () => {
        const memberRecord = { overdueBooks: [{ daysLate: 2 }, { daysLate: 3 }] };
        const total = calculateTotalLateFees(memberRecord);
        expect(total).toBeCloseTo((2 + 3) * 0.5);
    });
});

describe('Overdue and Queue Processing', () => {
    test('findOverdueBooks returns overdue entries and includes daysBorrowed', () => {
        const b = new Book('9787777777777', 'Old', 'X', 2000, 1, 0, 'oldcat');
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 20);
        b.checkedOut.push({ memberId: 'MZ', borrowDate: oldDate.toISOString() });
        BOOKS.push(b);
        const overdue = findOverdueBooks(7);
        expect(Array.isArray(overdue)).toBe(true);
        expect(overdue.some(o => o.book.isbn === b.isbn)).toBe(true);
        const entry = overdue.find(o => o.book.isbn === b.isbn);
        expect(entry).toHaveProperty('daysBorrowed');
        BOOKS.pop();
    });

    test('processReturnQueue iterates and logs each item', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => { });
        processReturnQueue(['r1', 'r2']);
        expect(spy).toHaveBeenCalledTimes(2);
        spy.mockRestore();
    });
});

describe('LibraryStats and summary functions', () => {
    test('LibraryStats.updateStats and getSummary produce expected keys', () => {
        LibraryStats.updateStats();
        const summary = LibraryStats.getSummary();
        expect(summary).toHaveProperty('totalBooks');
        expect(summary).toHaveProperty('totalMembers');
        expect(summary).toHaveProperty('totalBorrowings');
    });

    test('getMostPopularBook returns null or a book object', () => {
        const most = LibraryStats.getMostPopularBook();
        expect(most === null || typeof most === 'object').toBe(true);
    });

    test('getAverageCopiesPerBook returns a number', () => {
        const avg = LibraryStats.getAverageCopiesPerBook();
        expect(typeof avg).toBe('number');
    });

    test('getBooksByCategoryCounts returns an object mapping categories to counts', () => {
        const counts = LibraryStats.getBooksByCategoryCounts();
        expect(typeof counts).toBe('object');
    });

    test('getAllBookTitles returns array of strings', () => {
        const titles = LibraryStats.getAllBookTitles();
        expect(Array.isArray(titles)).toBe(true);
        if (titles.length > 0) expect(typeof titles[0]).toBe('string');
    });
});

describe('updateMemberInfo', () => {
    test('updateMemberInfo updates and validates fields', () => {
        const m = new Member('UP1', 'U', 'u@example.com', 'standard', '2020-01-01');
        const updated = updateMemberInfo(m, { name: 'Updated', email: 'new@example.com', membershipType: 'premium' });
        expect(updated.name).toBe('Updated');
        expect(updated.email).toBe('new@example.com');
        expect(updated.membershipType).toBe('premium');
    });

    test('updateMemberInfo with partial updates keeps existing values', () => {
        const m = new Member('UP2', 'V', 'v@example.com', 'standard', '2020-01-01');
        const updated = updateMemberInfo(m, { name: 'V2' });
        expect(updated.name).toBe('V2');
        expect(updated.email).toBe('v@example.com');
    });
});
