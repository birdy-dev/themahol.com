type Menu = {
  slug: string;
  data: {
    url: string;
    basename: string;
    title?: string;
    navTitle?: string;
  };
  children?: Menu[];
};

export default ({ nav, url }: { nav: Menu; url: string }) => (
  <div className="w-full">
    <nav className="flex justify-between items-center py-4 px-16 w-full max-w-screen-xl mx-auto">
      <a href="/">
        <img className="h-12" src="/images/site-logo.svg" alt="Mahol" />
      </a>
      <ul className="flex gap-4">
        <MenuItem item={nav} url={url} />
        <li>
          <a
            className="px-5 py-3 rounded-lg hover:bg-gray-100 transition ease-in"
            href="/"
          >
            Events
          </a>
        </li>
      </ul>
    </nav>
  </div>
);

const MenuItem = ({ item, url }: { item: Menu; url: string }) => {
  const active = url === item.data.url;
  return (
    <li>
      {item.data.navTitle && !active && (
        <a
          className="px-5 py-3 rounded-lg hover:bg-gray-100 transition ease-in"
          href={item.data.url}
          data-active={active}
        >
          {item.data.navTitle}
        </a>
      )}

      {item.data.navTitle && active && (
        <span className="px-5 py-3 rounded-lg bg-gray-100/70 cursor-default">
          {item.data.navTitle}
        </span>
      )}

      {item.children?.map((child) => (
        <MenuItem
          item={child}
          url={url}
          key={child.slug}
        />
      ))}
    </li>
  );
};
