// todo use list for images
const carouselImgs = [];

export default function Carousel() {
  const imgCount = 20; //todo make this dynamic
  const imgSrc = [...Array(imgCount).keys()].map((i) =>
    `images/hero_carousel/${i + 1}.jpg`
  );

  return (
    <div className="absolute grid grid-rows-2 grid-flow-row-dense w-full h-full gap-4 p-4 overflow-clip bg-black">
      <div className="flex gap-4">
        <ScrollChunk imgs={imgSrc} start={0} end={imgCount / 2} />
        <ScrollChunk imgs={imgSrc} start={0} end={imgCount / 2} isDuplicate />
      </div>
      <div className="flex gap-4 -translate-x-40">
        <ScrollChunk imgs={imgSrc} start={imgCount / 2} end={imgCount} />
        <ScrollChunk
          imgs={imgSrc}
          start={imgCount / 2}
          end={imgCount}
          isDuplicate
        />
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
          className="flex items-center justify-center"
          key={src}
        >
          <img
            className="h-full max-w-80 object-cover object-center select-text rounded-lg"
            src={src}
            draggable={false}
            alt=""
          />
        </div>
      ))}
    </div>
  );
}
