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

  yup.setLocale({
    string: {
      url: 'invalidUrl',
    },
    mixed: {
      required: 'emptyField',
    },
  });

  const schema = yup.object().shape({
    url: yup.string().required().url(),
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

  render(state, i18nextInstance, schema);
};
