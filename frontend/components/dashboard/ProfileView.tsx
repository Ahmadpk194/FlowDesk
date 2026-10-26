'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Loader2, Edit2, Camera } from 'lucide-react';
import { getUserProfile } from '@/lib/api/auth.api';
import { formatFullDateTime } from '@/lib/api/requests.api';
import { toast } from 'sonner';

export default function ProfileView() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        // The API returns the profile object directly
        setProfile(response);
      } catch (error) {
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#2a14b4] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-600">We couldn't retrieve your profile data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#2a14b4] to-[#4338CA]"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg">
                <div className="w-full h-full bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#2a14b4]">
                  <User className="w-16 h-16" />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-600 hover:text-[#2a14b4] transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <button className="mb-2 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
          
          <div className="mt-6">
            <h1 className="text-3xl font-extrabold text-[#0d1c2e] capitalize">{profile.name || 'User'}</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2 mt-1 uppercase tracking-wider text-sm">
              <Shield className="w-4 h-4 text-[#2a14b4]" />
              {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0d1c2e] mb-6">Account Details</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-lg font-bold text-gray-900">{profile.email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${profile.is_active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Role</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{profile.role}</p>
                <p className="text-xs text-gray-500">Determines your access levels across FlowDesk.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                <p className="text-lg font-bold text-gray-900">{profile.created_at ? formatFullDateTime(profile.created_at) : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Activity */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0d1c2e] mb-6">Security & Preferences</h2>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900 mb-1">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account.</p>
              <button className="text-sm font-bold text-[#4338CA] hover:underline">Enable 2FA →</button>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-bold text-gray-900 mb-1">Password Management</p>
              <p className="text-sm text-gray-500 mb-3">Keep your account secure with a strong password.</p>
              <button className="text-sm font-bold text-[#4338CA] hover:underline">Change Password →</button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Tip */}
      <div className="bg-[#0d1c2e] text-white rounded-3xl p-8 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">FlowDesk Enterprise Status</h3>
          <p className="text-gray-400 text-sm max-w-lg">
            Your account is currently active and synced with the company directory. All request permissions are granted based on your {profile.role} role.
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            System Online
          </div>
        </div>
      </div>
    </div>
  );
}
