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