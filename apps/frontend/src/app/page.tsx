"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Mic, Headphones, Play, Shield, Cloud, Zap } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
                <Mic className="w-12 h-12 text-white" />
              </div>
              <Headphones className="w-12 h-12 text-blue-600" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Voice Recorder
              <span className="block text-blue-600">Made Simple</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Record, store, and share high-quality audio recordings with our
              professional voice recording platform. Perfect for meetings,
              interviews, podcasts, and personal notes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register">
                <Button size="lg" className="px-8 py-4 text-lg">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording Free
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Hero Image/Demo */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Professional Audio Recording Interface
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to record
            </h2>
            <p className="text-xl text-gray-600">
              Professional features for personal and business use
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                High-Quality Recording
              </h3>
              <p className="text-gray-600">
                Crystal clear audio with advanced noise reduction and echo
                cancellation technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Cloud Storage
              </h3>
              <p className="text-gray-600">
                Automatic cloud backup ensures your recordings are safe and
                accessible anywhere.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                End-to-end encryption and secure authentication keep your
                recordings private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to start recording?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of users who trust Voice Recorder for their audio
            needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50"
              >
                <Mic className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Mic className="w-5 h-5" />
              </div>
              <span className="font-semibold">Voice Recorder</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Voice Recorder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
