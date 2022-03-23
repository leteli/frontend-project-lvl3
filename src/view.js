import onChange from 'on-change';
import state from './state.js';
import './style.css';

const watchedState = onChange(state, (path, value) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
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
  }
});

export default watchedState;
