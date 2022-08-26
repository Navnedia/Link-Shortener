const URL_PATTERN = new RegExp('^(https?:\\/\\/)?'+ // protocol
'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
'(\\#[-a-z\\d_]*)?$','i'); // fragment locator


/**
 * Validates input data to see if it's a valid url string
 * @param data - data to validate for URL string
 * @returns boolean (true) if input valid url string
 */
export function validURL(data) {
  return !!URL_PATTERN.test(data);
}

/**
* Validates input data to see if it can saftly be used as
* the shortID, this means that it may only include 
* capital/lowercase letters, numbers, underscores, and
* dashes. These restrictions make the shortID more url 
* friendly. 
* @param data - data to validate
* @returns boolean (true) if input is URl safe
*/
export function validShortID(data) {
   return /^[a-zA-Z0-9_-]*$/.test(data);
}