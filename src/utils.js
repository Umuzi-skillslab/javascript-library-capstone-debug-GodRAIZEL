let ERRORS = {
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
  invalidYear:
    "Year provided cannot be from the future please provide a valid Year.",
};

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

function validateNumber(numberValue, variableName, greaterThanZero = "false") {
  if (numberValue === null) {
    throw new Error(ERRORS.nullNumber(variableName));
  }
  if (numberValue === undefined) {
    throw new Error(ERRORS.undefinedNumber(variableName));
  }
  if (typeof numberValue !== "number") {
    throw new Error(ERRORS.invalidNumberType(variableName));
  }

  if (greaterThanZero && numberValue <= 0) {
    throw new Error(ERRORS.numGreaterThanZero);
  }
}

function validateYear(year) {
  validateNumber(year, "Year", true);
  const currentYear = new Date().getFullYear;
  if (year > currentYear) {
    throw new Error(ERRORS.invalidYear);
  }
}

export { validateISBN, validateString, validateNumber };
