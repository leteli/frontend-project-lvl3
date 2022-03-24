import i18next from 'i18next';
import * as yup from 'yup';
import { setLocale } from 'yup';
import ru from './locale-ru.js';
import watchedState from './view.js';

setLocale({
  mixed: {
    default: 'Ссылка должна быть валидным URL',
  },
});

const schema = yup.object().shape({
  url: yup.string().required().url(), // добавить регулярку на rss в конце
});

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance(); // мб придется переместить инициализацию!
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: { ru },
  });
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    schema.validate({ url: value })
      .then(() => {
        watchedState.form.valid = !watchedState.feeds.includes(value);
        if (watchedState.form.valid) {
          watchedState.feeds.push(value);
        }
      })
      .catch((err) => {
        console.log(err.message);
        watchedState.form.valid = false;
        watchedState.form.errors.push(err.message);
      });
  });
};
