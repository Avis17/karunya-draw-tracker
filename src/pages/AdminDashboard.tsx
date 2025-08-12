import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LotteryResult } from '@/hooks/useLotteryResults';

interface AdminDashboardProps {
  onLogout: () => void;
}

const TIME_SLOTS = [
  { value: '10:20', label: '10:20 AM' },
  { value: '12:20', label: '12:20 PM' },
  { value: '14:20', label: '2:20 PM' },
  { value: '16:20', label: '4:20 PM' },
  { value: '18:20', label: '6:20 PM' }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [newResults, setNewResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchResults = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', dateStr)
        .order('slot_time');

      if (error) {
        console.error('Error fetching results:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleSaveResult = async (slotTime: string) => {
    const resultNumber = newResults[slotTime];
    
    if (!resultNumber || resultNumber.length !== 6 || !/^\d{6}$/.test(resultNumber)) {
      toast({
        title: "Invalid Result",
        description: "Result must be exactly 6 digits",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data: { user } } = await supabase.auth.getUser();
      
      const existingResult = results.find(r => r.slot_time === slotTime);
      
      if (existingResult) {
        // Update existing result
        const { error } = await supabase
          .from('lottery_results')
          .update({ result_number: resultNumber })
          .eq('id', existingResult.id);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update result",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Insert new result
        const { error } = await supabase
          .from('lottery_results')
          .insert([{
            draw_date: dateStr,
            slot_time: slotTime,
            result_number: resultNumber,
            created_by: user?.id
          }]);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to save result",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Result saved successfully",
      });
      
      await fetchResults(selectedDate);
      setEditingResult(null);
      setNewResults(prev => ({ ...prev, [slotTime]: '' }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lottery_results')
        .delete()
        .eq('id', resultId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete result",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Result deleted successfully",
      });
      
      await fetchResults(selectedDate);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete result",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(selectedDate);
  }, [selectedDate]);

  const getResultForSlot = (slotTime: string) => {
    return results.find(r => r.slot_time === slotTime);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="admin-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-gradient-primary text-3xl md:text-4xl font-bold">
              Admin Dashboard
            </h1>
            <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Manage Lottery Results
              </h2>
              <p className="text-muted-foreground">
                Select a date to add, edit, or delete lottery results
              </p>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal ml-auto",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          {TIME_SLOTS.map((slot) => {
            const existingResult = getResultForSlot(slot.value);
            const isEditing = editingResult === slot.value;
            
            return (
              <div key={slot.value} className="admin-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-primary min-w-[100px]">
                      {slot.label}
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="6-digit number"
                          value={newResults[slot.value] || existingResult?.result_number || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setNewResults(prev => ({ ...prev, [slot.value]: value }));
                          }}
                          className="w-32"
                          maxLength={6}
                        />
                        <Button
                          onClick={() => handleSaveResult(slot.value)}
                          disabled={loading}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingResult(null);
                            setNewResults(prev => ({ ...prev, [slot.value]: '' }));
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="result-number text-2xl text-foreground">
                          {existingResult?.result_number || '-'}
                        </div>
                        {existingResult && (
                          <div className="text-sm text-muted-foreground">
                            Created: {new Date(existingResult.created_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <>
                        <Button
                          onClick={() => {
                            setEditingResult(slot.value);
                            setNewResults(prev => ({ ...prev, [slot.value]: existingResult?.result_number || '' }));
                          }}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {existingResult ? <Edit className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {existingResult ? 'Edit' : 'Add'}
                        </Button>
                        
                        {existingResult && (
                          <Button
                            onClick={() => handleDeleteResult(existingResult.id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;