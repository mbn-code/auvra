import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center">
      <span className="text-xl md:text-2xl font-black tracking-[0.6em] text-zinc-900 group-hover:opacity-70 transition-opacity uppercase mr-[-0.6em]">
        AUVRA
      </span>
    </Link>
  );
}
