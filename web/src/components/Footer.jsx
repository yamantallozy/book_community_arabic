import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} مجتمع القراء. جميع الحقوق محفوظة.
                </p>
                <div className="flex justify-center gap-6 mt-4 text-sm text-slate-400">
                    <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
                    <a href="#" className="hover:text-primary transition-colors">شروط الخدمة</a>
                    <a href="#" className="hover:text-primary transition-colors">تواصل معنا</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
