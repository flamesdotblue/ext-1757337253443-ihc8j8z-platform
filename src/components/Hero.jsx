import Spline from '@splinetool/react-spline';

export default function Hero() {
  return (
    <section className="relative w-full h-[360px] overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/UGnf9D1Hp3OG8vSG/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/10 via-neutral-950/40 to-neutral-950 pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 h-full flex items-end pb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Custom Chess: Evolve Your Army</h1>
          <p className="mt-3 text-neutral-300 max-w-2xl">
            Capture pieces, earn points, and upgrade your lineup with special moves and abilities. Mix strategy with creativity.
          </p>
        </div>
      </div>
    </section>
  );
}
