let ERRORS = {
    nullISBN: "ISBN cannot be null. Please provide a valid ISBN",
    undefinedISBN: "ISBN cannot be undefined. Please provide a valid ISBN",
    invalidISBNType: "Invalid ISBN type. Please provide a string.",
    invalidISBNLength: "Invalid ISBN length. Please provide an ISBN with 13 digits",
}

function validateISBN(isbn){
    if (isbn === null) {
        throw new Error(ERRORS.nullISBN);
    }
    if (isbn === undefined) {
        throw new Error(ERRORS.undefinedISBN);
    }
    if (typeof (isbn) !== "string") {
        throw new Error(ERRORS.invalidISBNType);
    }

    let cleanedISBN = isbn.replace(/[\s-]/g,"");

    if(cleanedISBN.length !== 13){
        throw new Error(ERRORS.invalidISBNLength);
    }

}

export {validateISBN};