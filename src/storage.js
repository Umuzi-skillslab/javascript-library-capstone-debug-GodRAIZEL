import { BOOKS, MEMBERS } from './library.js';

function exportLibraryData() {
    try {
        return {
            BOOKS,
            MEMBERS,
        };
    } catch (error) {
        console.error(`exportLibraryData error: ${error.message}`);
        return null;
    }
}

function importLibraryData(jsonString) {
    if (typeof jsonString !== 'string') {
        console.error('importLibraryData error: jsonString must be a string.');
        return null;
    }
    try {
        const data = JSON.parse(jsonString);
        if (!data || !Array.isArray(data.BOOKS) || !Array.isArray(data.MEMBERS)) {
            throw new Error('Parsed data is missing BOOKS/MEMBERS arrays.');
        }
        return data;
    } catch (error) {
        console.error(`importLibraryData error: ${error.message}`);
        return null;
    }
}

function saveToLocalStorage(key, data) {
    if (typeof key !== "string" || key.trim() === "") {
        console.error("saveToLocalStorage error: key must be a non-empty string.");
        return false;
    }

    try {
        // Convert JavaScript objects into JSON before storing them in localStorage.
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`saveToLocalStorage error: ${error.message}`);
        return false;
    }
}

function loadFromLocalStorage(key) {
    if (typeof key !== 'string' || key.trim() === '') {
        console.error('loadFromLocalStorage error: key must be a non-empty string.');
        return null;
    }
    try {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === undefined) {
            return null;
        }
        return JSON.parse(raw);
    } catch (error) {
        // Catch storage errors such as quota limits or invalid JSON.
        console.error(`loadFromLocalStorage error: ${error.message}`);
        // Return null instead of throwing an exception when stored data is invalid.
        return null;
    }
}

export { exportLibraryData, importLibraryData, saveToLocalStorage, loadFromLocalStorage }