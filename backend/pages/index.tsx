
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">StockSavvy API Server</h1>
        <p className="text-gray-600 mb-6">
          This is the backend API server for StockSavvy inventory management system.
          Please use the appropriate API endpoints to interact with the system.
        </p>
        <div className="bg-gray-100 p-4 rounded-md">
          <code className="text-sm">
            API Endpoints:<br />
            • /api/users/me<br />
            • /api/products<br />
            • /api/stores<br />
            • /api/invite-worker
          </code>
        </div>
      </div>
    </div>
  );
}
