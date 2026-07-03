import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-2xl text-neutral-700 mb-8">Page Not Found</p>
        <a
          href="/"
          className="btn btn-primary btn-lg"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
