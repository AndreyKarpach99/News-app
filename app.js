// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newService = (function () {
  const apiKey = 'ac2cfac24a1943bfb8a9476845cb976f';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'ru', category = "business", cb) {
      http.get(`${apiUrl}/top-headlines?category=${category}&country=${country}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}category=${category}&apiKey=${apiKey}`,
        cb
      );
    }
  }
})();

// Elements

const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
})

//  init selects
document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
  loadNews();
});

// Load news function

function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newService.topHeadlines(country, category, onGetRespponce);
  } else {
    newService.everything(searchText, category, onGetRespponce);
  }



}

// function on get responce from server

function onGetRespponce(err, res) {
  removePreloader();
  if (err) {
    showAlert(err, 'error-msg');
  }

  if (!res.articles.length) {
    // show empty message
    showAlert('There are no results', 'error-msg');
    return;
  }

  console.log(res.articles.length)

  renderNews(res.articles);
}

// Function clear container

function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }

}

// Function show message

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type })
}

// Show loader function

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `)
}

// Remove loader function 

function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}

// Function render news

function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row');
  let fragment = "";

  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  })
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// News item template function 

function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>`;
}

