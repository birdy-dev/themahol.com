// todo use list for images
const carouselImgs = [];

export default function Carousel() {
  const count = 20; //todo make this dynamic
  const imgs = [...Array(count).keys()].map((i) =>
    `images/hero_carousel/${i + 1}.jpg`
  );

  return (
    <div className="absolute grid grid-rows-2 grid-flow-row-dense w-full h-full gap-4 p-4 overflow-clip bg-black">
      <div className="flex gap-4 w-fit">
        <ScrollChunk imgs={imgs} start={0} end={count / 2} />
        <ScrollChunk imgs={imgs} start={count / 2} end={count} isDuplicate />
      </div>
      <div className="flex gap-4 -translate-x-40">
        <ScrollChunk imgs={imgs} start={count / 2} end={count} />
        <ScrollChunk imgs={imgs} start={0} end={count / 2} isDuplicate />
      </div>
    </div>
  );
}

function ScrollChunk(
  { imgs, start, end, isDuplicate = false }: {
    imgs: string[];
    start: number;
    end: number;
    isDuplicate?: boolean;
  },
) {
  return (
    <div className="flex gap-4 animate-scroll-left" aria-hidden={isDuplicate}>
      {imgs.slice(start, end).map((src) => (
        <div
          className="flex items-center justify-center grayscale-[50%] w-max max-w-60 md:max-w-96"
          key={src}
        >
          <img
            className="size-full object-cover object-center select-none rounded-lg"
            src={src}
            draggable={false}
            alt=""
          />
        </div>
      ))}
    </div>
  );
}
