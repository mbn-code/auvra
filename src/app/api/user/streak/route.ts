import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('drop_streak, last_drop_viewed')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastViewed = profile.last_drop_viewed;

    if (lastViewed === today) {
      // Already checked today, return current streak
      return NextResponse.json({ streak: profile.drop_streak || 0 });
    }

    // Check if missed a day
    let newStreak = 1;
    if (lastViewed) {
      const lastDate = new Date(lastViewed);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        newStreak = (profile.drop_streak || 0) + 1;
      }
    }

    await supabase
      .from('profiles')
      .update({ drop_streak: newStreak, last_drop_viewed: today })
      .eq('id', user.id);

    return NextResponse.json({ streak: newStreak });
  } catch (error) {
    console.error('Streak update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}