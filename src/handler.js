import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import parse from './parser.js';

const validate = (watchedState, value) => {
  const schema = yup.object().shape({
    url: yup.string().required().url().notOneOf(watchedState.feeds.map((feed) => feed.url)),
  });
  return schema.validate({ url: value });
};

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const rssCheck = (feed, watchedState) => axios
  .get(addProxy(feed.url))
  .then((response) => {
    const { postsArr } = parse(response.data.contents);
    const filteredPosts = watchedState.posts
      .filter(({ feedId }) => feedId === feed.id);
    const stateTitles = filteredPosts
      .map((post) => post.title);
    const newPosts = postsArr
      .filter((post) => !stateTitles.includes(post.title));
    console.log(newPosts);
    if (newPosts.length !== 0) {
      const newPostsWithIds = newPosts
        .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
      watchedState.posts.unshift(...newPostsWithIds);
    }
  })
  .then(() => setTimeout(rssCheck, 5000, feed, watchedState));

export default (watchedState) => {
  const urlValue = watchedState.form.inputUrl;
  validate(watchedState, urlValue)
    .then(() => {
      watchedState.form.state = 'processing';
      return axios.get(addProxy(urlValue));
    })
    .then((response) => {
      const { feed, postsArr } = parse(response.data.contents);
      watchedState.form.valid = true;
      feed.id = _.uniqueId();
      feed.url = urlValue;
      const postsWithIds = postsArr
        .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
      watchedState.feeds.push(feed);
      watchedState.posts.push(...postsWithIds);
      watchedState.form.state = 'processed';
      return setTimeout(rssCheck, 5000, feed, watchedState);
    })
    .catch((err) => {
      console.log(err.message);
      if (err.isAxiosError) {
        watchedState.form.error = 'networkError';
        watchedState.form.state = 'failed';
        return;
      }
      watchedState.form.valid = false;
      switch (err.message) {
        case 'invalidRss':
          watchedState.form.error = 'form.errors.invalidRss';
          watchedState.form.state = 'failed';
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
        default:
          throw new Error('Unknown error!');
      }
    });
};
