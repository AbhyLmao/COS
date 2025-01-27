'use client';
import { useState, useEffect } from 'react';

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessageWithTimeout({ message }: { message: Message }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000); // Message will disappear after 6 seconds

    return () => clearTimeout(timer);
  }, [message]);

  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="bg-green-100 text-green-700 border-l-4 border-green-500 px-4 py-2 rounded">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="bg-red-100 text-red-700 border-l-4 border-red-500 px-4 py-2 rounded">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <div className="bg-gray-100 text-gray-700 border-l-4 border-gray-500 px-4 py-2 rounded">
          {message.message}
        </div>
      )}
    </div>
  );
}
