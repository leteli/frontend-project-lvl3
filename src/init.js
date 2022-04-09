import i18next from 'i18next';
import ru from './locale-ru.js';
import render from './view.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance(); // мб придется переместить инициализацию!
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: { ru },
  });

  const state = {
    form: {
      valid: '',
      error: '',
      inputUrl: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      clickedPost: {},
      readPostsIds: [],
    },
  };

  render(state, i18nextInstance);
};
