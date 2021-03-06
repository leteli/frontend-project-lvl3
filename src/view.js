import onChange from 'on-change';
import './style.css';
import handler from './handler.js';

const render = (state, i18nextInstance) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const submitButton = document.querySelector('[type="submit"]');
  const feedback = document.querySelector('.feedback');
  const feedsEl = document.querySelector('.feeds');
  const postsEl = document.querySelector('.posts');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.valid') {
      if (!value) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
    }
    if (path === 'form.state') {
      if (value === 'processing') {
        input.setAttribute('readonly', 'readonly');
        submitButton.disabled = true;
      }
      if (value === 'processed') {
        input.removeAttribute('readonly');
        submitButton.disabled = false;
        feedback.textContent = i18nextInstance.t('form.success');
      }
      if (value === 'failed') {
        input.removeAttribute('readonly');
        submitButton.disabled = false;
      }
    }

    if (path === 'feeds') {
      input.value = '';
      input.focus();
      feedsEl.innerHTML = '';
      const feedsHeader = document.createElement('h2');
      feedsHeader.textContent = i18nextInstance.t('feedsHeader');
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
      postsHeader.textContent = i18nextInstance.t('postsHeader');
      postsEl.prepend(postsHeader);
      const postsList = document.createElement('ul');
      postsList.innerHTML = '';
      value.forEach((post) => {
        const postLiEl = document.createElement('li');
        const postLink = document.createElement('a');
        postLink.setAttribute('href', post.link);
        postLink.textContent = post.title;
        if (!watchedState.uiState.readPostsIds.includes(post.id)) {
          postLink.classList.add('fw-bold');
        } else {
          postLink.classList.add('fw-normal', 'text-secondary');
        }
        postLink.setAttribute('id', `${post.id}`);
        postLiEl.append(postLink);
        const postButton = document.createElement('button');
        postButton.classList.add('btn', 'btn-primary');
        postButton.setAttribute('type', 'button');
        postButton.setAttribute('data-bs-toggle', 'modal');
        postButton.setAttribute('data-bs-target', '#exampleModal');
        postButton.textContent = i18nextInstance.t('checkButton');
        postButton.addEventListener('click', () => {
          watchedState.uiState.clickedPost = post;
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
    if (path === 'form.error') {
      feedback.textContent = i18nextInstance.t(value);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const urlValue = formData.get('url');
    watchedState.form.inputUrl = urlValue;
    handler(watchedState);
  });
};

export default render;
