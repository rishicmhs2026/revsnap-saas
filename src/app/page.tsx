import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundColor: '#111827', minHeight: '100vh'}}>
      {/* Cinematic spotlight effect */}
      <div className="absolute inset-0 spotlight"></div>
      
      {/* Additional cinematic glow */}
      <div className="absolute inset-0 cinematic-glow"></div>

      {/* Main content - centered both horizontally and vertically */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '4rem', letterSpacing: '0.2em', color: 'white'}}>
            What is revenue optimization?
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl font-sans leading-relaxed max-w-3xl mx-auto mb-12" style={{fontSize: '1.5rem', letterSpacing: '0.1em', color: '#d1d5db'}}>
            We help businesses break through pricing barriers to unlock maximum profitability with data-driven insights and AI-powered recommendations.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/demo"
              className="bg-white text-gray-900 font-sans font-semibold rounded-full px-8 py-4 text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              style={{fontSize: '1.125rem', letterSpacing: '0.05em'}}
            >
              Get Started
            </Link>
            <Link 
              href="/learn-more" 
              className="border-2 border-white text-white font-sans font-semibold rounded-full px-8 py-4 text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              style={{fontSize: '1.125rem', letterSpacing: '0.05em'}}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle brand name in corner */}
      <div className="absolute bottom-8 left-8 z-20">
        <h2 className="font-sans text-sm" style={{fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1rem', letterSpacing: '0.1em', color: '#9ca3af'}}>
          RevSnap
        </h2>
      </div>
    </div>
  )
}
