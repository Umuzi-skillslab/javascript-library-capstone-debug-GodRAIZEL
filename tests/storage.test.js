import { jest } from "@jest/globals";

const pathToLibrary = "../src/library.js";
const pathToStorage = "../src/storage.js";

describe("storage module (normal library mock)", () => {
    let exportLibraryData;
    let importLibraryData;
    let saveToLocalStorage;
    let loadFromLocalStorage;

    const mockBooks = [{ isbn: "9780547928227", title: "Hobbit" }];
    const mockMembers = [{ id: "M001", name: "John" }];

    beforeEach(async () => {
        jest.resetModules();

        jest.unstable_mockModule(pathToLibrary, () => ({
            BOOKS: mockBooks,
            MEMBERS: mockMembers,
        }));

        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };

        jest.spyOn(console, "error").mockImplementation(() => { });

        const storage = await import(pathToStorage);

        exportLibraryData = storage.exportLibraryData;
        importLibraryData = storage.importLibraryData;
        saveToLocalStorage = storage.saveToLocalStorage;
        loadFromLocalStorage = storage.loadFromLocalStorage;
    });

    afterEach(() => {
        console.error.mockRestore();
        delete global.localStorage;
        jest.resetModules();
    });

    test("exportLibraryData returns exact BOOKS and MEMBERS arrays from library", () => {
        const result = exportLibraryData();

        expect(result).toEqual({
            BOOKS: mockBooks,
            MEMBERS: mockMembers,
        });

        expect(result.BOOKS).toBe(mockBooks);
        expect(result.MEMBERS).toBe(mockMembers);
    });

    describe("importLibraryData", () => {
        test("returns null and logs when input is not a string", () => {
            expect(importLibraryData(null)).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                "importLibraryData error: jsonString must be a string."
            );
        });

        test("returns null and logs when JSON is invalid", () => {
            expect(importLibraryData("not-json")).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("importLibraryData error:")
            );
        });

        test("returns null when parsed object is missing BOOKS or MEMBERS", () => {
            expect(importLibraryData(JSON.stringify({ BOOKS: [] }))).toBeNull();
            expect(importLibraryData(JSON.stringify({ MEMBERS: [] }))).toBeNull();

            expect(console.error).toHaveBeenCalled();
        });

        test('returns null when JSON string is "null"', () => {
            expect(importLibraryData("null")).toBeNull();

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Parsed data is missing BOOKS/MEMBERS arrays."
                )
            );
        });

        test("returns parsed object for valid JSON", () => {
            const json = JSON.stringify({
                BOOKS: [{ isbn: "9780547928227" }],
                MEMBERS: [{ id: "M001" }],
            });

            expect(importLibraryData(json)).toEqual({
                BOOKS: [{ isbn: "9780547928227" }],
                MEMBERS: [{ id: "M001" }],
            });
        });
    });

    describe("saveToLocalStorage", () => {
        test("returns false for invalid key", () => {
            expect(saveToLocalStorage("", {})).toBe(false);
            expect(saveToLocalStorage(123, {})).toBe(false);

            expect(console.error).toHaveBeenCalledWith(
                "saveToLocalStorage error: key must be a non-empty string."
            );
        });

        test("stores JSON and returns true", () => {
            expect(saveToLocalStorage("books", { a: 1 })).toBe(true);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                "books",
                JSON.stringify({ a: 1 })
            );
        });

        test("handles undefined data", () => {
            expect(saveToLocalStorage("books", undefined)).toBe(true);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                "books",
                JSON.stringify(undefined)
            );
        });

        test("returns false when setItem throws", () => {
            localStorage.setItem.mockImplementation(() => {
                throw new Error("quota");
            });

            expect(saveToLocalStorage("books", {})).toBe(false);

            expect(console.error).toHaveBeenCalledWith(
                "saveToLocalStorage error: quota"
            );
        });
    });

    describe("loadFromLocalStorage", () => {
        test("returns null for invalid key", () => {
            expect(loadFromLocalStorage("")).toBeNull();
            expect(loadFromLocalStorage(123)).toBeNull();

            expect(console.error).toHaveBeenCalledWith(
                "loadFromLocalStorage error: key must be a non-empty string."
            );
        });

        test("returns null when key missing", () => {
            localStorage.getItem.mockReturnValue(null);

            expect(loadFromLocalStorage("books")).toBeNull();

            expect(localStorage.getItem).toHaveBeenCalledWith("books");
        });

        test("returns parsed object", () => {
            const obj = { x: 5 };

            localStorage.getItem.mockReturnValue(JSON.stringify(obj));

            expect(loadFromLocalStorage("books")).toEqual(obj);
        });

        test("returns null when getItem returns undefined", () => {
            localStorage.getItem.mockReturnValue(undefined);

            expect(loadFromLocalStorage("books")).toBeNull();
        });

        test("returns null when JSON parsing fails", () => {
            localStorage.getItem.mockReturnValue("not-json");

            expect(loadFromLocalStorage("books")).toBeNull();

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("loadFromLocalStorage error:")
            );
        });
    });
});

