import React from "react";

const ChatbotSidebar = () => {
    return (
        <aside className="w-96 border-r bg-white flex flex-col shadow-sm">
        <div className="p-4 border-b font-bold text-lg">AI Epidemiologist</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Chat messages will go here */}
          <div className="bg-slate-100 p-3 rounded-lg text-sm">
            Hello! How can I help you analyze the SEIR simulation today?
          </div>
        </div>
        <div className="p-4 border-t">
          <input 
            type="text" 
            placeholder="Ask Gemini..." 
            className="w-full p-2 border rounded-md outline-blue-500"
          />
        </div>
      </aside>
    );
};

export default ChatbotSidebar;