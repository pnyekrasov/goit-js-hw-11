import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './pixabay-api';

const searchFormEl = document.querySelector('.search-form');
const galleryListEl = document.querySelector('.gallery');
let targetEl = document.querySelector('.js-guard');

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1,
};

let observer = new IntersectionObserver(handlerLoadMoreImages, options);

const pixabayReturnData = new PixabayAPI();

const lightbox = new SimpleLightbox('.photo-card a');

searchFormEl.addEventListener('submit', handlerSearchImages);

async function handlerSearchImages(e) {
  e.preventDefault();

  pixabayReturnData.page = 1;
  galleryListEl.innerHTML = '';
  observer.unobserve(targetEl);

  const {
    elements: { searchQuery },
  } = e.currentTarget;
  const textInput = searchQuery.value.trim();
  if (!textInput) {
    Notiflix.Notify.failure(
      'Enter the data in the field "Search images...", please'
    );
    return;
  }

  pixabayReturnData.query = textInput;

  try {
    const { data } = await pixabayReturnData.searchImages();

    if (data.total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    galleryListEl.innerHTML = createGallaryCards(data.hits);

    lightbox.refresh();

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    observer.observe(targetEl);
  } catch (error) {
    console.log(error);
  }
}

function handlerLoadMoreImages(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      pixabayReturnData.page += 1;

      pixabayReturnData
        .searchImages()
        .then(({ data }) => {
          galleryListEl.insertAdjacentHTML(
            'beforeend',
            createGallaryCards(data.hits)
          );

          if (
            pixabayReturnData.page ===
            Math.ceil(data.totalHits / pixabayReturnData.per_page)
          ) {
            Notiflix.Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            observer.unobserve(targetEl);
          }

          smoothScroll();

          lightbox.refresh();
        })
        .catch(error => console.log(error));
    }
  });
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
       <a class="photo-large" href="${largeImageURL}">
        <img class="photo" src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
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

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
