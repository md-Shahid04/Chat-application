import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ProfileModal from "../components/ProfileModal";

const Dashboard = () => {
  const [recipient, setRecipient] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-neutral-950 overflow-hidden relative">
      {/* Structural Master Split Panel Layout Frame grids */}
      <div
        className={`h-full w-full md:w-80 shrink-0 select-none ${recipient ? "hidden md:block" : "block"}`}
      >
        <Sidebar
          onSelectRecipient={setRecipient}
          activeRecipient={recipient}
          openProfileModal={() => setIsProfileOpen(true)}
        />
      </div>

      <div
        className={`h-full flex-1 min-w-0 ${!recipient ? "hidden md:flex" : "flex"} items-center justify-center bg-neutral-950`}
      >
        {recipient ? (
          <ChatWindow
            recipient={recipient}
            closeChat={() => setRecipient(null)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-6 select-none">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800/60 flex items-center justify-center text-neutral-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785 4.75 4.75 0 003.424-1.248c.245-.06.497-.04.743.047.859.304 1.796.472 2.766.472z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-neutral-400">
              No Conversation Active
            </h3>
            <p className="text-xs text-neutral-600 max-w-xs leading-relaxed">
              Select an operational profile user directory item from your
              contact sidebar panel to start messaging.
            </p>
          </div>
        )}
      </div>

      {/* Profile Modification Overlay Portal Layer */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
