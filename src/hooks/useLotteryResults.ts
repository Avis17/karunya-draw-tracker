import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LotteryResult {
  id: string;
  draw_date: string;
  slot_time: string;
  result_number: string;
  created_at: string;
}

export const useLotteryResults = (selectedDate?: Date) => {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchResults = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', dateStr)
        .order('slot_time');

      if (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch lottery results",
          variant: "destructive"
        });
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lottery results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultForTime = (time: string): string | null => {
    const result = results.find(r => r.slot_time === time);
    return result?.result_number || null;
  };

  const isTimeSlotActive = (time: string): boolean => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // If selected date is in the past, all slots are active
    if (targetDate < today) return true;
    
    // If selected date is in the future, no slots are active
    if (targetDate > today) return false;
    
    // If it's today, check if current time is past the slot time
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    return now >= slotTime;
  };

  useEffect(() => {
    if (selectedDate) {
      fetchResults(selectedDate);
    }
  }, [selectedDate]);

  return {
    results,
    loading,
    fetchResults,
    getResultForTime,
    isTimeSlotActive,
    refetch: () => selectedDate && fetchResults(selectedDate)
  };
};