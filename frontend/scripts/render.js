const linkContainer = document.getElementById('linksContainer');

// const linkItem = document.createElement('link-item');
// linkItem.name = "";
// linkItem.shortID = "e6Mh9lp";
// linkItem.destination = "https://youtube.com";
// linkItem.link = "http://localhost:8080/G8MklsP";
// linkItem.clicks = "420";
// linkItem.created = new Date().toLocaleDateString();
// linkContainer.appendChild(linkItem);




let data;

//catch error?

await fetch('http://localhost:8080/api/shortlinks', {method: 'GET'})
    .then((response) => {
        return data = response.json();
    })
    .then((body) => {
        data = body;
    });

console.log(data);

// Validation is nneded!!!!!
if (Array.isArray(data)) {
    data.forEach((linkData) => {
        const linkItem = document.createElement('link-item');
        linkItem.setData(linkData);
        linkContainer.appendChild(linkItem);
    });
}



// async function test() {
//     const res = await fetch('http://localhost:8080/api/shortlinks/', {
//         method: 'GET'
//     }).catch(e => null);
    
//     if (res && res.ok) {
//         try {
//             const json = await res.json();
//             console.log(json);
//         } catch (e) {
//             throw 'An error occured.';
//         }
//     } else {
//         throw res && res.status == 401 ? 'Not logged in' : 'An error occured.';
//     }
// }

// test();