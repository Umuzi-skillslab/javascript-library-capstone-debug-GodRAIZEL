import {
    validateISBN,
    validateString,
    validateNumber,
    validateYear,
    validateInteger,
    validateEmail,
    validateDate,
    validateMembershipType,
    validateArray,
    validateObject,
} from '../src/utils.js';

describe('validateISBN', () => {
    test('accepts a valid 13-digit ISBN (no separators)', () => {
        expect(() => validateISBN('9780547928227')).not.toThrow();
    });

    test('accepts a valid 13-digit ISBN with hyphens and spaces', () => {
        expect(() => validateISBN('978-0-547-92822-7')).not.toThrow();
        expect(() => validateISBN('978 0547928227')).not.toThrow();
    });

    test('throws when ISBN length (after cleaning) is not 13', () => {
        expect(() => validateISBN('123456789012')).toThrow('Invalid ISBN length. Please provide an ISBN with 13 digits');
        expect(() => validateISBN('978-0-123')).toThrow('Invalid ISBN length. Please provide an ISBN with 13 digits');
    });

    test('throws when ISBN is null or undefined (delegates to validateString)', () => {
        expect(() => validateISBN(null)).toThrow('ISBN cannot be null. Please provide a valid string for ISBN');
        expect(() => validateISBN(undefined)).toThrow('ISBN cannot be undefined. Please provide a valid string for ISBN');
    });

    test('throws when ISBN is not a string', () => {
        expect(() => validateISBN(9780547928227)).toThrow('Invalid type for ISBN. Please provide a valid string.');
        expect(() => validateISBN({})).toThrow('Invalid type for ISBN. Please provide a valid string.');
    });
});

describe('validateString', () => {
    test('accepts a normal non-empty string', () => {
        expect(() => validateString('hello', 'TestVar')).not.toThrow();
    });

    test('throws when string is null or undefined', () => {
        expect(() => validateString(null, 'X')).toThrow('X cannot be null. Please provide a valid string for X');
        expect(() => validateString(undefined, 'X')).toThrow('X cannot be undefined. Please provide a valid string for X');
    });

    test('throws when value is not a string', () => {
        expect(() => validateString(123, 'NumVar')).toThrow('Invalid type for NumVar. Please provide a valid string.');
        expect(() => validateString({}, 'ObjVar')).toThrow('Invalid type for ObjVar. Please provide a valid string.');
    });

    test('throws when string is empty or whitespace only', () => {
        expect(() => validateString('', 'EmptyVar')).toThrow('Cannot have empty string for EmptyVar. Please provide a valid string for EmptyVar');
        expect(() => validateString('   ', 'SpaceVar')).toThrow('Cannot have empty string for SpaceVar. Please provide a valid string for SpaceVar');
    });
});

describe('validateNumber', () => {
    test('accepts valid numbers (non-greaterThanZero mode)', () => {
        expect(() => validateNumber(0, 'N')).not.toThrow();
        expect(() => validateNumber(3.14, 'Pi')).not.toThrow();
        expect(() => validateNumber(1, 'One', false)).not.toThrow();
    });

    test('throws when number is null or undefined', () => {
        expect(() => validateNumber(null, 'N')).toThrow('N cannot be null. Please provide a valid number for N');
        expect(() => validateNumber(undefined, 'N')).toThrow('N cannot be undefined. Please provide a valid number for N');
    });

    test('throws when value is not a number or is NaN', () => {
        expect(() => validateNumber('5', 'N')).toThrow('Invalid type for N. Please provide a value of type Number for N');
        expect(() => validateNumber({}, 'N')).toThrow('Invalid type for N. Please provide a value of type Number for N');
        expect(() => validateNumber(NaN, 'N')).toThrow('Invalid type for N. Please provide a value of type Number for N');
    });

    test('throws when number is less than zero (non-greaterThanZero mode)', () => {
        expect(() => validateNumber(-1, 'N')).toThrow('N must not be less than zero. Please provide a valid number for N');
    });

    test('greaterThanZero flag enforces > 0', () => {
        expect(() => validateNumber(0, 'N', true)).toThrow('N must be greater than zero. Please provide a valid number for N');
        expect(() => validateNumber(-5, 'N', true)).toThrow('N must be greater than zero. Please provide a valid number for N');
        expect(() => validateNumber(2, 'N', true)).not.toThrow();
    });
});

describe('validateInteger', () => {
    test('accepts integer values', () => {
        expect(() => validateInteger(0, 'I')).not.toThrow();
        expect(() => validateInteger(5, 'I')).not.toThrow();
    });

    test('throws when not an integer', () => {
        expect(() => validateInteger(3.14, 'I')).toThrow('Please provide a valid integer value for I.');
    });

    test('throws when integer is NaN or non-number', () => {
        expect(() => validateInteger(NaN, 'I')).toThrow('Invalid type for I. Please provide a value of type Number for I');
        expect(() => validateInteger('7', 'I')).toThrow('Invalid type for I. Please provide a value of type Number for I');
    });

    test('throws when integer is null/undefined', () => {
        expect(() => validateInteger(null, 'I')).toThrow('I cannot be null. Please provide a valid number for I');
        expect(() => validateInteger(undefined, 'I')).toThrow('I cannot be undefined. Please provide a valid number for I');
    });
});

describe('validateYear', () => {
    test('accepts a valid past or current year', () => {
        const current = new Date().getFullYear();
        expect(() => validateYear(current)).not.toThrow();
        expect(() => validateYear(current - 10)).not.toThrow();
    });

    test('throws for future years', () => {
        const future = new Date().getFullYear() + 1;
        expect(() => validateYear(future)).toThrow('Year provided cannot be from the future please provide a valid Year.');
    });

    test('throws for non-integer years', () => {
        expect(() => validateYear(2000.5)).toThrow('Please provide a valid integer value for Year.');
    });

    test('throws when year is zero (greaterThanZero enforced)', () => {
        expect(() => validateYear(0)).toThrow('Year must be greater than zero. Please provide a valid number for Year');
    });
});

describe('validateEmail', () => {
    test('accepts valid emails', () => {
        expect(() => validateEmail('john.doe@example.com')).not.toThrow();
        expect(() => validateEmail('a@b.co')).not.toThrow();
    });

    test('throws for invalid email formats', () => {
        expect(() => validateEmail('not-an-email')).toThrow('Invalid email. Please provide a valid email.');
        expect(() => validateEmail('missing@domain')).toThrow('Invalid email. Please provide a valid email.');
    });

    test('delegates to validateString for null/undefined', () => {
        expect(() => validateEmail(null)).toThrow('Email cannot be null. Please provide a valid string for Email');
        expect(() => validateEmail(undefined)).toThrow('Email cannot be undefined. Please provide a valid string for Email');
    });
});

describe('validateDate', () => {
    test('accepts valid past dates (ISO string)', () => {
        expect(() => validateDate('2000-01-01')).not.toThrow();
    });

    test('accepts valid current date string', () => {
        expect(() => validateDate(new Date().toISOString())).not.toThrow();
    });

    test('throws for invalid date strings (after string validation)', () => {
        expect(() => validateDate('not-a-date')).toThrow('Invalid date. Please select a valid date.');
    });

    test('throws for empty string because validateString is called first (Join Date)', () => {
        expect(() => validateDate('')).toThrow('Cannot have empty string for Join Date. Please provide a valid string for Join Date');
    });

    test('throws for null and undefined (delegated messages reference Join Date)', () => {
        expect(() => validateDate(null)).toThrow('Join Date cannot be null. Please provide a valid string for Join Date');
        expect(() => validateDate(undefined)).toThrow('Join Date cannot be undefined. Please provide a valid string for Join Date');
    });

    test('throws when date argument is not a string (invalid type for Join Date)', () => {
        expect(() => validateDate(123)).toThrow('Invalid type for Join Date. Please provide a valid string.');
    });

    test('throws for future dates', () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);
        expect(() => validateDate(future.toISOString())).toThrow('Invalid date. Date cannot be from the future.');
    });
});

describe('validateMembershipType', () => {
    test('accepts valid membership types (lowercase)', () => {
        expect(() => validateMembershipType('standard')).not.toThrow();
        expect(() => validateMembershipType('premium')).not.toThrow();
    });

    test('throws for invalid membership types or wrong case', () => {
        expect(() => validateMembershipType('Standard')).toThrow("Invalid membership type. Valid membership types are 'Standard' or 'Premium'");
        expect(() => validateMembershipType('gold')).toThrow("Invalid membership type. Valid membership types are 'Standard' or 'Premium'");
    });

    test('delegates to validateString for null/undefined', () => {
        expect(() => validateMembershipType(null)).toThrow('Membership Type cannot be null. Please provide a valid string for Membership Type');
        expect(() => validateMembershipType(undefined)).toThrow('Membership Type cannot be undefined. Please provide a valid string for Membership Type');
    });
});

describe('validateArray', () => {
    test('accepts arrays', () => {
        expect(() => validateArray([], 'Arr')).not.toThrow();
        expect(() => validateArray([1, 2, 3], 'Arr')).not.toThrow();
    });

    test('throws for null/undefined', () => {
        expect(() => validateArray(null, 'Arr')).toThrow('Arr cannot be null. Please provide a valid array.');
        expect(() => validateArray(undefined, 'Arr')).toThrow('Arr cannot be undefined. Please provide a valid array.');
    });

    test('throws when not an array', () => {
        expect(() => validateArray({}, 'Arr')).toThrow('Please enter a valid array for Arr');
        expect(() => validateArray('string', 'Arr')).toThrow('Please enter a valid array for Arr');
    });
});

describe('validateObject', () => {
    test('accepts plain objects', () => {
        expect(() => validateObject({}, 'Obj')).not.toThrow();
        expect(() => validateObject({ a: 1 }, 'Obj')).not.toThrow();
    });

    test('throws for null/undefined', () => {
        expect(() => validateObject(null, 'Obj')).toThrow('Obj cannot be null. Please provide a valid object.');
        expect(() => validateObject(undefined, 'Obj')).toThrow('Obj cannot be undefined. Please provide a valid object.');
    });

    test('throws for arrays and non-object types', () => {
        expect(() => validateObject([], 'Obj')).toThrow('Please enter a valid object for Obj');
        expect(() => validateObject('str', 'Obj')).toThrow('Please enter a valid object for Obj');
        expect(() => validateObject(123, 'Obj')).toThrow('Please enter a valid object for Obj');
    });

    test('throws for functions (non-object)', () => {
        expect(() => validateObject(() => { }, 'Obj')).toThrow('Please enter a valid object for Obj');
    });
});