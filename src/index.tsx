export const layout = "layouts/site.html";
export const title = "Mahol Arts & Events";
export const navTitle = "Home";
export const description = "Mahol is an Edmonton arts and events team that serves local artists and enables them to maximize their talent in the performance arts.";

export default ({ comp }: Lume.Data) => (
  <>
    <div className="relative w-full h-[560px] md:h-[800px]">
      <div className="flex justify-center items-center size-full">
        <div className="text-center z-10 p-8 rounded-xl backdrop-blur-sm bg-black/20 shadow shadow-red-700/30 select-none">
          <h1 className="text-7xl md:text-[8rem] uppercase font-serif">
            Mahol
          </h1>
          <p className="text-xl italic">Arts & Events</p>
        </div>
      </div>
      <div className="absolute size-full left-0 top-0">
        <comp.hero_carousel />
      </div>
    </div>
  </>
);
