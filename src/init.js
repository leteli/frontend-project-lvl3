import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { setLocale } from 'yup';
import ru from './locale-ru.js';
import watchedState from './view.js';
import parse from './parser.js';

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
        const valueUrl = new URL(value);
        return axios.get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${valueUrl}`);
      })
      .then((response) => {
        if (watchedState.feedsUrl.includes(value)) {
          throw new Error('This feed has already been added');
        }
        watchedState.feedsUrl.push(value);
        console.log(response.data);
        const { feed, postsArr } = parse(response.data);
        watchedState.feeds.push(feed);
        watchedState.posts.push(...postsArr);
        console.log(watchedState.feeds);
        console.log(feed);
        console.log(watchedState.posts);
        console.log(postsArr);
      })
      .catch((err) => {
        console.log(err.message);
        watchedState.form.valid = false;
        watchedState.form.errors.push(err.message);
      });
  });
};
