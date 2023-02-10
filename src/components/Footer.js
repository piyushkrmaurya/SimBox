import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="container mx-auto text-center">
        <ul className="flex justify-center">
          <li className="mr-6">
            <a href="#" className="text-white hover:text-gray-400">
              About
            </a>
          </li>
          <li className="mr-6">
            <a href="#" className="text-white hover:text-gray-400">
              Contact
            </a>
          </li>
          <li className="mr-6">
            <a href="#" className="text-white hover:text-gray-400">
              Privacy Policy
            </a>
          </li>
          <li className="mr-6">
            <a href="#" className="text-white hover:text-gray-400">
              Terms of Service
            </a>
          </li>
        </ul>
        <p className="text-gray-500 text-xs mt-8">
          Copyright 2021 Simbox. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
