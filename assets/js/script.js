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

// Função para verificar a quantidade de resultados existentes e executar a ação apropriada.
function CheckNumbersResults(shortLink, originalLink) {
  if (resultsArray.length === 3) {
    // Se já existem 3 resultados, abre o modal para o usuário
    // escolher qual deles deve ser substituído pelo novo resultado
    replaceResult();
  } else {
    // Cria um novo resultado
    createResult(shortLink, originalLink);
    const linksObject = {shortLink, originalLink};
    // Atualiza o armazenamento local com o novo objeto de links
    sendLinksStorage(linksObject);
  }
}

// Função para controlar a exibição da mensagem de erro
function shortenerErrorMessage(active) {
  if (active) messageError.classList.add('active');
  else messageError.classList.remove('active');
}

// Função para encurtar uma URL informada pelo usuário usando a API de encurtamento.
async function urlShortener() {
  const url = inputUrl.value;

  // Envia uma requisição para a API de encurtamento
  try {
    const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);

    if(!response.ok) {
      // Se a resposta não for bem-sucedida, obtém os dados de erro da resposta
      const errorData = await response.json();
      throw new Error(errorData.error);      
    }
    
    // Extrai o link curto e o link original da resposta JSON
    const json = await response.json();
    const shortLink = json.result.full_short_link;
    const originalLink = json.result.original_link;

    CheckNumbersResults(shortLink, originalLink);
    shortenerErrorMessage(false);
  }
  // Manipula erros ocorridos durante a execução
  catch (error) {
    // Se a URL de entrada estiver vazia, exibe uma mensagem de erro específica
    if (inputUrl.value === '') messageError.innerText = 'Please add a link';
    // Caso contrário, exibe a mensagem de erro capturada
    else messageError.innerText = error;

    shortenerErrorMessage(true);
  }
}

// Função para substituir um link encurtado por outro.
function linkReplacement() {
  // Obtém o index do link substituído a partir do
  // atributo "data-index" do elemento "linkReplaced"
  const dataIndex = linkReplaced.dataset.index;

  // Chama a função deleteLinksStorage para remover o link substituído do armazenamento local
  deleteLinksStorage(dataIndex);

  // Obtém a div correspondente ao link substituído
  const resultReplaced = document.querySelectorAll('.links')[dataIndex];

  // Remove a div do DOM
  shortenerContainer.removeChild(resultReplaced);

  // Remove o link substituído do array "resultsArray"
  resultsArray.splice(dataIndex, 1);

  modalElementsStyle(false);
  urlShortener();
}

// Eventos

// Controla a exibição do menu de navegação
iconMenu.addEventListener('click', () => {
  menu.classList.toggle('active');
});

// Chama a função para encurtamento de URL
shortenButton.addEventListener('click', urlShortener);

// Chama a função que informa o link a ser substituido
arrayButtonsLinks.forEach(button => {
  button.addEventListener('click', chosenLink)
});

// Chama a função para substituíção de link
buttonConfirm.addEventListener('click', linkReplacement);

// Fecha o modal
buttonCancel.addEventListener('click', () => {
  modalElementsStyle(false);
});

// Chama a função para verificar o armazenamento local assim que a página é carregada
window.addEventListener('load', getLinksStorage);