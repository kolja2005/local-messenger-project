
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <div className="spinner mx-auto"></div>
        <p className="text-lg text-primary font-medium">Загрузка...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
