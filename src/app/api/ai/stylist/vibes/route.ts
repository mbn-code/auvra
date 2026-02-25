import { NextRequest, NextResponse } from 'next/server';

const VIBE_DB: Record<string, string[]> = {
  "gorpcore": [
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500"
  ],
  "technical": [
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=500"
  ],
  "vintage": [
    "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1523381235312-df592d0c242d?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=500"
  ],
  "streetwear": [
    "https://images.unsplash.com/photo-1523398267024-81f5bc91c5a2?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=500"
  ],
  "luxury": [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=500",
    "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&q=80&w=500"
  ]
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase() || '';
  
  let results: string[] = [];
  
  if (!q) {
    results = VIBE_DB['luxury'];
  } else {
    const matchKey = Object.keys(VIBE_DB).find(k => q.includes(k));
    results = matchKey ? VIBE_DB[matchKey] : VIBE_DB['luxury'];
  }

  return NextResponse.json(results.map(url => ({
    id: Math.random().toString(36).substring(7),
    url
  })));
}
