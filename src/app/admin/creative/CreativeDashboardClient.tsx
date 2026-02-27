"use client";

import { useState } from "react";
import { Zap, TrendingUp, Users, Target, Activity, RefreshCw, Smartphone, PlaySquare, Plus } from "lucide-react";

export default function CreativeDashboardClient({ 
  rankings,
  totalViews,
  totalRevenue
}: { 
  rankings: any[],
  totalViews: number,
  totalRevenue: number
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await fetch('/api/admin/recalculate-creatives', {
        method: 'POST',
        headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '' } // We'll need a better way to pass this, but for now it's internal
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
    setIsRefreshing(false);
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white selection:bg-red-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Telemetry</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Creative Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">
              <Plus size={14} /> New Creative
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors ${isRefreshing ? 'opacity-50 animate-spin' : ''}`}
            >
              <RefreshCw size={16} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Impressions</p>
              <Users size={16} className="text-zinc-600" />
            </div>
            <p className="text-4xl font-black tracking-tighter">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Builder Engagement</p>
              <Target size={16} className="text-zinc-600" />
            </div>
            <p className="text-4xl font-black tracking-tighter">
              {rankings.length > 0 ? Math.round((rankings.reduce((acc, curr) => acc + (curr.drags || 0), 0) / Math.max(totalViews, 1)) * 1000) / 10 : 0}%
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Attributed Revenue</p>
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <p className="text-4xl font-black tracking-tighter text-white">€{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-black uppercase tracking-tighter">High-Performance Vectors</h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-16 text-center">Rank</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Creative Node</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Format</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Score</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Views</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((row, idx) => (
                  <tr key={row.creative_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group">
                    <td className="p-4 text-center font-black text-2xl text-zinc-700 group-hover:text-red-500 transition-colors">
                      {idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
                          {row.creative_nodes?.thumbnail_url ? (
                            <img src={row.creative_nodes.thumbnail_url} className="w-full h-full object-cover" alt="Creative" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <PlaySquare size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold font-mono text-zinc-300">{row.creative_id.split('-')[0]}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="bg-zinc-800 text-zinc-400 text-[8px] px-2 py-0.5 rounded-sm uppercase tracking-widest font-black flex items-center gap-1">
                              <Smartphone size={8} />
                              {row.creative_nodes?.platform || 'TT'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-black px-3 py-1 rounded-full border border-zinc-800">
                         {row.creative_nodes?.format || 'Vibe'}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-lg font-black text-white bg-zinc-800 px-3 py-1 rounded-lg">
                        {Math.round(row.score)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-bold text-zinc-300">{row.views?.toLocaleString() || 0}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500">Drags: <span className="text-white">{row.drags || 0}</span></span>
                        <span className="text-green-500">Purchases: <span className="text-green-400">{row.purchases || 0}</span></span>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                       <div className="flex flex-col items-center justify-center text-zinc-600">
                         <Target size={32} className="mb-4 opacity-50" />
                         <p className="text-xs font-black uppercase tracking-widest">No Intelligence Data Found</p>
                         <p className="text-[10px] mt-2 opacity-50">Run aggregation or ingest events to populate</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
