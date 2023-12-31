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

let observer = new IntersectionObserver(handleLoadMoreImages, options);

const pixabayReturnData = new PixabayAPI();

const lightbox = new SimpleLightbox('.photo-card a');

searchFormEl.addEventListener('submit', handleSearchImages);

async function handleSearchImages(e) {
  e.preventDefault();

  observer.unobserve(targetEl);
  pixabayReturnData.page = 1;
  galleryListEl.innerHTML = '';

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
    const {
      data: { total, totalHits, hits },
    } = await pixabayReturnData.searchImages();

    if (total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    galleryListEl.innerHTML = createGallaryCards(hits);

    lightbox.refresh();

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    observer.observe(targetEl);
  } catch (error) {
    console.log(error);
  }
}

function handleLoadMoreImages(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      pixabayReturnData.page += 1;

      try {
        const {
          data: { totalHits, hits },
        } = await pixabayReturnData.searchImages();

        galleryListEl.insertAdjacentHTML('beforeend', createGallaryCards(hits));

        smoothScroll();

        if (
          pixabayReturnData.page ===
          Math.ceil(totalHits / pixabayReturnData.per_page)
        ) {
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          observer.unobserve(targetEl);
        }

        lightbox.refresh();
      } catch (error) {
        console.log(error);
      }
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
