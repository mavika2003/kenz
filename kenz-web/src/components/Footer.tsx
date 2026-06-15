export default function Footer() {
  return (
    <footer className="bg-black px-6 py-12 text-center text-white">
      <div className="font-[family-name:var(--font-anton)] text-2xl tracking-wide">
        KEN<span className="text-black [-webkit-text-stroke:1.5px_#ffffff]">Z</span>
      </div>
      <p className="mt-3 font-[family-name:var(--font-caveat)] text-lg opacity-85">
        made with love by people who actually live here 🇦🇪
      </p>
      <div className="mt-5 text-lg opacity-80 md:text-xl">
        <a href="#" className="mx-2 hover:text-orange">
          Website
        </a>
        ·
        <a href="#" className="mx-2 hover:text-orange">
          Instagram
        </a>
        ·
        <a href="#" className="mx-2 hover:text-orange">
          Contact
        </a>
      </div>
    </footer>
  );
}
