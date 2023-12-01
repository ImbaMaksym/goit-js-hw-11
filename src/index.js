import { API_KEY } from './js/api';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 40;
let searchQuery = '';
let page = 1;
let totalImages = 0;
let totalHitsShown = false;

function handleFormSubmit(evt) {
  evt.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  searchQuery = form.searchQuery.value.trim();
  if (searchQuery === '') {
    return;
  }
  fetchPhoto(searchQuery);
}

async function fetchPhoto() {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    });
    const response = await axios.get(`${BASE_URL}?${params}`);
    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      gallery.innerHTML = '';
      return;
    } else {
      gallery.insertAdjacentHTML('beforeend', makeMarkup(hits));
      lightbox.refresh();
      totalImages += hits.length;
      if (!totalHitsShown) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        totalHitsShown = true;
      }
    }
    if (totalImages >= totalHits) {
      loadMoreObserver.disconnect();
      const messageElement = document.createElement('p');
      messageElement.textContent =
        "We're sorry, but you've reached the end of search results.";
      gallery.insertAdjacentElement('beforeend', messageElement);
    }
  } catch (error) {
    console.log(error);
    Notify.failure('Something went wrong. Please try again later.');
  }
}

function makeMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <div class="photo-card-container">
          <a class="photo-card-link" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
        </div>
        <div class="photo-card-info">
          <p class="info-item"><b>Likes</b> ${likes}</p>
          <p class="info-item"><b>Views</b> ${views}</p>
          <p class="info-item"><b>Comments</b> ${comments}</p>
          <p class="info-item"><b>Downloads</b> ${downloads}</p>
        </div>
      </div>`
    )
    .join(' ');
}

let lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', handleFormSubmit);

// Створення екземпляру Intersection Observer
const loadMoreObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    page += 1;
    fetchPhoto();
  }
});

// Початковий запуск Observer
loadMoreObserver.observe(document.querySelector('.load-more'));
