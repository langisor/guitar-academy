"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Moon, Sun, Bell, Globe, Target, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useProgressStore } from "@/stores/progress";

export default function SettingsPage() {
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { dailyGoalMinutes } = useProgressStore();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [goalMinutes, setGoalMinutes] = useState(dailyGoalMinutes);

  const handleGoalChange = (minutes: number) => {
    setGoalMinutes(minutes);
    useProgressStore.setState({ dailyGoalMinutes: minutes });
  };

  return (
    <div className="min-h-full pb-20">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ChevronLeft className={`w-6 h-6 ${isRTL ? "rotate-180" : ""}`} />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t.common.settings}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t.settings.language}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "English" : "العربية"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                >
                  EN
                </Button>
                <Button 
                  size="sm" 
                  variant={language === "ar" ? "default" : "outline"}
                  onClick={() => setLanguage("ar")}
                >
                  ع
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">{t.settings.darkMode}</p>
                  <p className="text-sm text-muted-foreground">
                    {darkMode ? "On" : "Off"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    darkMode ? (isRTL ? "left-1" : "right-1") : isRTL ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t.settings.notifications}</p>
                  <p className="text-sm text-muted-foreground">
                    {notifications ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications ? (isRTL ? "left-1" : "right-1") : isRTL ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">
                    {soundEffects ? "On" : "Off"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSoundEffects(!soundEffects)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  soundEffects ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEffects ? (isRTL ? "left-1" : "right-1") : isRTL ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{t.settings.dailyGoal}</p>
                <p className="text-sm text-muted-foreground">
                  {goalMinutes} {t.settings.minutes}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {[10, 15, 20, 30].map((mins) => (
                <Button
                  key={mins}
                  size="sm"
                  variant={goalMinutes === mins ? "default" : "outline"}
                  onClick={() => handleGoalChange(mins)}
                >
                  {mins}m
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">App Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
