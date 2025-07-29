import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-apple-black relative overflow-hidden">
      {/* Cinematic spotlight effect */}
      <div className="absolute inset-0 spotlight"></div>
      
      {/* Additional cinematic glow */}
      <div className="absolute inset-0 cinematic-glow"></div>

      {/* Main content - centered both horizontally and vertically */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight tracking-tight mb-8">
            What is revenue optimization?
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-apple-gray-300 font-sans leading-relaxed max-w-3xl mx-auto mb-12">
            We help businesses break through pricing barriers to unlock maximum profitability with data-driven insights and AI-powered recommendations.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/demo"
              className="bg-white text-apple-black font-sans font-semibold rounded-full px-8 py-4 text-lg hover:bg-apple-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link 
              href="/learn-more" 
              className="border-2 border-white text-white font-sans font-semibold rounded-full px-8 py-4 text-lg hover:bg-white hover:text-apple-black transition-all duration-300 transform hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle brand name in corner */}
      <div className="absolute bottom-8 left-8 z-20">
        <h2 className="text-apple-gray-400 font-sans text-sm tracking-wide">
          RevSnap
        </h2>
      </div>
    </div>
  )
}
