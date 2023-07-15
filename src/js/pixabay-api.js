'use strict';
import axios from 'axios';

export class PixabayAPI {
  #API_KAY = '38184574-73f03994b4792e0e0e3ddcdab';
  #BASE_URL = 'https://pixabay.com/api/';
  #CONST_PARAMETERS = 'image_type=photo&orientation=horizontal&safesearch=true';

  query = null;
  page = 1;
  per_page = 40;

  searchImages() {
    return axios.get(
      `${this.#BASE_URL}?key=${this.#API_KAY}&q=${this.query}&${
        this.#CONST_PARAMETERS
      }&page=${this.page}&per_page=${this.per_page}`
    );
  }
}
