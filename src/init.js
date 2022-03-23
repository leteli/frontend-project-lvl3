import * as yup from 'yup';
import watchedState from './view.js';

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

export default () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    console.log(value);
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
