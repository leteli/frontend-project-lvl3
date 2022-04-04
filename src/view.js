import onChange from 'on-change';
import state from './state.js';
import './style.css';

const watchedState = onChange(state, (path, value) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedsEl = document.querySelector('.feeds');
  const postsEl = document.querySelector('.posts');
  if (path === 'form.valid') {
    if (!value) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  }
  if (path === 'feeds') {
    form.reset();
    input.focus();
    feedsEl.innerHTML = '';
    const feedsHeader = document.createElement('h2');
    feedsHeader.textContent = 'Фиды'; // положить текст в i18next!
    feedsEl.prepend(feedsHeader);
    const feedsList = document.createElement('ul');
    value.forEach((feed) => {
      const feedLiEl = document.createElement('li');
      const feedTitle = document.createElement('h3');
      feedTitle.textContent = feed.title;
      const feedDescription = document.createElement('p');
      feedDescription.textContent = feed.description;
      feedLiEl.append(feedTitle, feedDescription);
      feedsList.append(feedLiEl);
    });
    feedsEl.append(feedsList);
  }
  if (path === 'posts') {
    postsEl.innerHTML = '';
    const postsHeader = document.createElement('h2');
    postsHeader.textContent = 'Посты'; // положить текст в i18next!
    postsEl.prepend(postsHeader);
    const postsList = document.createElement('ul');
    value.forEach((post) => {
      const postLiEl = document.createElement('li');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.textContent = post.title;
      postLiEl.append(postLink);
      postsList.append(postLiEl);
    });
    postsEl.append(postsList);
  }
});

export default watchedState;
