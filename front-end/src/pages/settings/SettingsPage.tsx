import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, User, Bell, Lock, Globe, Palette, Eye, Shield, Smartphone, Mail, MessageSquare, Calendar, Clock } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useIsMobile } from "../../components/ui/use-mobile";
import { config } from "../../config/environment";
import { CompanySettingsPage } from "../companies/CompanySettingsPage";

interface SettingsPageProps {
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  currentTheme: "light" | "dark" | "system";
  onAccentColorChange: (accentColor: "orange" | "red" | "green" | "blue" | "yellow") => void;
  currentAccentColor: "orange" | "red" | "green" | "blue" | "yellow";
}

export function SettingsPage({ onThemeChange, currentTheme, onAccentColorChange, currentAccentColor }: SettingsPageProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    appointments: true,
    reminders: true,
    marketing: false
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC-8",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    currency: "USD"
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: false,
    contactInfo: true,
    analytics: true
  });

  const isMobile = useIsMobile();

  const themeOptions = [
    { value: "light", label: "Light Mode", icon: Sun, description: "Light theme for better visibility" },
    { value: "dark", label: "Dark Mode", icon: Moon, description: "Dark theme for reduced eye strain" },
    { value: "system", label: "System", icon: Monitor, description: "Follow system preference" }
  ];

  const ThemeCard = ({ option }: { option: typeof themeOptions[0] }) => {
    const Icon = option.icon;
    const isSelected = currentTheme === option.value;

    return (
      <Card 
        className={`p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl border-[var(--glass-border)] ${
          isSelected 
            ? "bg-[var(--accent-bg)] border-[var(--accent-border)] shadow-lg shadow-[var(--glass-shadow)]" 
            : "bg-[var(--glass-bg)] hover:border-[var(--accent-border)] hover:bg-accent/50"
        }`}
        onClick={() => onThemeChange(option.value as "light" | "dark" | "system")}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? "bg-[var(--accent-bg)]" : "bg-accent/50"}`}>
            <Icon className={`w-5 h-5 ${isSelected ? "text-[var(--accent-text)]" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${isSelected ? "text-[var(--accent-text)]" : "text-foreground"}`}>
                {option.label}
              </h3>
              {isSelected && (
                <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
          </div>
        </div>
      </Card>
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    children 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    children: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/50">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h4 className="text-foreground font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and application settings</p>
        </div>
        <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] w-fit">
          All changes saved automatically
        </Badge>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system">System Setting</TabsTrigger>
          <TabsTrigger value="company">Company Setting</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Appearance Section */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                <Palette className="w-5 h-5 text-[var(--accent-text)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
                <p className="text-muted-foreground text-sm">Customize the look and feel of your workspace</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-foreground font-medium mb-3">Theme Preference</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {themeOptions.map((option) => (
                    <ThemeCard key={option.value} option={option} />
                  ))}
                </div>
              </div>
              
              <Separator className="bg-border" />
              
              <div>
                <h3 className="text-foreground font-medium mb-3">Accent Color</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose your preferred accent color for buttons and highlights</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: "orange", label: "Orange", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.2)" },
                    { value: "red", label: "Red", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)" },
                    { value: "green", label: "Green", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.2)" },
                    { value: "blue", label: "Blue", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.2)" },
                    { value: "yellow", label: "Yellow", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.2)" }
                  ].map((color) => {
                    const isSelected = currentAccentColor === color.value;
                    return (
                      <Card 
                        key={color.value}
                        className={`p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl border-[var(--glass-border)] ${
                          isSelected 
                            ? "border-2 shadow-lg" 
                            : "hover:border-2 hover:bg-accent/50"
                        }`}
                        style={{
                          borderColor: isSelected ? color.color : undefined,
                          backgroundColor: isSelected ? color.bgColor : undefined
                        }}
                        onClick={() => onAccentColorChange(color.value as "orange" | "red" | "green" | "blue" | "yellow")}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: color.color }}
                          />
                          <span className={`text-sm font-medium ${isSelected ? 'opacity-100' : 'text-muted-foreground'}`} style={{ color: isSelected ? color.color : undefined }}>
                            {color.label}
                          </span>
                          {isSelected && (
                            <Badge className="text-xs" style={{ backgroundColor: color.bgColor, color: color.color, borderColor: color.color }}>
                              Active
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                <p className="text-muted-foreground text-sm">Control how you receive notifications and updates</p>
              </div>
            </div>

            <div className="space-y-1">
              <SettingItem
                icon={Mail}
                title="Email Notifications"
                description="Receive updates via email"
              >
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Smartphone}
                title="Push Notifications"
                description="Get notifications on your device"
              >
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={MessageSquare}
                title="SMS Notifications"
                description="Receive text message alerts"
              >
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Calendar}
                title="Appointment Notifications"
                description="Get notified about appointments"
              >
                <Switch
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointments: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Clock}
                title="Reminders"
                description="Receive appointment reminders"
              >
                <Switch
                  checked={notifications.reminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reminders: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Mail}
                title="Marketing Emails"
                description="Receive promotional content"
              >
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </SettingItem>
            </div>
          </Card>

          {/* Privacy & Security Section */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
                <p className="text-muted-foreground text-sm">Manage your privacy and security preferences</p>
              </div>
            </div>

            <div className="space-y-1">
              <SettingItem
                icon={User}
                title="Profile Visibility"
                description="Make your profile visible to others"
              >
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Eye}
                title="Activity Status"
                description="Show when you're active"
              >
                <Switch
                  checked={privacy.activityVisible}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, activityVisible: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Mail}
                title="Contact Information"
                description="Allow others to see your contact info"
              >
                <Switch
                  checked={privacy.contactInfo}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, contactInfo: checked }))}
                />
              </SettingItem>

              <Separator className="bg-border" />

              <SettingItem
                icon={Globe}
                title="Analytics"
                description="Help improve our service with usage data"
              >
                <Switch
                  checked={privacy.analytics}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))}
                />
              </SettingItem>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Regional Settings */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Regional Settings</h2>
                <p className="text-muted-foreground text-sm">Configure your locale preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Language</label>
                <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Timezone</label>
                <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="UTC+0">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Date Format</label>
                <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                  <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Time Format</label>
                <Select value={preferences.timeFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, timeFormat: value }))}>
                  <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Currency</label>
                <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Account Actions</h2>
                <p className="text-muted-foreground text-sm">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-foreground"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              
              <Separator className="bg-border" />
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
              >
                <Lock className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>

          {/* App Info */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="text-center space-y-2">
              <h3 className="text-foreground font-medium">WebOnOne</h3>
              <p className="text-sm text-muted-foreground">Version {config.appVersion}</p>
              <p className="text-xs text-muted-foreground">© 2024 All rights reserved</p>
            </div>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <div className="-m-4 lg:-m-8">
            <CompanySettingsPage />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}