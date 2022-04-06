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
    feedsList.innerHTML = '';
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
    postsList.innerHTML = '';
    console.log(value);
    value.forEach((post) => {
      const postLiEl = document.createElement('li');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', post.link);
      postLink.textContent = post.title;
      if (!state.uiState.readPostsIds.includes(post.id)) {
        postLiEl.classList.add('fw-bold');
      }
      postLiEl.setAttribute('id', `${post.id}`);
      postLiEl.append(postLink);
      const postButton = document.createElement('button');
      postButton.classList.add('btn', 'btn-primary');
      postButton.setAttribute('type', 'button');
      postButton.setAttribute('data-bs-toggle', 'modal');
      postButton.setAttribute('data-bs-target', '#exampleModal');
      postButton.textContent = 'Просмотр'; // положить текст в i18next
      postButton.addEventListener('click', () => {
        watchedState.uiState.clickedPost = post;
        console.log(state.uiState.clickedPost);
        if (!state.uiState.readPostsIds.includes(post.id)) {
          watchedState.uiState.readPostsIds.push(post.id);
        }
      });

      postsList.append(postLiEl, postButton);
    });
    postsEl.append(postsList);
  }
  if (path === 'uiState.clickedPost') {
    const modalTitle = document.getElementById('exampleModalLabel');
    const modalDescription = document.getElementById('postDescription');
    modalTitle.textContent = value.title;
    modalDescription.textContent = value.description;
  }
  if (path === 'uiState.readPostsIds') {
    value.forEach((id) => {
      const postEl = document.getElementById(id);
      postEl.classList.add('fw-normal', 'text-secondary');
      postEl.classList.remove('fw-bold');
    });
  }
});

export default watchedState;
