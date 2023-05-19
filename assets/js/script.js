const shortenerContainer = document.querySelector('.section-shorten');
const inputUrl = document.querySelector('.shortener__input');
const messageError = inputUrl.nextElementSibling;
const shortenButton = document.querySelector('#shortenButton');
const containerModal = document.querySelector('.container-modal');
const newLink = document.querySelector('.modal__new-link');
const arrayButtonsLinks = document.querySelectorAll('.buttons-links');
const buttonConfirm = document.querySelector('.button-confirm');
const buttonCancel = document.querySelector('.button-cancel');
const containerInput = document.querySelector('.shortener');

let linkReplaced;
const resultsArray = [];

function copyUrl({ target }) {
  const copyButton = target;
  const shortUrl = copyButton.previousElementSibling.innerText;

  navigator.clipboard.writeText(shortUrl);

  copyButton.innerText = 'Copied!';
  copyButton.style.backgroundColor = 'hsl(260, 8%, 14%)';
  setTimeout(() => {
    copyButton.innerText = 'Copy';
    copyButton.style.backgroundColor = 'hsl(180, 66%, 49%)';
  }, 2000)
}

function createResult(shortLink, originalLink) {
  const div = document.createElement('div');
  div.className = 'links';
  div.innerHTML = `
    <span class="links__normal">${originalLink}</span>
    <div>
      <span class="links__shortened">${shortLink}</span>
      <button class="button--cyan" id="copyButton">Copy</button>
    </div>
  `
  containerInput.insertAdjacentElement('afterend', div);
  resultsArray.unshift(originalLink);

  const copyButtonArray = document.querySelectorAll('#copyButton');
  copyButtonArray.forEach(button => {
    button.addEventListener('click', copyUrl);
  })
}

function replaceResult() {
  newLink.innerText = inputUrl.value;
}

function CheckNumbersResults(shortLink, originalLink) {
  if (resultsArray.length === 3) {
    replaceResult();
  } else {
    createResult(shortLink, originalLink);
  }
}

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

function linkReplacement() {
  const dataIndex = linkReplaced.dataset.index;
  const resultReplaced = document.querySelectorAll('.links')[dataIndex];
  shortenerContainer.removeChild(resultReplaced);
  resultsArray.splice(dataIndex, 1);
  containerModal.classList.remove('active');
  urlShortener();
}

shortenButton.addEventListener('click', urlShortener);
arrayButtonsLinks.forEach(button => {
  button.addEventListener('click', chosenLink)
});
buttonConfirm.addEventListener('click', linkReplacement);
buttonCancel.addEventListener('click', () => {
  containerModal.classList.remove('active');
});
