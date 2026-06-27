import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Sidebar = ({ onSelectRecipient, activeRecipient, openProfileModal }) => {
  const { user, logout, onlineUsers, backendUrl } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to parse remote directories array records:", err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 border-r border-neutral-800/40">
      {/* Current User Info Row */}
      <div className="p-4 bg-neutral-900/60 border-b border-neutral-800/40 flex items-center justify-between shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={openProfileModal}
        >
          <img
            src={
              user.profilePic
                ? `${backendUrl}${user.profilePic}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
            }
            alt="My Avatar"
            className="w-9 h-9 rounded-full object-cover border border-neutral-700 group-hover:border-emerald-500/50 transition-colors"
          />
          <span className="text-sm font-bold text-neutral-200 truncate max-w-[120px]">
            {user.username}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-neutral-500 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
        </button>
      </div>

      {/* Directory Search Box Panel */}
      <div className="p-3 shrink-0">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-neutral-950 text-neutral-200 placeholder-neutral-600 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-neutral-800 focus:outline-none focus:border-emerald-500/20"
          />
        </div>
      </div>

      {/* Active Directory Contacts Navigation Stream List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/20 custom-scrollbar">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((item) => {
            const isOnline = onlineUsers.includes(item._id);
            const isSelected = activeRecipient?._id === item._id;
            return (
              <div
                key={item._id}
                onClick={() => onSelectRecipient(item)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all duration-150
                  ${isSelected ? "bg-neutral-800/60" : "hover:bg-neutral-800/30"}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      item.profilePic
                        ? `${backendUrl}${item.profilePic}`
                        : `https://api.dicebear.com/7.x/initials/svg?seed=${item.username}`
                    }
                    alt="Contact avatar"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-neutral-900 rounded-full" />
                  )}
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="text-xs font-bold text-neutral-300 truncate">
                    {item.username}
                  </h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {item.about}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-neutral-600">
            No matching contacts located
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
