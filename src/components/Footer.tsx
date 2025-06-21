import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full p-4 text-center bg-[#0D0D1A]/50 backdrop-blur-sm z-10">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs sm:text-sm text-gray-500">
          &copy; {currentYear} PivotFlow. All Rights Reserved.
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Disclaimer: This is a demo application. Use at your own risk. No financial advice provided.'); }} className="ml-2 text-cyan-400 hover:text-cyan-300 underline">
            Disclaimer
          </a>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Powered by the Internet Computer.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
