import { Suspense } from 'react';
import { Header } from '@/components/header';
import { QuoteRequestForm } from '@/components/quote-request-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Page Header */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Request a Quote & Free Design
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a custom quote for your graduation stoles. We'll create a free design proof for your approval before you order.
            </p>
          </div>

          {/* Benefits Banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="font-medium">Free design proof included</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="font-medium">No obligation to order</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="font-medium">Fast response within 24 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Form */}
          <Suspense fallback={<div className="text-center py-8">Loading form...</div>}>
            <QuoteRequestForm />
          </Suspense>

          {/* Additional Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-muted-foreground">
                  <strong className="text-foreground">Submit Your Request:</strong> Fill out the form above with your preferences and customization details.
                </li>
                <li className="text-muted-foreground">
                  <strong className="text-foreground">Free Design Proof:</strong> Our design team will create a custom proof based on your specifications (usually within 24-48 hours).
                </li>
                <li className="text-muted-foreground">
                  <strong className="text-foreground">Review & Approve:</strong> You'll receive the design proof via email for your review. Request revisions if needed - unlimited revisions included!
                </li>
                <li className="text-muted-foreground">
                  <strong className="text-foreground">Place Your Order:</strong> Once approved, we'll provide a final quote and you can confirm your order. Custom orders ship within 28 days.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 mt-12">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Graduation Stoles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

