interface ProductVideoProps {
  src?: string;
  poster?: string;
}

export default function ProductVideo({ src, poster }: ProductVideoProps) {
  return (
    <div className="relative aspect-[9/16] w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {src ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <p className="text-sm font-medium">Video Placeholder</p>
        </div>
      )}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">
        Trending on TikTok
      </div>
    </div>
  );
}
