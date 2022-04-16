export default (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'application/xml');
  const errorNode = parsedRss.querySelector('parsererror');
  if (errorNode) {
    const message = errorNode.querySelector('div').textContent;
    const e = new Error(message);
    e.name = 'ParserError';
    throw e;
  }
  const feedTitle = parsedRss.querySelector('title');
  const feedDescription = parsedRss.querySelector('description');
  const feed = {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };
  const posts = [...parsedRss.querySelectorAll('item')];
  const postsArr = posts.map((post) => {
    const title = post.querySelector('title');
    const link = post.querySelector('link');
    const description = post.querySelector('description');
    return {
      title: title.textContent,
      link: link.textContent,
      description: description.textContent,
    };
  });
  return { feed, postsArr };
};
