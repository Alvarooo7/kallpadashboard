import React from "react";

export const Card = ({ title, value, description, bgColor }) => {
  return (
    <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: bgColor || "#f5f5f5" }}>
      <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
      <h2 className="text-3xl font-bold">{value}</h2>
      <p className="text-green-600 text-sm">{description}</p>
    </div>
  );
};
