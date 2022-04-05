import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { setLocale } from 'yup';
import _ from 'lodash';
import ru from './locale-ru.js';
import watchedState from './view.js';
import parse from './parser.js';
import state from './state.js';

setLocale({
  mixed: {
    default: 'Ссылка должна быть валидным URL',
  },
});

const schema = yup.object().shape({
  url: yup.string().required().url(), // добавить регулярку на rss в конце
});

const httpRequest = (url) => axios
  .get(`https://allorigins.hexlet.app/raw?disableCache=true&url=${encodeURIComponent(url)}`);
const feedUrls = state.feeds.map((feed) => feed.url);

const filteredPosts = (currentFeedId) => state.posts
  .filter(({ feedId }) => feedId === currentFeedId);

const rssCheck = (feed) => {
  httpRequest(feed.url)
    .then((response) => {
      console.log('ответ!');
      const { postsArr } = parse(response.data);
      const stateTitles = filteredPosts(feed.id)
        .map((post) => post.title);
      console.log(stateTitles);
      const newPosts = postsArr
        .filter((post) => !stateTitles.includes(post.title));
      console.log(newPosts);
      if (newPosts.length !== 0) {
        const newPostsWithIds = newPosts
          .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
        console.log('here');
        watchedState.posts.unshift(...newPostsWithIds);
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
  return setTimeout(rssCheck, 5000, feed);
};

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
      .then(() => httpRequest(value))
      .then((response) => {
        if (feedUrls.includes(value)) {
          throw new Error('This feed has already been added');
        }
        const { feed, postsArr } = parse(response.data);
        feed.id = _.uniqueId();
        feed.url = value;
        const postsWithIds = postsArr
          .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
        watchedState.feeds.push(feed);
        watchedState.posts.push(...postsWithIds);
        return setTimeout(rssCheck, 5000, feed);
      })
      .catch((err) => {
        console.log(err.message);
        watchedState.form.valid = false;
        watchedState.form.errors.push(err.message);
      });
  });
};
