import React from "react";

const Header = () => {
  return (
    <header className="py-6 px-4 border-b-[1px] border-gray-300">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        <div className="text-xl font-bold tracking-wide uppercase">
          <a href="#" className="hover:text-purple-500">
            Simbox
          </a>
        </div>
        <nav className="text-base tracking-wide">
          <a href="/" className="px-3 py-2 hover:text-purple-500">
            Home
          </a>
          <a
            href="/simulations/gravitation"
            className="px-3 py-2 hover:text-purple-500"
          >
            Simulations
          </a>
          <a href="/resources" className="px-3 py-2 hover:text-purple-500">
            Resources
          </a>
          <a href="/help" className="px-3 py-2 hover:text-purple-500">
            Help
          </a>
        </nav>
        <div className="text-base tracking-wide">
          <a href="/login" className="px-3 py-2 hover:text-purple-500">
            Log In
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
