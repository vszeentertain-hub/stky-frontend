import { Link } from "react-router-dom";
import { Lightning, Target, Compass, Heart, ArrowRight } from "@phosphor-icons/react";

const VALUES = [
  { Icon: Lightning, title: "Custom Cover Art", desc: "Designed to make releases stand out." },
  { Icon: Target, title: "Artist Branding", desc: "Building visual identity for artists and creators." },
  { Icon: Compass, title: "Creative Direction", desc: "Turning ideas into strong visual concepts." },
  { Icon: Heart, title: "Music Projects", desc: "Creating and releasing music as VENOSRX." },
];

const PROCESS = [
  { step: "01", title: "Discover", text: "We start by listening — your sound, your audience, your goal." },
  { step: "02", title: "Direct", text: "Two distinct creative directions, no generic mood-boards." },
  { step: "03", title: "Design", text: "We craft, refine, and pressure-test against the brief." },
  { step: "04", title: "Deliver", text: "Full asset pack, ready for every platform and resolution." },
];

export default function About() {
  return (
    <div data-testid="page-about" className="px-4 sm:px-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="pt-40 pb-20">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">About</div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tighter mt-3 max-w-4xl leading-[0.95]">
            Visual Designer <span className="neon-text">&</span> <br /> Music Creator.
          </h1>
          <p className="mt-6 max-w-2xl text-white/65 leading-relaxed text-lg">
            I'm STKY, a visual designer specializing in custom cover art and creative design. Alongside my design work, I also release music under the artist name VENOSRX.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-20">
          <div className="col-span-12 md:col-span-7 rounded-3xl overflow-hidden border border-white/5">
            <img src="https://images.unsplash.com/photo-1613327986042-63d4425a1a5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400" alt="Studio" className="w-full h-full object-cover" />
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4">
            {VALUES.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-stky-card border border-white/5 p-5">
                <Icon size={22} weight="duotone" className="text-stky-purple" />
                <div className="font-display text-lg font-semibold mt-4">{title}</div>
                <p className="text-xs text-white/55 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Process</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter mt-3 mb-10">From brief to <span className="text-stky-blue">delivered</span>.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="rounded-2xl glass p-6">
                <div className="font-mono text-xs text-stky-purple">{p.step}</div>
                <div className="font-display text-2xl font-semibold mt-2">{p.title}</div>
                <p className="text-sm text-white/55 mt-2 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl glass p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter">Ready when you are.</h3>
            <p className="text-white/55 mt-2">Book a slot and let's build something worth shipping.</p>
          </div>
          <button
            className="stky-btn"
            onClick={() => window.dispatchEvent(new Event("open-contact-modal"))}
          >
            Contact Me
          </button>
        </div>
      </div>
    </div>
  );
}
