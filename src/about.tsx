export const layout = "layouts/site.html";
export const navTitle = "About";

export default () => (
  <div className="w-full py-16">
    <h1 className="font-title uppercase text-center text-7xl font-semibold my-12">
      About
    </h1>

    <section className="space-y-8 w-full px-4 md:px-0 mx-auto max-w-screen-sm py-12">
      <p className="leading-7">
        Mahol (i.e. The Vibe) was founded by Sweta Maru and Amit Vaghela as they
        noticed there was no common platform for various artists and vendors
        across Canada for event opportunities. Mahol's mission is to bring your
        event dreams to life by crafting one-of-a-kind, custom, curated
        experiences. We also aim to create paid opportunities for artists and
        obtain recognition for the work they do. Our final goal, of course, is
        to spread happiness, which is derived from Mahol's definition.
      </p>

      <p className="leading-7">
        We at Mahol will work tirelessly behind the scenes taking care of your
        every need, big or small (and maybe make your relatives jealous… JK) to
        ensure you have the best day(s) of your life. Our team specializes in
        several types and sizes of events, from a romantic picnic or an intimate
        proposal, to weddings, corporate events, festivals, galas and formals.
        Give us a shout out for any and all of your event needs and let us begin
        helping you create your story now!
      </p>

      <p className="leading-7">
        We are currently based out of Edmonton, Alberta, Canada and are steadily
        building connections across Canada, The United States and India.
      </p>
    </section>
  </div>
);
