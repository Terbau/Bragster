import {
  Scan,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative px-6 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    AI-Powered Receipt Processing
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-black dark:text-white leading-tight">
                  Split bills
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    smarter
                  </span>
                  , not harder
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Scan any receipt and instantly assign items to different
                  people. No more manual calculations, just effortless
                  splitting.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/receipt"
                  className="group bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Try AI Smart Receipt</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    10k+
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receipts Processed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Accuracy Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black dark:text-white">
                    5 sec
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Average Process Time
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      Receipt Scanner
                    </h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Scan receipt with camera
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Scan className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        AI extracts all items
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Assign items to people
                      </span>
                      <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        Coffee - $4.50
                      </span>
                      <span className="text-blue-600 font-medium">Alice</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        Sandwich - $12.99
                      </span>
                      <span className="text-purple-600 font-medium">Bob</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        Tip - $2.50
                      </span>
                      <span className="text-green-600 font-medium">Split</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white">
              Why choose Bragster?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              AI-powered precision meets effortless simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                Smart AI Recognition
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Advanced OCR technology instantly reads any receipt format,
                extracting items, prices, and details with incredible accuracy.
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                Effortless Splitting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Simply tap to assign items to different people. Handle complex
                splits, shared items, and tips with just a few taps.
              </p>
            </div>

            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Process receipts in seconds, not minutes. Get accurate splits
                instantly and settle bills while you're still at the table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Three simple steps to split any bill
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                1
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  Scan Your Receipt
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Take a photo of any receipt with your phone camera. Our AI
                  works with all formats and languages.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                2
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  Review & Assign
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Check the extracted items and tap to assign them to different
                  people. Add names and make adjustments easily.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl">
                3
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-black dark:text-white">
                  Get Results
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Instantly see who owes what, including tax and tip
                  calculations. Share results or export for payment apps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-black dark:text-white">
              Ready to split smarter?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of users who've made bill splitting effortless with
              AI Smart Receipt
            </p>
          </div>

          <Link
            href="/receipt"
            className="group bg-black dark:bg-white text-white dark:text-black px-12 py-4 rounded-xl font-semibold text-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Start Splitting Now</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
