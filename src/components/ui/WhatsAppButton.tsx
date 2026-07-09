"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hi I am TechBlonHub, I am interested in your website"
  );

  return (
    <a
      href={`https://wa.me/447902000786?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 flex items-center gap-2 bg-zinc-900 text-white px-4 py-3 rounded-full shadow-lg z-50 hover:scale-105 transition"
    >
      <FaWhatsapp size={20} />
      <span className="text-sm font-medium">WhatsApp</span>
    </a>
  );
}