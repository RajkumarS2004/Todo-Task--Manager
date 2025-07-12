import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Avatar file size must be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio
      };

      if (formData.avatar) {
        updateData.avatar = formData.avatar;
      }

      await updateProfile(updateData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || '',
      avatar: null
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-cyan rounded-xl sm:rounded-2xl flex items-center justify-center shadow-cyan border border-[#00eaff]">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#b0b8c1] mb-2 tracking-tight">
              Profile <span className="text-gradient-cyan">👤</span>
            </h1>
            <p className="text-base sm:text-lg text-[#b0b8c1] font-light">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300"
                  aria-label="Edit profile"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.586 2.586a2 2 0 112.828 2.828L11.828 15H9v-2.828l9.586-9.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-cyan rounded-full flex items-center justify-center shadow-cyan border-4 border-[#00eaff] overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 h-8 w-8 sm:h-10 sm:w-10 bg-gradient-cyan rounded-full flex items-center justify-center cursor-pointer shadow-cyan border-2 border-white hover:scale-110 transition-transform duration-200">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        aria-label="Upload avatar image"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#00eaff] mb-2">
                    {user?.name || 'User Name'}
                  </h3>
                  <p className="text-sm sm:text-base text-[#b0b8c1]">{user?.email || 'user@example.com'}</p>
                  {isEditing && (
                    <p className="text-xs sm:text-sm text-[#b0b8c1]/60 mt-2">
                      Click the camera icon to change avatar
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] placeholder-[#b0b8c1]/50 focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300"
                      placeholder="Enter your full name"
                      required
                      aria-label="Full name"
                    />
                  ) : (
                    <div className="p-4 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl">
                      <p className="text-sm sm:text-base text-[#b0b8c1]">{user?.name || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">
                    Email
                  </label>
                  <div className="p-4 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl">
                    <p className="text-sm sm:text-base text-[#b0b8c1]">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#00eaff] mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl text-[#b0b8c1] placeholder-[#b0b8c1]/50 focus:outline-none focus:border-[#00eaff]/40 focus:ring-2 focus:ring-[#00eaff]/20 transition-all duration-300 resize-none"
                    placeholder="Tell us about yourself..."
                    aria-label="Bio"
                  />
                ) : (
                  <div className="p-4 bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl">
                    <p className="text-sm sm:text-base text-[#b0b8c1]">{user?.bio || 'No bio provided'}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 text-sm sm:text-base font-medium text-[#b0b8c1] bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl hover:bg-[#00eaff]/10 hover:text-[#00eaff] transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Stats */}
        <div className="space-y-6">
          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#43e97b]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#43e97b]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#43e97b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Account Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-[#b0b8c1]">Member Since</span>
                <span className="text-sm sm:text-base font-medium text-[#00eaff]">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-[#b0b8c1]">Last Login</span>
                <span className="text-sm sm:text-base font-medium text-[#00eaff]">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-[#b0b8c1]">Account Status</span>
                <span className="px-2 py-1 text-xs sm:text-sm font-medium bg-[#43e97b]/20 text-[#43e97b] rounded-full border border-[#43e97b]/30">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-xl sm:rounded-2xl border border-[#00eaff]/20 p-4 sm:p-6 shadow-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#a259ff]/10 rounded-lg sm:rounded-xl flex items-center justify-center border border-[#a259ff]/30">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-[#a259ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#b0b8c1]">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 text-sm sm:text-base font-medium text-[#b0b8c1] bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl hover:bg-[#00eaff]/10 hover:text-[#00eaff] transition-all duration-300 text-left">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </div>
              </button>
              <button className="w-full px-4 py-3 text-sm sm:text-base font-medium text-[#b0b8c1] bg-[#1a1a1a]/50 border border-[#00eaff]/20 rounded-lg sm:rounded-xl hover:bg-[#00eaff]/10 hover:text-[#00eaff] transition-all duration-300 text-left">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Privacy Settings
                </div>
              </button>
              <button className="w-full px-4 py-3 text-sm sm:text-base font-medium text-[#ff6b6b] bg-[#1a1a1a]/50 border border-[#ff6b6b]/20 rounded-lg sm:rounded-xl hover:bg-[#ff6b6b]/10 transition-all duration-300 text-left">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 