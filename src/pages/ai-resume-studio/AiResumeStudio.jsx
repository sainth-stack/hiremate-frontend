import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeCard from '../../components/resumeCards/resumeCard';
import './aiResumeStudio.css';
import resumeBuilderImg from '../../assets/resume Builder.jpeg';
import atsReviewImg from '../../assets/ATS review.jpeg';
import resumeAnalyzerImg from '../../assets/resumeAnalyzer.jpeg';

const CARD_ROUTES = {
  'Resume Generator': '/resume-generator',
  'Resume Scan': '/job-scan',
  'Resume Analyzer': '/resume-analyzer',
};

const CARDS = [
  {
    category: 'Resume Generator',
    accentCategory: false,
    title: 'Build a Professional Resume in Minutes',
    subtitle: 'Create a job-winning resume tailored to your experience and target role using AI',
    image: resumeBuilderImg,
  },
  {
    category: 'Resume Scan',
    accentCategory: true,
    title: 'No More ATS Resume Rejections',
    subtitle: 'Ensure an ATS Score of more than 80% and get more interview calls',
    image: atsReviewImg,
  },
  {
    category: 'Resume Analyzer',
    accentCategory: false,
    title: 'Get Deep Insights on Your Resume',
    subtitle: 'Analyze strengths, gaps and keyword matches between your resume and the job description',
    image: resumeAnalyzerImg,
  },
];

export default function AiResumeStudio() {
  const navigate = useNavigate();

  return (
    <div className="ai-studio-page">
      <header className="ai-studio-page__hero">
        <h1 className="ai-studio-page__hero-title">Accelerate Your Path to Employment</h1>
        <p className="ai-studio-page__hero-sub">
          Sign up and start <span className="ai-studio-page__hero-em">enhancing</span> your job
          search experience now
        </p>
        <span className="ai-studio-page__hero-line" aria-hidden="true" />
      </header>

      <section className="ai-studio-page__grid" aria-label="AI Resume tools">
        {CARDS.map((card) => (
          <ResumeCard
            key={card.category}
            {...card}
            onClick={CARD_ROUTES[card.category] ? () => navigate(CARD_ROUTES[card.category]) : undefined}
          />
        ))}
      </section>
    </div>
  );
}
