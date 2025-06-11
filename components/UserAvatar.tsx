import React from 'react';

interface UserAvatarProps {
  nama?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  nama, 
  size = 'md', 
  loading = false, 
  className = '' 
}) => {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm'
  };

  const baseClasses = `${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${className}`;

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse ${className}`}>
      </div>
    );
  }

  if (!nama) {
    return (
      <div className={baseClasses}>
        <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <span className="font-semibold text-white">
        {getUserInitials(nama)}
      </span>
    </div>
  );
};

export default UserAvatar;
