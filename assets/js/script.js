const shortenerContainer = document.querySelector('.section-shorten');
const inputUrl = document.querySelector('.shortener__input');
const messageError = inputUrl.nextElementSibling;
const shortenButton = document.querySelector('#shortenButton');

async function urlShortener() {
  const url = inputUrl.value;

  try {
    const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);
    const json = await response.json();

    const shortLink = json.result.full_short_link;
    const originalLink = json.result.original_link;

    createResult(shortLink, originalLink);
    
    messageError.style.display = 'none';
  }
  catch (error) {
    console.log(error);
    messageError.style.display = 'flex';
  }
}