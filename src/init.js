import i18next from 'i18next';
import * as yup from 'yup';
import ru from './locale-ru.js';
import render from './view.js';

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: { ru },
  });

  const state = {
    form: {
      state: 'filling',
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

  yup.setLocale({
    string: {
      url: 'form.errors.invalidUrl',
    },
    mixed: {
      required: 'form.errors.empty',
      notOneOf: 'form.errors.rssExists',
    },
  });

  render(state, i18nextInstance);
};
