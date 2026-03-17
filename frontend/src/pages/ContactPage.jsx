import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { navItems } from "../data/landingPage";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-green-700">

      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <LandingHeader navItems={navItems} />

        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl font-bold text-green-600 mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or want to collaborate? Reach out to us using the form or contact info below.
          </p>
        </section>

        {/* Contact Info Cards */}
        <section className="grid md:grid-cols-3 gap-6 py-12 text-center">
          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <FaMapMarkerAlt className="text-green-600 mx-auto text-3xl mb-3" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Address</h3>
            <p className="text-gray-600">123 ThinkBack Street, Colombo, Sri Lanka</p>
          </div>

          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <FaPhone className="text-green-600 mx-auto text-3xl mb-3" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Phone</h3>
            <p className="text-gray-600">+94 77 123 4567</p>
          </div>

          <div className="p-6 border rounded-xl shadow-md hover:shadow-lg transition">
            <FaEnvelope className="text-green-600 mx-auto text-3xl mb-3" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Email</h3>
            <p className="text-gray-600">support@thinkback.ai</p>
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-2xl mx-auto bg-white border rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Send us a Message</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-green-600 mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                placeholder="Your Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-600 mb-1">Subject</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                placeholder="Subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-600 mb-1">Message</label>
              <textarea
                rows="4"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                placeholder="Write your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Send Message
            </button>
          </form>
        </section>

        {/* Social Media */}
        <section className="text-center pb-16">
          <h3 className="text-xl font-semibold text-green-600 mb-4">Follow Us</h3>
          <div className="flex justify-center gap-6 text-white">
            <a href="#" className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition">
              <FaTwitter />
            </a>
            <a href="#" className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition">
              <FaLinkedinIn />
            </a>
          </div>
        </section>

        {/* Google Map Placeholder */}
        {/* <section className="max-w-4xl mx-auto pb-16">
          <div className="border rounded-lg overflow-hidden">
            <iframe
              title="ThinkBack Location"
              src="https://maps.google.com/maps?q=Colombo&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </section> */}

      </div>

      <LandingFooter />
    </div>
  );
}

export default ContactPage;