import { useState } from "react";
import { Check, FileText, Clock, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Icon } from "../../components/common/Icon";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { toast } from "sonner";

interface AppointmentCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    patientName: string;
    patientImage?: string;
    service: string;
    date: string;
    time: string;
    staff?: {
      name: string;
      image?: string;
      specialization: string;
    };
  };
  onComplete: (completionData: {
    status: string;
    notes: string;
    nextAppointmentDate?: string;
    prescriptions?: string[];
    recommendations?: string;
    followUpRequired: boolean;
    duration: string;
    cost?: number;
  }) => void;
}

export function AppointmentCompletionDialog({
  open,
  onOpenChange,
  appointment,
  onComplete
}: AppointmentCompletionDialogProps) {
  const [status, setStatus] = useState("completed");
  const [notes, setNotes] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [prescriptions, setPrescriptions] = useState<string[]>([]);
  const [newPrescription, setNewPrescription] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [duration, setDuration] = useState("30");
  const [cost, setCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleAddPrescription = () => {
    if (newPrescription.trim()) {
      setPrescriptions(prev => [...prev, newPrescription.trim()]);
      setNewPrescription("");
    }
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please add appointment notes");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const completionData = {
        status,
        notes: notes.trim(),
        nextAppointmentDate: nextAppointmentDate || undefined,
        prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
        recommendations: recommendations.trim() || undefined,
        followUpRequired,
        duration,
        cost: cost > 0 ? cost : undefined
      };

      onComplete(completionData);
      
      // Reset form
      setStatus("completed");
      setNotes("");
      setNextAppointmentDate("");
      setPrescriptions([]);
      setNewPrescription("");
      setRecommendations("");
      setFollowUpRequired(false);
      setDuration("30");
      setCost(0);
      
      onOpenChange(false);
      toast.success("Appointment completed successfully!");
    } catch (error) {
      toast.error("Failed to complete appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "partially-completed": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case "cancelled": return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      case "no-show": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      default: return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Icon icon={Check} size="sm" />;
      case "partially-completed": return <Icon icon={Clock} size="sm" />;
      case "cancelled": return <Icon icon={AlertCircle} size="sm" />;
      case "no-show": return <Icon icon={AlertCircle} size="sm" />;
      default: return <Icon icon={FileText} size="sm" />;
    }
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Complete Appointment"
      description="Mark this appointment as completed and add relevant notes and details"
      maxWidth="max-w-2xl"
      className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[var(--glass-border)] bg-[var(--glass-bg)] text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !notes.trim()}
            variant="accent"
            className="font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Completing...
              </div>
            ) : (
              "Complete Appointment"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
          {/* Appointment Details */}
          <div className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={appointment.patientImage} alt={appointment.patientName} />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                  {appointment.patientName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{appointment.patientName}</h3>
                <p className="text-sm text-muted-foreground">{appointment.service}</p>
                <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time}</p>
              </div>
              
              {appointment.staff && (
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{appointment.staff.name}</p>
                  <p className="text-xs text-muted-foreground">{appointment.staff.specialization}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <Label htmlFor="status" className="text-muted-foreground">Appointment Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed Successfully</SelectItem>
                <SelectItem value="partially-completed">Partially Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">Patient No-Show</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-2">
              <Badge className={getStatusColor(status)}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
              </Badge>
            </div>
          </div>

          {/* Duration and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-muted-foreground">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--glass-border)]"
                placeholder="30"
              />
            </div>
            
            <div>
              <Label htmlFor="cost" className="text-muted-foreground">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost || ""}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="bg-[var(--input-background)] border-[var(--glass-border)]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Appointment Notes */}
          <div>
            <Label htmlFor="notes" className="text-muted-foreground">Appointment Notes *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[var(--input-background)] border-[var(--glass-border)] min-h-[100px]"
              placeholder="Add detailed notes about the appointment, procedures performed, patient condition, etc."
            />
          </div>

          {/* Prescriptions */}
          <div>
            <Label className="text-muted-foreground">Prescriptions</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newPrescription}
                  onChange={(e) => setNewPrescription(e.target.value)}
                  className="bg-[var(--input-background)] border-[var(--glass-border)]"
                  placeholder="Add prescription or medication"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPrescription()}
                />
                <Button 
                  type="button" 
                  onClick={handleAddPrescription}
                  size="sm"
                  className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
                >
                  Add
                </Button>
              </div>
              
              {prescriptions.length > 0 && (
                <div className="space-y-2">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded">
                      <span className="text-sm text-foreground">{prescription}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePrescription(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <Label htmlFor="recommendations" className="text-muted-foreground">Recommendations</Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
              placeholder="Add recommendations for the patient (lifestyle, follow-up care, etc.)"
              rows={3}
            />
          </div>

          {/* Follow-up Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUp"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--accent-primary)]"
              />
              <Label htmlFor="followUp" className="text-sm text-foreground cursor-pointer">
                Follow-up appointment required
              </Label>
            </div>
            
            {followUpRequired && (
              <div>
                <Label htmlFor="nextAppointment" className="text-muted-foreground">Suggested Next Appointment Date</Label>
                <Input
                  id="nextAppointment"
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="bg-[var(--input-background)] border-[var(--glass-border)]"
                />
              </div>
            )}
          </div>
        </div>
    </CustomDialog>
  );
}