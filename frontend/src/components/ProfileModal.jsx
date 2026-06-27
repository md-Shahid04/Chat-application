import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ProfileModal = ({ onClose }) => {
  const { user, updateProfileContext, backendUrl } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [about, setAbout] = useState(user.about);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("about", about);
    if (file) formData.append("profilePic", file);

    try {
      setSaving(true);
      const res = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateProfileContext(res.data);
      onClose();
    } catch (err) {
      alert("Failed to modify your user account details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl animate-scale-in">
        <h3 className="text-md font-bold text-neutral-200 mb-4">
          Edit Profile Context
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img
              src={
                preview ||
                (user.profilePic
                  ? `${backendUrl}${user.profilePic}`
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`)
              }
              alt="Avatar avatar preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-neutral-700"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[11px] text-emerald-400 font-semibold hover:underline"
            >
              Change Profile Picture
            </button>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/30"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              About
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows="2"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500/30 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-950 text-neutral-400 hover:text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 text-xs font-bold rounded-xl transition-colors"
            >
              {saving ? "Saving..." : "Save Options"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
