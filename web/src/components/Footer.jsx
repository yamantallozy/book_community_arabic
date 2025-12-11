import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Book Community. All rights reserved.
                </p>
                <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
                    <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
