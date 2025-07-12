import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      weeklyReports: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showBio: true,
      allowTaskSharing: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: user,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.info('Account deletion feature coming soon...');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#b0b8c1] mb-2 tracking-tight">
              Settings <span className="text-gradient-cyan">⚙️</span>
            </h1>
            <p className="text-base sm:text-lg text-[#b0b8c1] font-light">
              Customize your experience and manage your preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Settings */}
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#00eaff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#00eaff]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#00eaff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSettingChange('theme', 'theme', 'dark')}
                    className={`p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                      settings.theme === 'dark'
                        ? 'border-[#00eaff] bg-[#00eaff]/10 shadow-cyan'
                        : 'border-[#00eaff]/30 bg-[#1a1a1a]/50 hover:border-[#00eaff]/50'
                    }`}
                    aria-label="Dark theme"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#0a0a0a] rounded-full border-2 border-[#00eaff]"></div>
                      <span className="text-sm sm:text-base text-[#b0b8c1] font-medium">Dark Mode</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 006 3h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Notifications</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-lg sm:rounded-xl border border-[#00eaff]/10">
                  <div>
                    <h3 className="text-sm sm:text-base text-[#b0b8c1] font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00eaff] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] ${
                      value ? 'bg-[#00eaff]' : 'bg-[#444]'
                    }`}
                    aria-label={`Toggle ${key} notifications`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#a259ff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#a259ff]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#a259ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Privacy</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-lg sm:rounded-xl border border-[#00eaff]/10">
                  <div>
                    <h3 className="text-sm sm:text-base text-[#b0b8c1] font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleSettingChange('privacy', key, typeof value === 'boolean' ? !value : value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00eaff] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] ${
                      value ? 'bg-[#00eaff]' : 'bg-[#444]'
                    }`}
                    aria-label={`Toggle ${key} privacy setting`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences Settings */}
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#f1c27d]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#f1c27d]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#f1c27d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Preferences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">Language</label>
                <select
                  id="language"
                  value={settings.preferences.language}
                  onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">Timezone</label>
                <select
                  id="timezone"
                  value={settings.preferences.timezone}
                  onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
                  aria-label="Select timezone"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">Date Format</label>
                <select
                  id="dateFormat"
                  value={settings.preferences.dateFormat}
                  onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
                  aria-label="Select date format"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">Time Format</label>
                <select
                  id="timeFormat"
                  value={settings.preferences.timeFormat}
                  onChange={(e) => handleSettingChange('preferences', 'timeFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
                  aria-label="Select time format"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </>
                )}
              </button>
              <button
                onClick={handleExportData}
                className="w-full px-4 py-3 text-sm sm:text-base font-medium text-[#b0b8c1] bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl hover:bg-[#00eaff]/10 hover:text-[#00eaff] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
            </div>
          </div>

          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#ff6b6b]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#ff6b6b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#ff6b6b]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Danger Zone</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-3 text-sm sm:text-base font-medium text-[#ff6b6b] bg-[#1a1a1a]/50 border border-[#ff6b6b]/20 rounded-lg sm:rounded-xl hover:bg-[#ff6b6b]/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 