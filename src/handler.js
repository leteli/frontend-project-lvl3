import axios from 'axios';
import * as yup from 'yup';
import { setLocale } from 'yup';
import _ from 'lodash';
import parse from './parser.js';

setLocale({
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

const httpRequest = (url) => {
  const inputUrl = new URL(url);
  return axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${inputUrl}`) // сделать объект урл!
    .catch(() => {
      throw new Error('networkError');
    });
};

const rssCheck = (feed, watchedState) => {
  httpRequest(feed.url)
    .then((response) => {
      console.log('ответ!');
      const { postsArr } = parse(response.data.contents);
      console.log(watchedState);
      const filteredPosts = watchedState.posts
        .filter(({ feedId }) => feedId === feed.id);
      const stateTitles = filteredPosts
        .map((post) => post.title);
      console.log(stateTitles);
      const newPosts = postsArr
        .filter((post) => !stateTitles.includes(post.title));
      console.log(newPosts);
      if (newPosts.length !== 0) {
        const newPostsWithIds = newPosts
          .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
        watchedState.posts.unshift(...newPostsWithIds);
      }
    });
  return setTimeout(rssCheck, 5000, feed, watchedState);
};

export default (watchedState) => {
  const value = watchedState.form.inputUrl;
  const feedUrls = watchedState.feeds.map((feed) => feed.url);
  schema.validate({ url: value })
    .then(() => httpRequest(value))
    .then((response) => {
      if (feedUrls.includes(value)) {
        throw new Error('rssExists');
      }
      const { feed, postsArr } = parse(response.data.contents);
      feed.id = _.uniqueId();
      feed.url = value;
      const postsWithIds = postsArr
        .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
      watchedState.feeds.push(feed);
      watchedState.posts.push(...postsWithIds);
      watchedState.form.valid = true;
      return setTimeout(rssCheck, 5000, feed, watchedState);
    })
    .catch((err) => {
      console.log(err.message);
      watchedState.form.valid = false;
      switch (err.message) {
        case 'invalidRss':
          watchedState.form.error = 'form.errors.invalidRss';
          break;
        case 'invalidUrl':
          watchedState.form.error = 'form.errors.invalidUrl';
          break;
        case 'emptyField':
          watchedState.form.error = 'form.errors.empty';
          break;
        case 'rssExists':
          watchedState.form.error = 'form.errors.rssExists';
          break;
        case 'networkError':
          watchedState.form.error = 'networkError';
          break;
        default:
          throw new Error('Неизвестная ошибка');
      }
    });
};
