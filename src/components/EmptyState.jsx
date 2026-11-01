import React from "react";
import { Search } from "lucide-react";

export default function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <Search size={24} />
      <strong>Nothing here yet</strong>
      <p>{text}</p>
    </div>
  );
}
