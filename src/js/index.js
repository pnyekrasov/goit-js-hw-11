import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PixabayAPI } from './pixabay-api';

const searchFormEl = document.querySelector('.search-form');
const galleryListEl = document.querySelector('.gallery');
const targetEl = document.querySelector('.js-load-line');

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

const pixabayReturnData = new PixabayAPI();

searchFormEl.addEventListener('submit', handlerSearchImages);

function handlerSearchImages(e) {
  e.preventDefault();
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
  pixabayReturnData
    .searchImages()
    .then(data => {
      console.log(data);
      if (data.total === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      galleryListEl.innerHTML = createGallaryCards(data.hits);
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      observer.observe(targetEl);
      // const lightbox = new SimpleLightbox('.photo-card a');
      // lightbox.open();
    })
    .catch(error => console.log(error));
}

let observer = new IntersectionObserver(handlerLoadMoreImages, options);

function handlerLoadMoreImages(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      pixabayReturnData.page += 1;
      pixabayReturnData
        .searchImages()
        .then(
          data => {
            if (
              pixabayReturnData.page ===
              Math.ceil(data.totalHits / pixabayReturnData.per_page)
            ) {
              Notiflix.Notify.info(
                "We're sorry, but you've reached the end of search results."
              );
              observer.unobserve(targetEl);
            }

            galleryListEl.insertAdjacentHTML(
              'beforeend',
              createGallaryCards(data.hits)
            );

            // lightbox.refresh();
            const lightbox = new SimpleLightbox('.photo-card a');
          }
          // const { height: cardHeight } = document
          //   .querySelector(".gallery")
          //         .firstElementChild.getBoundingClientRect();
          //       console.log(cardHeight);

          //     })
        )
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
