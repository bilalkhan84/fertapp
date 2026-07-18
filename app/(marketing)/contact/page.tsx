import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us — FertTrack",
  description: "Get in touch with the FertTrack team.",
};

export default function ContactPage() {
  return (
    <section className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
          Contact us
        </h1>
        <p className="mt-3 text-charcoal-500 leading-relaxed">
          Questions, feedback, or just want to say hi? We'd love to hear from
          you.
        </p>
      </div>
      <ContactClient />
    </section>
  );
}
