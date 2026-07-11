const ERRORS = {
    invalidISBNLength:
        "Invalid ISBN length. Please provide an ISBN with 13 digits",
    nullString: (variableName) =>
        `${variableName} cannot be null. Please provide a valid string for ${variableName}`,
    undefinedString: (variableName) =>
        `${variableName} cannot be undefined. Please provide a valid string for ${variableName}`,
    invalidStringType: (variableName) =>
        `Invalid type for ${variableName}. Please provide a valid string.`,
    emptyString: (variableName) =>
        `Cannot have empty string for ${variableName}. Please provide a valid string for ${variableName}`,
    nullNumber: (variableName) =>
        `${variableName} cannot be null. Please provide a valid number for ${variableName}`,
    undefinedNumber: (variableName) =>
        `${variableName} cannot be undefined. Please provide a valid number for ${variableName}`,
    invalidNumberType: (variableName) =>
        `Invalid type for ${variableName}. Please provide a value of type Number for ${variableName}`,
    numGreaterThanZero: (variableName) =>
        `${variableName} must be greater than zero. Please provide a valid number for ${variableName}`,
    invalidIntegerValue: (variableName) => `Please provide a valid integer value for ${variableName}.`,
    invalidYear:
        "Year provided cannot be from the future please provide a valid Year.",
    invalidEmail: "Invalid email. Please provide a valid email.",
    invalidDate: "Invalid date. Please select a valid date.",
    invalidFutureDate: "Invalid date. Date cannot be from the future.",
    invalidMembershipType: "Invalid membership type. Valid membership types are 'Standard' or 'Premium'",
    invalidArray: (variableName) => `Please enter a valid array for ${variableName}`,
    nullArray: (variableName) => `${variableName} cannot be null. Please provide a valid array.`,
    undefinedArray: (variableName) => `${variableName} cannot be undefined. Please provide a valid array.`,
    invalidObject: (variableName) => `Please enter a valid object for ${variableName}`,
    nullObject: (variableName) => `${variableName} cannot be null. Please provide a valid object.`,
    undefinedObject: (variableName) => `${variableName} cannot be undefined. Please provide a valid object.`,



};

const VALID_MEMBERSHIP_TYPES = ["standard", "premium"];

function validateISBN(isbn) {
    validateString(isbn, "ISBN");

    let cleanedISBN = isbn.replace(/[\s-]/g, "");

    if (cleanedISBN.length !== 13) {
        throw new Error(ERRORS.invalidISBNLength);
    }
}

function validateString(stringValue, variableName) {
    if (stringValue === null) {
        throw new Error(ERRORS.nullString(variableName));
    }
    if (stringValue === undefined) {
        throw new Error(ERRORS.undefinedString(variableName));
    }
    if (typeof stringValue !== "string") {
        throw new Error(ERRORS.invalidStringType(variableName));
    }
    if (stringValue.trim().length === 0) {
        throw new Error(ERRORS.emptyString(variableName));
    }
}

function validateNumber(numberValue, variableName, greaterThanZero = false) {
    if (numberValue === null) {
        throw new Error(ERRORS.nullNumber(variableName));
    }
    if (numberValue === undefined) {
        throw new Error(ERRORS.undefinedNumber(variableName));
    }
    if (typeof numberValue !== "number") {
        throw new Error(ERRORS.invalidNumberType(variableName));
    }

    if (greaterThanZero && numberValue < 0) {
        throw new Error(ERRORS.numGreaterThanZero(variableName));
    }
}

function validateInteger(integerValue, variableName, greaterThanZero = false) {
    validateNumber(integerValue, variableName, greaterThanZero);

    if (!Number.isInteger(integerValue)) {
        throw new Error(ERRORS.invalidIntegerValue(variableName));
    }

}

function validateYear(year) {
    validateInteger(year, "Year", true);

    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
        throw new Error(ERRORS.invalidYear);
    }
}

function validateEmail(email) {
    validateString(email, "Email");

    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        throw new Error(ERRORS.invalidEmail);
    }
}


function validateDate(datePicker) {
    const date = new Date(datePicker);
    const today = new Date();

    if (isNaN(date.getTime())) {
        throw new Error(ERRORS.invalidDate);
    }

    if (date > today) {
        throw new Error(ERRORS.invalidFutureDate);
    }

}

function validateMembershipType(membershipType) {
    validateString(membershipType, "Membership Type");
    if (!VALID_MEMBERSHIP_TYPES.includes(membershipType)) {
        throw new Error(ERRORS.invalidMembershipType)
    }
}

function validateArray(someArray, variableName) {
    if (someArray === null) {
        throw new Error(ERRORS.nullArray(variableName));
    }
    if (someArray === undefined) {
        throw new Error(ERRORS.undefinedArray(variableName));
    }
    if (!Array.isArray(someArray)) {
        throw new Error(ERRORS.invalidArray(variableName));
    }

}

function validateObject(someObject, variableName) {
    if (someObject === null) {
        throw new Error(ERRORS.nullObject(variableName));
    }
    if (someObject === undefined) {
        throw new Error(ERRORS.undefinedObject(variableName));
    }
    if (typeof someObject !== "object" || Array.isArray(someObject)) {
        throw new Error(ERRORS.invalidObject(variableName));
    }
}

export { validateISBN, validateString, validateNumber, validateYear, validateInteger, validateEmail, validateDate, validateMembershipType, validateArray, validateObject };
