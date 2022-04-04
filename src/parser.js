import _ from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'text/xml');
  console.log(parsedRss);
  const feedTitle = parsedRss.querySelector('title');
  const feedDescription = parsedRss.querySelector('description');
  console.log(feedTitle.textContent);
  console.log(feedDescription.textContent);
  const feedId = _.uniqueId();
  const feed = {
    id: feedId,
    title: feedTitle.textContent, // положить текст в i18next!
    description: feedDescription.textContent, // положить текст в i18next!
  };
  const posts = [...parsedRss.querySelectorAll('item')];
  console.log(posts);
  const postsArr = posts.map((post) => {
    const title = post.querySelector('title');
    const link = post.querySelector('link');
    return {
      id: _.uniqueId(),
      feedId,
      title: title.textContent, // положить текст в i18next!
      link: link.textContent,
    };
  });
  return { feed, postsArr };
};
