import { PixabayAPI } from './pixabay-api';

const searchFormEl = document.querySelector('.search-form');
const galleryListEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

loadMoreBtnEl.hidden = true;

const pixabayReturn = new PixabayAPI();

searchFormEl.addEventListener('submit', handlerSearchImages);

function handlerSearchImages(e) {
  e.preventDefault();
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  const textInput = searchQuery.value.trim();
  if (!textInput) {
    console.log('!');
    return;
  }

  pixabayReturn.query = textInput;
  pixabayReturn
    .searchImages()
    .then(data => {
      if (data.total === 0) {
        console.log(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      console.log(data.total);

      function createGallaryCards(array) {
        return array
          .map(
            ({
              webformatURL,
              largeImageURL,
              tags,
              likes,
              views,
              comments,
              downloads,
            }) => `<li class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </li>`
          )
          .join('');
      }

      galleryListEl.innerHTML = createGallaryCards(data.hits);

      loadMoreBtnEl.hidden = false;
    })
    .catch(console.warm);
}

loadMoreBtnEl.addEventListener('click', handlerLoadMoreImages);

function handlerLoadMoreImages() {
  pixabayReturn.page += 1;
  pixabayReturn
    .searchImages()
    .then(data => {
      if (
        pixabayReturn.page === Math.ceil(data.total / pixabayReturn.per_page)
      ) {
        console.log(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtnEl.hidden = true;
      }

      function createGallaryCards(array) {
        return array
          .map(
            ({
              webformatURL,
              largeImageURL,
              tags,
              likes,
              views,
              comments,
              downloads,
            }) => `<li class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes</b>${likes}
          </p>
          <p class="info-item">
            <b>Views</b>${views}
          </p>
          <p class="info-item">
            <b>Comments</b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>${downloads}
          </p>
        </div>
      </li>`
          )
          .join('');
      }

      galleryListEl.insertAdjacentHTML(
        'beforeend',
        createGallaryCards(data.hits)
      );
    })
    .catch(console.warm);
}
