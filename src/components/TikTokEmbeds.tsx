"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function TikTokEmbeds() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="min-h-[400px]">
      {inView && (
        <>
          <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-6">
            <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7610089089915718934" data-video-id="7610089089915718934" style={{ width: "100%", maxWidth: "325px" }} >
              <section> 
                <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> always best on Auvra <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7610089075831950102?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
              </section> 
            </blockquote>
            <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7610173889662029078" data-video-id="7610173889662029078" style={{ width: "100%", maxWidth: "325px" }} > 
              <section> 
                <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> LINK IN BIO new drops every hour <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7610173899687938838?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
              </section> 
            </blockquote>
            <blockquote className="tiktok-embed rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm" cite="https://www.tiktok.com/@.auvra/video/7609838351478181142" data-video-id="7609838351478181142" style={{ width: "100%", maxWidth: "325px" }} > 
              <section> 
                <a target="_blank" title="@.auvra" href="https://www.tiktok.com/@.auvra?refer=embed" rel="noreferrer">@.auvra</a> save 💵 when shopping CLICK LINK IN BIO <a title="fashion" target="_blank" href="https://www.tiktok.com/tag/fashion?refer=embed" rel="noreferrer">#fashion</a> <a title="fyp" target="_blank" href="https://www.tiktok.com/tag/fyp?refer=embed" rel="noreferrer">#fyp</a> <a title="ootd" target="_blank" href="https://www.tiktok.com/tag/ootd?refer=embed" rel="noreferrer">#ootd</a> <a title="fashiontiktok" target="_blank" href="https://www.tiktok.com/tag/fashiontiktok?refer=embed" rel="noreferrer">#fashiontiktok</a> <a title="streetwear" target="_blank" href="https://www.tiktok.com/tag/streetwear?refer=embed" rel="noreferrer">#streetwear</a> <a target="_blank" title="♬ original sound - Auvra" href="https://www.tiktok.com/music/original-sound-7609838383141112598?refer=embed" rel="noreferrer">♬ original sound - Auvra</a> 
              </section> 
            </blockquote>
          </div>
          <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
        </>
      )}
    </div>
  );
}
