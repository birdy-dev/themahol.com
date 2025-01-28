export const layout = "layouts/site.html";

export default () => (
  <>
    <div id="test">
      <Carousel />
      <h1>Mahol</h1>
      <p>Arts & Events</p>
    </div>
  </>
);

/**
 * correctly size the images?
 * put into the background? position abs
 * reset the scroll back to the beginning JS?
 *
 * Offset the images in each grid
 */

function Carousel() {
  const imgSrc = [...Array(20).keys()].map((i) =>
    `images/hero_carousel/${i + 1}.jpg`
  );

  return (
    <div className="flex w-full bg-black overflow-clip">
      <div
        className="grid grid-flow-col-dense grid-rows-[repeat(2,300px)] grid-cols-[repeat(fit-content,minmax(max-content,max-content))] gap-4 min-w-max animate-scroll-left"
      >
        {imgSrc.map((src) => (
          <div
            className="flex items-center justify-center"
            key={src}
          >
            <img
              className="h-64 object-cover object-center rounded-lg"
              src={src}
              alt=""
            />
          </div>
        ))}
      </div>
      <div
        className="grid grid-flow-col-dense grid-rows-[repeat(2,300px)] grid-cols-[repeat(auto-fill,minmax(max-content,max-content))] gap-4 min-w-max animate-scroll-left"
      >
        {imgSrc.map((src) => (
          <div
            className="flex items-center justify-center"
            key={src}
          >
            <img
              className="h-64 object-cover object-center rounded-lg"
              src={src}
              alt=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}
