import Carousel from "./_components/hero_carousel.tsx";

export const layout = "layouts/site.html";

export default () => (
  <>
    <div>
      <div className="relative w-full h-[800px]">
        <div className="flex justify-center items-center size-full">
          <div className="text-center text-white">
            <h1>Mahol</h1>
            <p>Arts & Events</p>
          </div>
        </div>
        <div className="absolute size-full -z-10 left-0 top-0">
          <Carousel />
        </div>
      </div>
    </div>
  </>
);
