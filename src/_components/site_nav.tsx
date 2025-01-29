type Nav = {
  data: {
    url: string;
    basename: string;
    title?: string;
    navTitle?: string;
  };
  slug?: string;
  children?: Nav[];
};

export default ({ item, url }: { item: Nav; url: string }) => (
  <div className="w-full">
    <nav className="relative">
      <div className="flex justify-between items-center py-4 px-6 md:px-16 w-full max-w-screen-xl mx-auto">
        <a href="/">
          <img
            className="h-12"
            src="/images/site-logo.svg"
            alt="Mahol"
            height="48"
          />
        </a>
        <ul className="hidden md:flex gap-4">
          <MenuItem item={item} url={url} />
        </ul>

        <button
          className="md:hidden"
          type="button"
          aria-controls="mobile-menu"
          id="mobile-menu-open"
        >
          <span className="sr-only">Open main menu</span>
          <span>Menu</span>
        </button>
      </div>

      <div
        className="absolute left-0 top-0 z-50 w-full overflow-hidden bg-white transition-all ease-linear md:hidden"
        style={{ height: 0 }}
        id="mobile-menu"
      >
        <div className="w-full flex justify-between py-4 px-6">
          <a href="/">
            <img
              className="h-12"
              src="/images/site-logo.svg"
              alt="Mahol"
              height="48px"
            />
          </a>
          <button type="button" id="mobile-menu-close">
            Close
          </button>
        </div>
        <ul className="flex flex-col h-full text-center gap-4">
          <MenuItem item={item} url={url} />
        </ul>
      </div>

      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Used to toggle the menu
        dangerouslySetInnerHTML={{
          __html: `
            document
              .getElementById("mobile-menu-open")
              .addEventListener("click", () => document.getElementById("mobile-menu").style.height = "100vh");
            document
              .getElementById("mobile-menu-close")
              .addEventListener("click", () => document.getElementById("mobile-menu").style.height = "0");
          `,
        }}
      />
    </nav>
  </div>
);

const MenuItem = ({ item, url }: { item: Nav; url: string }) => {
  const active = url === item.data.url;
  return (
    <li>
      {item.data.navTitle && !active && (
        <a
          className="block px-5 py-3 rounded-lg hover:bg-gray-100 transition ease-in"
          href={item.data.url}
          data-active={active}
        >
          {item.data.navTitle}
        </a>
      )}

      {item.data.navTitle && active && (
        <div className="px-5 py-3 rounded-lg bg-gray-100/70 cursor-default">
          {item.data.navTitle}
        </div>
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
