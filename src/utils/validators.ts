/**
 * Validates input data to see if it's a valid url string
 * @param data - data to validate for URL string
 * @returns boolean (true) if input valid url string
 */
export function validURL(data): boolean {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(data);
}

/**
 * Checks if the input is a string
 * @param data - data to validated
 * @returns boolean (true) if input is string
 */
export function isString(data): boolean {
    return typeof data === 'string';
}

/**
 * Checks if the input is a string and not empty
 * @param data - data to validated
 * @returns boolean (true) if input is string and not empty
 */
export function stringNotEmpty(data): boolean {
    return isString(data) && data.trim() !== '';
}

/**
 * If data exists, validation must pass.
 * @param data - data to validated
 * @param validation Validator function result
 */
export function optional(data, validation: boolean): boolean {
    if (!data && data !== '') return true; // If data doesn't exist, thats fine cause it's optional.
    return validation; // If the data does exist then it must pass the validation.
}

/**
 * If data exists, validation must pass. This instead takes the 
 * validator function itself as the input to reduce the syntax 
 * required to call it, but this doesn't work with nested validator requests.
 * 
 * @param data - data to validated
 * @param validation Validator to run
 */
export function optionalFunc(data, validator: Function): boolean {
    if (!data && data !== '') return true; // If data doesn't exist, thats fine cause it's optional.
    return validator(data); // If the data does exist then it must pass the validation.
}



//? Tests:

// console.log("\n Group 1:");

// console.log(isString(null)); // false
// console.log(isString({})); // false
// console.log(isString(69)); // false
// console.log(isString('')); // true
// console.log(isString(' Aiden ')); // true
// console.log(isString('Aiden')); // true

// console.log("\n Group 2:");

// console.log(stringNotEmpty(null)); // false
// console.log(stringNotEmpty({})); // false
// console.log(stringNotEmpty(69)); // false
// console.log(stringNotEmpty('')); // false
// console.log(stringNotEmpty(' Aiden ')); // true
// console.log(stringNotEmpty('Aiden')); // true

// console.log("\n Group 3:");

// console.log(optional({}, stringNotEmpty({}))); // false
// console.log(optional(96, stringNotEmpty(69))); // false
// console.log(optional('', stringNotEmpty(''))); // false
// console.log(optional(null, stringNotEmpty(null))); // true
// console.log(optional(' Aiden ', stringNotEmpty(' Aiden '))); // true
// console.log(optional('Aiden', stringNotEmpty('Aiden'))); // true
 
// console.log("\n Group 4:");

// console.log(optionalFunc({}, stringNotEmpty)); // false
// console.log(optionalFunc(96, stringNotEmpty)); // false
// console.log(optionalFunc('', stringNotEmpty)); // false
// console.log(optionalFunc(null, stringNotEmpty)); // true
// console.log(optionalFunc(' Aiden ', stringNotEmpty)); // true
// console.log(optionalFunc('Aiden', stringNotEmpty)); // true

// console.log("\n Group 5:");

// console.log(validURL(null)); // false
// console.log(validURL({})); // false
// console.log(validURL(69)); // false
// console.log(validURL('Aiden')); // false
// console.log(validURL('google.com')); // true
// console.log(validURL('https://google.com')); // true
