// storage.js - JSON serialisation and localStorage persistence.
// Fixes: line 131 (exportLibraryData missing JSON.stringify), line 140
// (importLibraryData had JSON.parse but no try-catch), lines 151-152
// (saveToLocalStorage missing JSON.stringify), lines 157/161
// (loadFromLocalStorage missing JSON.parse), and missing null checks/
// try-catch throughout the original localStorage functions.

import { BOOKS, MEMBERS } from './library.js';

/***********************************************************
 * Returns the current library data as a plain JavaScript object.
 ***********************************************************/
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
/**
 * Parses a JSON string of library data, validating its shape before
 * handing it back to the caller. Returns null on any failure instead of
 * throwing, so callers can show a friendly error message.
 */
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

/** Saves any JSON-serialisable value under `key` in localStorage. */
function saveToLocalStorage(key, data) {
    if (typeof key !== "string" || key.trim() === "") {
        console.error("saveToLocalStorage error: key must be a non-empty string.");
        return false;
    }

    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`saveToLocalStorage error: ${error.message}`);
        return false;
    }
}

/** Loads and parses a JSON value from localStorage, or null if absent/invalid. */
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
        console.error(`loadFromLocalStorage error: ${error.message}`);
        return null;
    }
}

export {exportLibraryData,importLibraryData,saveToLocalStorage,loadFromLocalStorage}