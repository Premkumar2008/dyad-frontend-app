import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, LogOut, ChevronDown, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Landing: React.FC = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout({
        showNotification: true,
        reason: 'user_initiated',
        redirectPath: '/login'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const handleDashboardRedirect = () => {
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">DYAD</span>
              <span className="text-2xl font-bold text-blue-600 ml-1">Practice Solutions</span>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDashboardRedirect}
                  className="hidden md:inline-block text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <User className="w-5 h-5" />
                    <span className="ml-2 hidden sm:inline">{user.name}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  
                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={handleDashboardRedirect}
                        className="md:hidden w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </button>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  <Link 
                    to="/about" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    About Us
                  </Link>
                  <Link 
                    to="/services" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    What We Do
                  </Link>
                  <Link 
                    to="/who-we-serve" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Who We Serve
                  </Link>
                  <Link 
                    to="/contact" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Contact Us
                  </Link>
                  <div className="flex items-center space-x-4 ml-8">
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
                
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center">
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-opacity duration-300 ${isUserMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`block h-0.5 w-6 bg-gray-600 transition-transform duration-300 ${isUserMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                  </div>
                </button>
                
                {/* Mobile Navigation Menu */}
                {isUserMenuOpen && (
                  <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
                    <div className="px-4 py-4 space-y-3">
                      <Link 
                        to="/about" 
                        className="block text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        About Us
                      </Link>
                      <Link 
                        to="/services" 
                        className="block text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        What We Do
                      </Link>
                      <Link 
                        to="/who-we-serve" 
                        className="block text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Who We Serve
                      </Link>
                      <div className="border-t border-gray-200 pt-3 space-y-2">
                        <Link 
                          to="/login" 
                          className="block text-gray-700 hover:text-gray-900 font-medium py-2 px-4 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link 
                          to="/register" 
                          className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Video Hero Section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/dyad-bannervideo.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
              alt="Healthcare Professional"
              className="w-full h-full object-cover"
            />
          </video>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            {/* Healthcare Professional Image */}
            <div className="mb-8 md:mb-12">
              <div className="relative inline-block">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  alt="Healthcare Professional"
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white/30 shadow-2xl mx-auto"
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl scale-110 -z-10"></div>
              </div>
            </div>

            {/* Main Title - matching reference style */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              <span className="block mb-2">Transforming Healthcare</span>
              <span className="block text-blue-100">Through Innovation</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-blue-50 mb-8 md:mb-12 leading-relaxed max-w-3xl mx-auto">
              We're rewriting the rules. By uniting industry expertise, innovative technology, and operational risk controls, we're introducing a new model of integration that streamlines operations and cuts costs.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
              {user ? (
                <button
                  onClick={handleDashboardRedirect}
                  className="bg-white text-blue-600 px-8 md:px-10 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 md:px-10 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-transparent text-white px-8 md:px-10 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 text-lg border-2 border-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                <div className="text-sm md:text-base text-blue-100">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm md:text-base text-blue-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                <div className="text-sm md:text-base text-blue-100">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-specific optimizations */}
        <div className="lg:hidden absolute bottom-4 left-0 right-0 z-20">
          <div className="text-center">
            <div className="inline-flex flex-col items-center text-white animate-bounce">
              <span className="text-xs mb-1">Scroll</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Us</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              "We operate at the intersection of expertise, technology, and trust, bringing deep industry knowledge and strategic insight to every engagement. Grounded in transparency and integrity, we align with those who prioritize operational excellence and long-term sustainability. Our approach is straightforward: no shortcuts, just a commitment to delivering meaningful results."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Story & Inspiration</h3>
              <p className="text-gray-600">
                The origins and purpose of DYAD Practice Solutions, founded on the principle of transforming healthcare operations through innovative technology and strategic partnerships.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Clarity & Accountability</h3>
              <p className="text-gray-600">
                Partnership through integrity and transparency
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Empowering Physician Autonomy</h3>
              <p className="text-gray-600">
                Maintaining independence while providing enterprise-level support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Trusted by Healthcare Leaders</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">MC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. Michael Chen</p>
                  <p className="text-sm text-gray-600">Hospital Administrator</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The comprehensive dashboard and analytics have improved our operational efficiency by 40%. Patient data management has never been easier."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">ER</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. Emily Rodriguez</p>
                  <p className="text-sm text-gray-600">Private Practice Owner</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Finally, a healthcare platform that understands the real needs of modern practices. The scheduling features alone have saved us hours each week."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-600">JW</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Dr. James Wilson</p>
                  <p className="text-sm text-gray-600">Clinic Director</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"Security and compliance features give us peace of mind. The HIPAA-compliant documentation system is exactly what we needed."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {user ? (
              <>
                Continue Your Healthcare Journey
              </>
            ) : (
              <>
                Ready to Transform Your Healthcare Practice?
              </>
            )}
          </h2>
          <p className="text-xl text-primary-200 mb-8">
            {user ? (
              <>
                Access your dashboard to manage patients, appointments, and grow your practice
              </>
            ) : (
              <>
                Access dashboard
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <button
                onClick={handleDashboardRedirect}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/login" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DYAD PRACTICE</span>
              </div>
              <p className="text-gray-400">
                Modern healthcare management solutions for today's medical practices.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Dyad Practice Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
