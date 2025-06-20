import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to <span className="text-[hsl(280,100%,70%)]">StyleTTS 2</span>
        </h1>
        <p className="text-2xl text-center">
          Generate expressive and natural-sounding speech with our powerful text-to-speech model.
        </p>
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/app"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
