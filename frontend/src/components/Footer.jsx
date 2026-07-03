import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-gradient mb-4">FreshFarm</h3>
            <p className="text-neutral-400 mb-4">
              Direct to consumer delivery platform connecting farmers with urban customers.
            </p>
            <div className="flex gap-4 text-xl">
              <button onClick={() => {}} className="hover:text-primary-500 transition" aria-label="Facebook">
                <FaFacebook />
              </button>
              <button onClick={() => {}} className="hover:text-primary-500 transition" aria-label="Twitter">
                <FaTwitter />
              </button>
              <button onClick={() => {}} className="hover:text-primary-500 transition" aria-label="Instagram">
                <FaInstagram />
              </button>
              <button onClick={() => {}} className="hover:text-primary-500 transition" aria-label="LinkedIn">
                <FaLinkedin />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-primary-500 transition">Home</Link></li>
              <li><Link to="/products" className="text-neutral-400 hover:text-primary-500 transition">Products</Link></li>
              <li><a href="/about" className="text-neutral-400 hover:text-primary-500 transition">About Us</a></li>
              <li><a href="/contact" className="text-neutral-400 hover:text-primary-500 transition">Contact</a></li>
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h4 className="font-bold text-lg mb-4">For Farmers</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-neutral-400 hover:text-primary-500 transition">Register as Farmer</Link></li>
              <li><button onClick={() => {}} className="text-neutral-400 hover:text-primary-500 transition text-left">How it Works</button></li>
              <li><button onClick={() => {}} className="text-neutral-400 hover:text-primary-500 transition text-left">Pricing</button></li>
              <li><button onClick={() => {}} className="text-neutral-400 hover:text-primary-500 transition text-left">Support</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Info</h4>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-center gap-2 hover:text-primary-500 transition cursor-pointer">
                <FaPhone className="text-primary-500" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 hover:text-primary-500 transition cursor-pointer">
                <FaEnvelope className="text-primary-500" />
                support@freshfarm.com
              </li>
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="text-primary-500 mt-1" />
                <span>Bangalore, Karnataka<br />India - 560001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-neutral-400 text-sm">
          <p>© {currentYear} FreshFarm. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <button onClick={() => {}} className="hover:text-primary-500 transition">Privacy Policy</button>
            <button onClick={() => {}} className="hover:text-primary-500 transition">Terms of Service</button>
            <button onClick={() => {}} className="hover:text-primary-500 transition">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
