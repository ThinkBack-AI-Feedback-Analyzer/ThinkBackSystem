import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { navItems } from "../data/landingPage";

function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-green-700">
      
      <div className="mx-auto max-w-7xl px-6 py-6">
        <LandingHeader navItems={navItems} />

        <section className="py-16 text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-6">
            About ThinkBack AI
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            ThinkBack AI Feedback Analyzer is a smart platform designed to
            analyze user feedback using Artificial Intelligence. Our system
            helps organizations understand customer opinions, identify trends,
            and improve services through data-driven insights.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 py-12">

          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-3">
              Our Mission
            </h3>
            <p className="text-gray-600">
              To transform feedback into meaningful insights using advanced AI
              technologies.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600">
              To become a leading AI-driven feedback analysis platform that
              helps organizations make better decisions.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-3">
              Our Technology
            </h3>
            <p className="text-gray-600">
              We use Natural Language Processing (NLP) and machine learning
              models to analyze large volumes of feedback efficiently.
            </p>
          </div>

        </section>
      </div>

      <LandingFooter />
    </div>
  );
}

export default AboutPage;