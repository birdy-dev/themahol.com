export const layout = "layouts/site.html";
export const title = "Mahol Arts & Events";
export const navTitle = "Home";
export const description =
  "Mahol is an Edmonton arts and events team that serves local artists and enables them to maximize their talent in the performance arts.";

export default ({ comp }: Lume.Data) => (
  <>
    <div className="relative w-full h-[560px] md:h-[800px]">
      <section className="flex justify-center items-center size-full">
        <div className="text-center z-10 p-8 select-none">
          <h1 className="text-7xl md:text-[8rem] font-bold uppercase font-title">
            Mahol
          </h1>
          <p className="text-2xl ">Arts & Events</p>
        </div>
      </section>
      <div className="absolute size-full left-0 top-0">
        <comp.hero_carousel />
      </div>
    </div>

    <section className="py-40 max-w-screen-lg px-8 mx-auto space-y-12">
      <h2 className="text-4xl md:text-7xl font-bold uppercase font-title text-center">
        Why Mahol?
      </h2>
      <p className="text-xl">
        Mahol is a full-service event production firm that specializes in
        creating immersive and engaging experiences. Team Mahol plans your
        event, including but not limited to: entertainment, decorations, food,
        fashion, graphics, media, logistics and more.
      </p>
    </section>

    <div className="bg-[#191c21]">
      <section className="py-24 max-w-screen-lg px-2 md:px-8 mx-auto space-y-24">
        <h2 className="text-4xl md:text-7xl font-bold uppercase font-title text-center">
          Explore our work
        </h2>
        <iframe
          className="mx-auto w-full rounded-xl max-w-[620px]"
          width="620"
          height="315"
          src="https://www.youtube.com/embed/2J-JXcO_iA4?si=lbR3lXbhfCk3WtSy&rel=0&modestbranding=1&showinfo=0"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />

        <iframe
          width="315"
          height="560"
          src="https://www.youtube.com/embed/R4suYEnlerg"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </section>
    </div>
  </>
);
