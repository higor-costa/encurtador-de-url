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
const iconMenu = document.querySelector('#nav__icon-menu');
const menu = document.querySelector('.nav-items');

let linkReplaced;
let arrayStorage;
const resultsArray = [];

// Função para copiar a URL encurtada para a área de transferência
function copyUrl({ target }) {
  const copyButton = target;
  const shortUrl = copyButton.previousElementSibling.innerText;

  // Copia o URL curto para a área de transferência do navegador
  navigator.clipboard.writeText(shortUrl);

  // Altera o texto e o estilo do botão 'Copy' para indicar que a cópia foi realizada com sucesso
  copyButton.innerText = 'Copied!';
  copyButton.style.backgroundColor = 'hsl(260, 8%, 14%)';

  // Define um atraso de 2 segundos antes de restaurar o texto e estilo original do botão
  setTimeout(() => {
    copyButton.innerText = 'Copy';
    copyButton.style.backgroundColor = 'hsl(180, 66%, 49%)';
  }, 2000)
}

// Função para criar um novo resultado de link encurtado e adicioná-lo ao DOM
function createResult(shortLink, originalLink) {
  const div = document.createElement('div');
  div.className = 'links';
  div.innerHTML = `
    <span class="links__normal text-ellipsis">${originalLink}</span>
    <div>
      <span class="links__shortened">${shortLink}</span>
      <button class="button--cyan" id="copyButton">Copy</button>
    </div>
  `

  // Insere o elemento div logo após o elemento 'containerInput'
  containerInput.insertAdjacentElement('afterend', div);

  // Adiciona o link original ao início do array 'resultsArray'
  resultsArray.unshift(originalLink);

  const copyButtonArray = document.querySelectorAll('#copyButton');
  copyButtonArray.forEach(button => {
    button.addEventListener('click', copyUrl);
  })
}

// Retorna os dados do armazenamento local, convertidos de volta em um array.
// Se nenhum dado for encontrado na Local Storage, retorna um array vazio.
const getLocalStorage = () => JSON.parse(localStorage.getItem('links')) ?? [];

// Armazena um array no armazenamento local, convertendo-o em uma string JSON.
const setLocalStorage = () => localStorage.setItem('links', JSON.stringify(arrayStorage));

// Função para enviar um objeto de links para o armazenamento local
function sendLinksStorage(linksObject) {
  arrayStorage = getLocalStorage();
  arrayStorage.unshift(linksObject);
  setLocalStorage();
}

// Função para excluir links do armazenamento local
function deleteLinksStorage(index) {
  arrayStorage = getLocalStorage();
  arrayStorage.splice(index, 1);
  setLocalStorage();
}

// Obtém os dados armazenados na Local Storage e cria resultados com base nesses dados.
// Os resultados são criados chamando a função 'createResult' para cada objeto de links armazenado.
function getLinksStorage() {
  if(window.localStorage.length) {
    arrayStorage = getLocalStorage();
    // Itera sobre cada objeto de links no array
    arrayStorage.forEach((linksObject) => {
      // Extrai as propriedades 'shortLink' e 'originalLink' do objeto
      const { shortLink, originalLink } = linksObject;
      createResult(shortLink, originalLink);
    })
  }
}

// Função para controlar o estilo dos elementos do modal
function modalElementsStyle(openModal) {
  if(openModal) {
    // Aplica a cor de fundo padrão aos botões sempre que o modal for aberto
    arrayButtonsLinks.forEach(button => {
      const linkCyanButton = button;
      linkCyanButton.style.backgroundColor = 'rgb(42, 207, 207)';
    });
    containerModal.classList.add('active');
  }
  else {
    buttonConfirm.classList.remove('enabled');
    buttonConfirm.setAttribute('disabled', '');
    containerModal.classList.remove('active');
  }
}

// Função para atualizar dados do modal e depois abri-lo
function replaceResult() {
  newLink.innerText = inputUrl.value;

  resultsArray.forEach((link, index) => {
    // Define o texto de cada botão de link, presente no modal, com o link original correspondente
    arrayButtonsLinks[index].innerText = link;
  });

  containerModal.classList.add('active');
  modalElementsStyle(true)
}

// Marca o link selecionado para ser substituído e habilita o botão de confirmação.
function chosenLink({target}) {
  const darkLinkButton = target;
  buttonConfirm.classList.add('enabled');
  buttonConfirm.removeAttribute('disabled');

  // Aplica a cor de fundo padrão aos botões sempre que um botão for clicado
  modalElementsStyle(true)

  // Destaca o botão clicado com uma cor de fundo diferente
  darkLinkButton.style.backgroundColor = 'rgb(35, 33, 39)';
  linkReplaced = darkLinkButton;
}

function CheckNumbersResults(shortLink, originalLink) {
  if (resultsArray.length === 3) {
    replaceResult();
  } else {
    createResult(shortLink, originalLink);
    const linksObject = {shortLink, originalLink};
    sendLinksStorage(linksObject);
  }
}

function shortenerErrorMessage(active) {
  if (active) messageError.classList.add('active');
  else messageError.classList.remove('active');
}

async function urlShortener() {
  const url = inputUrl.value;

  try {
    const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);

    if(!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);      
    }
    
    const json = await response.json();
    const shortLink = json.result.full_short_link;
    const originalLink = json.result.original_link;

    CheckNumbersResults(shortLink, originalLink);
    shortenerErrorMessage(false);
  }
  catch (error) {
    if (inputUrl.value === '') messageError.innerText = 'Please add a link';
    else messageError.innerText = error;

    shortenerErrorMessage(true);
  }
}

function linkReplacement() {
  const dataIndex = linkReplaced.dataset.index;
  deleteLinksStorage(dataIndex);
  const resultReplaced = document.querySelectorAll('.links')[dataIndex];
  shortenerContainer.removeChild(resultReplaced);
  resultsArray.splice(dataIndex, 1);
  modalElementsStyle(false);
  urlShortener();
}

iconMenu.addEventListener('click', () => {
  menu.classList.toggle('active');
});
shortenButton.addEventListener('click', urlShortener);
arrayButtonsLinks.forEach(button => {
  button.addEventListener('click', chosenLink)
});
buttonConfirm.addEventListener('click', linkReplacement);
buttonCancel.addEventListener('click', () => {
  modalElementsStyle(false);
});
window.addEventListener('load', getLinksStorage);