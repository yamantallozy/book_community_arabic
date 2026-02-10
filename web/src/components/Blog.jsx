import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
                {/* Icon */}
                <div className="text-7xl mb-6 animate-bounce">📝</div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                    المدونة قادمة قريباً!
                </h1>

                {/* Description */}
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    نعمل على إعداد مساحة مميزة لمشاركة المقالات والنصائح والمراجعات الأدبية.
                    ترقبوا محتوى غني ومفيد لعشاق القراءة!
                </p>

                {/* Features Coming */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                    <h3 className="text-sm uppercase font-bold text-indigo-600 mb-4">ما الذي ستجدونه هنا؟</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            <span>مراجعات مفصلة</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✍️</span>
                            <span>نصائح للكتّاب</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🎯</span>
                            <span>قوائم كتب مختارة</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            <span>مقابلات مع مؤلفين</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    <span>العودة للرئيسية</span>
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default Blog;
