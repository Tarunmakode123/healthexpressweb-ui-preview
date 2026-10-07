import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { HEALTH_ARTICLES } from '../data/articles';
import { ArrowLeft, Clock, Calendar, Share2, MessageSquare, ShieldCheck } from 'lucide-react';
import { openWhatsApp, DEFAULT_MESSAGES } from '../utils/whatsapp';

export default function ArticleDetailPage({ onOpenUploadModal }) {
  const { slug } = useParams();
  const article = HEALTH_ARTICLES.find(a => a.slug === slug) || HEALTH_ARTICLES[0];

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link
          to="/health-library"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Health Library</span>
        </Link>

        {/* Article Meta Header */}
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase">
            {article.category}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Published {article.publishedDate}</span>
            </div>
            <div className="ml-auto text-purple-700 font-semibold">
              Health Express Medical Review
            </div>
          </div>
        </div>

        {/* Hero Featured Image */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-purple-100 h-64 sm:h-96">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Content Render */}
        <div 
          className="prose prose-purple max-w-none text-slate-700 space-y-4 leading-relaxed text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Interactive Consultation Banner */}
        <div className="bg-purple-50 rounded-3xl p-8 border border-purple-200 space-y-4 text-center mt-12">
          <h3 className="text-xl font-bold text-slate-900">
            Have questions about this test or prescription?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Our staff can help you schedule home sample collection or connect with partner diagnostic centers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openWhatsApp(DEFAULT_MESSAGES.test(article.title))}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </button>
            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm"
            >
              Upload Prescription
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
