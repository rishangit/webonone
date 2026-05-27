"use client";

import { useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { DatePicker } from "@/components/common/DatePicker";
import { PhoneInput } from "@/components/common/PhoneInput";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import FileUpload from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { notifyShowcaseOnly } from "../../fixtures";

const MULTI_OPTIONS = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const fieldClass = "bg-[var(--input-background)] border-[var(--glass-border)]";

export function FormControlsSection() {
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(65);
  const [selectedValue, setSelectedValue] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [toggleBold, setToggleBold] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  return (
    <section id="showcase-primary-form-controls" className="space-y-4 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-foreground">Form controls</h2>
      <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <CardHeader>
          <CardTitle>Primary form controls</CardTitle>
          <CardDescription>All inputs and selection controls from the showcase catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Label</Label>
            <p className="text-sm text-muted-foreground">
              Used with every control below — <Label htmlFor="showcase-text">paired with htmlFor</Label>
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="showcase-text">Text input</Label>
              <Input id="showcase-text" placeholder="Enter text..." className={fieldClass} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="showcase-email">Email</Label>
              <Input id="showcase-email" type="email" placeholder="email@example.com" className={fieldClass} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="showcase-textarea">Textarea</Label>
            <Textarea id="showcase-textarea" rows={3} placeholder="Multiline text..." className={fieldClass} />
          </div>

          <div className="space-y-2 max-w-md">
            <Label htmlFor="showcase-phone">PhoneInput</Label>
            <PhoneInput id="showcase-phone" value={phone} onChange={setPhone} className={fieldClass} />
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <div className="space-y-2 w-full min-w-0 max-w-md">
              <Label>DatePicker</Label>
              <DatePicker value={date} onChange={setDate} className={fieldClass} />
            </div>
            <div className="space-y-2 w-full min-w-0 max-w-md">
              <Label>Calendar</Label>
              <div className="w-full min-w-[320px] max-w-[350px] rounded-md border border-[var(--glass-border)] bg-[var(--input-background)] p-2">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={setCalendarDate}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 max-w-md">
            <Label htmlFor="showcase-select">Select</Label>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger id="showcase-select" className={fieldClass}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-w-md">
            <Label>MultiSelect</Label>
            <MultiSelect
              options={MULTI_OPTIONS}
              value={multiSelectValue}
              onValueChange={setMultiSelectValue}
              placeholder="Select multiple"
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="showcase-checkbox" checked={checkboxChecked} onCheckedChange={(v) => setCheckboxChecked(v === true)} />
              <Label htmlFor="showcase-checkbox" className="cursor-pointer">
                Checkbox
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="showcase-switch" checked={switchChecked} onCheckedChange={setSwitchChecked} />
              <Label htmlFor="showcase-switch">Switch</Label>
            </div>
          </div>

          <RadioGroup value={radioValue} onValueChange={setRadioValue} className="space-y-2">
            <Label>RadioGroup</Label>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option1" id="showcase-radio-1" />
              <Label htmlFor="showcase-radio-1" className="cursor-pointer">
                Option 1
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option2" id="showcase-radio-2" />
              <Label htmlFor="showcase-radio-2" className="cursor-pointer">
                Option 2
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          <div className="space-y-3">
            <Label>Toggle</Label>
            <div className="flex gap-2">
              <Toggle pressed={toggleBold} onPressedChange={setToggleBold} aria-label="Bold" variant="outline">
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle aria-label="Italic" variant="outline">
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle aria-label="Underline" variant="outline">
                <Underline className="h-4 w-4" />
              </Toggle>
            </div>
          </div>

          <div className="space-y-3">
            <Label>ToggleGroup</Label>
            <ToggleGroup type="single" value={textAlign} onValueChange={(v) => v && setTextAlign(v)} variant="outline">
              <ToggleGroupItem value="left" aria-label="Align left">
                Left
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                Center
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                Right
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2 max-w-md">
            <Label>Slider: {sliderValue[0]}%</Label>
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
          </div>

          <Separator />

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="showcase-otp">InputOTP</Label>
            <InputOTP id="showcase-otp" maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="space-y-2 max-w-md">
            <Label>FileUpload</Label>
            <p className="text-xs text-muted-foreground">Upload attempts call the API; showcase shows toast only on success.</p>
            <FileUpload
              folderPath="showcase/demo"
              label="Upload image"
              onFileUploaded={() => notifyShowcaseOnly()}
            />
          </div>

          <Separator />

          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>ProgressBar (default)</Label>
              <ProgressBar value={progressValue} showLabel label="Completion" />
            </div>
            <div className="space-y-2">
              <Label>ProgressBar (upload)</Label>
              <ProgressBar value={progressValue} variant="upload" showLabel label="Upload" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                Decrease
              </Button>
              <Button size="sm" variant="outline" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                Increase
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Skeleton</Label>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
