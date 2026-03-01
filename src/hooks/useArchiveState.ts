import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

export type CanvasOutfit = Record<string, any[]>;

export function useArchiveState(initialState: CanvasOutfit) {
  const [canvasOutfit, setCanvasOutfit] = useState<CanvasOutfit>(initialState);
  const [isMember, setIsMember] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [outfitId, setOutfitId] = useState<string | null>(null);
  const supabase = createClient();

  // Load from local storage initially
  useEffect(() => {
    const localData = localStorage.getItem('auvra_guest_outfit');
    if (localData) {
      try {
        setCanvasOutfit(JSON.parse(localData));
      } catch (e) {
        console.error("Failed to parse local outfit", e);
      }
    }
    
    checkMembership();
  }, []);

  async function checkMembership() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('membership_tier').eq('id', user.id).single();
      if (data?.membership_tier === 'society') {
        setIsMember(true);
        // If member, load their latest cloud outfit or create one
        loadCloudOutfit(user.id);
      }
    }
  }

  async function loadCloudOutfit(userId: string) {
    const { data } = await supabase
      .from('user_outfits')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data && data.slots) {
      setOutfitId(data.id);
      // Fetch the actual item details from pulse_inventory
      // In a real scenario, slots contains IDs, and we need to join or fetch
      // For optimistic sync, we'll keep the current implementation where canvasOutfit stores full objects locally,
      // but syncs only IDs to the cloud.
    }
  }

  // Sync to local storage for guests, or debounce sync to cloud for members
  useEffect(() => {
    if (!isMember) {
      localStorage.setItem('auvra_guest_outfit', JSON.stringify(canvasOutfit));
      return;
    }

    const timer = setTimeout(async () => {
      // Prepare slots payload
      const slotsToSave: Record<string, string | null> = {};
      Object.keys(canvasOutfit).forEach(slot => {
         slotsToSave[slot] = canvasOutfit[slot].length > 0 ? canvasOutfit[slot][0].id : null;
      });

      setIsSyncing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (outfitId) {
          await supabase.from('user_outfits').update({
            slots: slotsToSave,
            updated_at: new Date().toISOString()
          }).eq('id', outfitId);
        } else {
          const { data } = await supabase.from('user_outfits').insert({
            user_id: user.id,
            slots: slotsToSave
          }).select().single();
          if (data) setOutfitId(data.id);
        }
      }
      setIsSyncing(false);
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [canvasOutfit, isMember, outfitId]);

  return { canvasOutfit, setCanvasOutfit, isMember, isSyncing, outfitId };
}
