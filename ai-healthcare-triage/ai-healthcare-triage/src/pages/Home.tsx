import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, FileText, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'

const heroSlides = [
  {
    title: 'Hospital care, simplified',
    alt: 'Modern hospital building',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895973?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Doctors coordinating treatment',
    alt: 'Doctors consulting with a patient',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Patients supported at every step',
    alt: 'Healthcare patient and medical team',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  },
]

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)
  }

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-teal-950 text-white">
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-900/35" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-slate-950/30 p-8 shadow-2xl backdrop-blur-sm sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <Sparkles size={16} /> Healthcare navigation, reimagined
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
              Smarter Healthcare Starts Before the Appointment
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Understand your symptoms, find the right care pathway, and help your doctor prepare before your consultation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/patient/assessment"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-900"
              >
                Start Assessment <ArrowRight size={18} />
              </Link>
              <a href="#how" className="rounded-xl border border-white/20 px-5 py-3 font-bold">
                How It Works
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Prototype only. Not a diagnostic tool or substitute for professional medical advice.
            </p>
          </div>

          <div className="relative mt-8 mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm sm:mt-10">
            <div className="relative h-[260px] sm:h-[320px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <img src={slide.image} alt={slide.alt} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-slate-900/5" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-200">Care experience</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{slide.title}</h2>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-slate-950/40 px-4 py-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={showPreviousSlide}
                aria-label="Previous slide"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex flex-1 items-center justify-center gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={showNextSlide}
                aria-label="Next slide"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/10"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['AI Symptom Pre-Triage', 'Answer a few simple questions and receive guidance on an appropriate care pathway.', ClipboardCheck],
            ['Automated Consultation Briefing', 'Your responses are organized into a concise summary for your doctor.', FileText],
            ['Smart Priority Queue', 'Help organize appointments based on reported urgency.', ShieldCheck],
          ].map(([title, text, Icon]) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={title as string}>
              <div className="mb-5 w-fit rounded-xl bg-sky-50 p-3 text-sky-600">
                <Icon size={22} />
              </div>
              <h2 className="text-xl font-bold">{title as string}</h2>
              <p className="mt-2 leading-6 text-slate-600">{text as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-black">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-5">
            {['Tell us your symptoms', 'Answer a few questions', 'Get a care pathway', 'Book an appointment', 'Doctor reviews your information'].map((x, i) => (
              <div key={x} className="rounded-2xl bg-slate-50 p-5">
                <span className="text-sm font-black text-sky-600">0{i + 1}</span>
                <p className="mt-3 font-bold">{x}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={35} />
        <h2 className="mt-4 text-3xl font-black">Designed with safety in mind</h2>
        <p className="mt-4 leading-7 text-slate-600">
          CareFlow provides informational healthcare navigation and pre-consultation support. It does not diagnose diseases, prescribe medication, or replace professional medical advice.
        </p>
      </section>
      <Footer />
    </div>
  )
}
