type Nav = {
  slug: string;
  data: {
    url: string;
    basename: string;
    title?: string;
    navTitle?: string;
  };
  children?: Nav[];
};

export default ({ item, url }: { item: Nav; url: string }) => (
  <div className="w-full">
    <nav className="flex justify-between items-center py-4 px-6 md:px-16 w-full max-w-screen-xl mx-auto">
      <a href="/">
        <img className="h-12" src="/images/site-logo.svg" alt="Mahol" />
      </a>
      <ul className="hidden md:flex gap-4">
        <MenuItem item={item} url={url} />
        <li>
          <a
            className="px-5 py-3 rounded-lg hover:bg-gray-100 transition ease-in"
            href="/"
          >
            Events
          </a>
        </li>
      </ul>

      <div className="flex flex-col md:hidden">
        <button
          className="peer"
          type="button"
          id="mobile-menu-toggle"
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <span>Menu</span>
        </button>

        <ul
          className="h-0 peer-aria-[expanded=false]:invisible"
          id="mobile-menu"
        >
          <MenuItem item={item} url={url} />
        </ul>

        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: We need this JS
          dangerouslySetInnerHTML={{
            __html: `
            document
              .getElementById("mobile-menu-toggle")
              .addEventListener("click", function (e) {
                const expanded = e.currentTarget.getAttribute('aria-expanded');
                e.currentTarget.setAttribute('aria-expanded', expanded === 'true' ? 'false' : 'true');
              })
          `,
          }}
        />
      </div>
    </nav>
  </div>
);

const MenuItem = ({ item, url }: { item: Nav; url: string }) => {
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
