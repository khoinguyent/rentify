import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo href="/" />
          
          <nav className="flex items-center gap-6">
            <Link href="/landlords" className="text-gray-600 hover:text-gray-900 font-medium">
              Landlords
            </Link>
            <Link href="/find-home" className="text-gray-600 hover:text-gray-900 font-medium">
              Find my home
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Sign in
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-black mb-6 leading-tight">
              <span className="text-primary">Smart tools</span> for <span className="text-primary">stress-free</span> property management
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              List, lease, and bill—all automatically. No brokers. No manual work. Just effortless property management.
            </p>
            
            {/* <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium">What is a broker fee?</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 hover:text-gray-900 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium">How do you save me all that money?</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:flex-1 lg:items-stretch lg:justify-end bg-gray-50">
          <div className="w-auto h-full">
            <div className="relative h-full">
              {/* Main illustration image - fit to image width */}
              <div className="h-full w-auto rounded-3xl overflow-hidden shadow-lg">
                <img 
                  src="/homepage-right.jpg" 
                  alt="Property management dashboard interface" 
                  className="h-full w-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Search Bar */}
      {/* <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                  <option>Boston, MA</option>
                  <option>New York, NY</option>
                  <option>San Francisco, CA</option>
                  <option>Chicago, IL</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                  <option>Any</option>
                  <option>This month</option>
                  <option>Next month</option>
                  <option>In 3 months</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Beds</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
                  <option>Any</option>
                  <option>Studio</option>
                  <option>1 Bedroom</option>
                  <option>2 Bedrooms</option>
                  <option>3+ Bedrooms</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 h-10">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

