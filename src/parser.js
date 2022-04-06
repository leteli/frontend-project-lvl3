export default (data) => {
  const parser = new DOMParser();
  const parsedRss = parser.parseFromString(data, 'text/xml');
  console.log(parsedRss);
  const feedTitle = parsedRss.querySelector('title');
  const feedDescription = parsedRss.querySelector('description');
  console.log(feedTitle.textContent);
  console.log(feedDescription.textContent);
  const feed = {
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  };
  const posts = [...parsedRss.querySelectorAll('item')];
  console.log(posts);
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
