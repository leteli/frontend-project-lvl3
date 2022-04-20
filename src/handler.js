import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import parse from './parser.js';

const validate = (urls, value) => {
  const schema = yup.object().shape({
    url: yup.string().required().url().notOneOf(urls),
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
    if (newPosts.length !== 0) {
      const newPostsWithIds = newPosts
        .map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
      watchedState.posts.unshift(...newPostsWithIds);
    }
    setTimeout(rssCheck, 5000, feed, watchedState);
  });

export default (watchedState) => {
  const urlValue = watchedState.form.inputUrl;
  const feedUrls = watchedState.feeds.map((feed) => feed.url);
  validate(feedUrls, urlValue)
    .then(() => {
      watchedState.form.state = 'processing';
      return axios.get(addProxy(urlValue));
    })
    .then((response) => {
      watchedState.form.valid = true;
      const { feed, postsArr } = parse(response.data.contents);
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
      if (err.isAxiosError) {
        watchedState.form.error = 'networkError';
        watchedState.form.state = 'failed';
        return;
      }
      if (err.name === 'ValidationError') {
        watchedState.form.error = `form.errors.${err.message}`;
        watchedState.form.valid = false;
      }
      if (err.name === 'ParserError') {
        watchedState.form.error = 'form.errors.invalidRss';
        watchedState.form.state = 'failed';
      }
    });
};
