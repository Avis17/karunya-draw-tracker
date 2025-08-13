import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TIME_SLOTS = [
  '10:20',
  '12:20', 
  '16:20',
  '18:20',
  '20:20'
];

interface AdminResultUploadProps {
  onBack: () => void;
}

const AdminResultUpload: React.FC<AdminResultUploadProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchExistingResults = async (date: Date) => {
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

      setExistingResults(data || []);
      
      // Populate form with existing results
      const existingResultsMap: Record<string, string> = {};
      data?.forEach(result => {
        existingResultsMap[result.slot_time] = result.result_number;
      });
      setResults(existingResultsMap);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  React.useEffect(() => {
    fetchExistingResults(selectedDate);
  }, [selectedDate]);

  const handleResultChange = (timeSlot: string, value: string) => {
    // Allow only 6 digits
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setResults(prev => ({
        ...prev,
        [timeSlot]: value
      }));
    }
  };

  const handleSaveResult = async (timeSlot: string) => {
    const resultNumber = results[timeSlot];
    
    if (!resultNumber || resultNumber.length !== 6) {
      toast({
        title: "Invalid Result",
        description: "Please enter a 6-digit number",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Check if result already exists
      const existingResult = existingResults.find(r => r.slot_time === timeSlot);
      
      if (existingResult) {
        // Update existing result
        const { error } = await supabase
          .from('lottery_results')
          .update({ result_number: resultNumber })
          .eq('id', existingResult.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Result updated for ${timeSlot}`,
        });
      } else {
        // Insert new result
        const { error } = await supabase
          .from('lottery_results')
          .insert({
            draw_date: dateStr,
            slot_time: timeSlot,
            result_number: resultNumber
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Result saved for ${timeSlot}`,
        });
      }
      
      // Refresh existing results
      await fetchExistingResults(selectedDate);
    } catch (error) {
      console.error('Error saving result:', error);
      toast({
        title: "Error",
        description: "Failed to save result",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (timeSlot: string) => {
    const existingResult = existingResults.find(r => r.slot_time === timeSlot);
    
    if (!existingResult) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('lottery_results')
        .delete()
        .eq('id', existingResult.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Result deleted for ${timeSlot}`,
      });
      
      // Clear from local state
      setResults(prev => {
        const newResults = { ...prev };
        delete newResults[timeSlot];
        return newResults;
      });
      
      // Refresh existing results
      await fetchExistingResults(selectedDate);
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: "Failed to delete result",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upload Lottery Results</h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-64 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIME_SLOTS.map((timeSlot) => {
            const hasExistingResult = existingResults.some(r => r.slot_time === timeSlot);
            
            return (
              <Card key={timeSlot}>
                <CardHeader>
                  <CardTitle className="text-lg">{timeSlot}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`result-${timeSlot}`}>6-Digit Result</Label>
                    <Input
                      id={`result-${timeSlot}`}
                      value={results[timeSlot] || ''}
                      onChange={(e) => handleResultChange(timeSlot, e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg font-mono"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveResult(timeSlot)}
                      disabled={loading || !results[timeSlot] || results[timeSlot].length !== 6}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {hasExistingResult ? 'Update' : 'Save'}
                    </Button>
                    
                    {hasExistingResult && (
                      <Button
                        onClick={() => handleDeleteResult(timeSlot)}
                        disabled={loading}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {hasExistingResult && (
                    <p className="text-sm text-muted-foreground">
                      Status: Result exists
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminResultUpload;