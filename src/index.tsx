import Carousel from "./_components/hero_carousel.tsx";

export const layout = "layouts/site.html";

export default () => (
  <>
    <div>
      <div className="relative w-full h-[560px] md:h-[800px]">
        <div className="absolute size-full left-0 top-0">
          <Carousel />
        </div>
        <div className="flex justify-center items-center size-full">
          <div className="text-center text-white z-10 px-6 pb-6 rounded-xl backdrop-blur-sm">
            <h1 className="text-7xl md:text-[8rem] uppercase font-serif">Mahol</h1>
            <p className="text-xl italic">Arts & Events</p>
          </div>
        </div>
      </div>
    </div>
  </>
);
