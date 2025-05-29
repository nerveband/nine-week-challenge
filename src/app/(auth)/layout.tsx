import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-brand-pink/10 safe-area-padding-y">
      {/* Mobile-optimized header */}
      <div className="flex-none px-4 py-6 sm:hidden">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-pink transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Logo and branding */}
          <div className="text-center animate-fade-in">
            <Link href="/" className="inline-block">
              <Image
                src="/docs/nwc-icon.png"
                alt="Nine Week Challenge"
                width={72}
                height={72}
                className="mx-auto rounded-2xl shadow-lg"
                priority
              />
            </Link>
            <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Nine Week Challenge
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Transform Your Habits in 9 Weeks
            </p>
          </div>
          
          {/* Form container with better mobile styling */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 animate-fade-in-delay">
            {children}
          </div>
        </div>
      </div>
      
      {/* PWA install hint for mobile */}
      <div className="flex-none px-4 py-4 text-center sm:hidden">
        <p className="text-xs text-muted-foreground">
          Add to home screen for the best experience
        </p>
      </div>
    </div>
  )
}