import { Header } from '@/components/header';
import { ProductCard } from '@/components/product-card';

export default function ProductsPage() {
  const products = [
    {
      id: 'standard',
      name: 'Standard Stoles',
      description: 'Perfect for low budget orders with quality materials',
      width: '4"',
      features: [
        'Single lined construction',
        '100+ colors available',
        'Finest regal satin',
        'Length: 62", 66" or 72"',
        'Arrow point ends',
      ],
      priceRange: '$12-18',
      badge: 'Budget Friendly',
      href: '/products/standard',
    },
    {
      id: 'luxury',
      name: 'Luxury Stoles',
      description: 'Premium quality with double lining and color combinations',
      width: '4½"',
      features: [
        'Double lined construction',
        '100+ colors available',
        '2 color combo possible',
        'Finest regal satin',
        'Length: 62", 66" or 72"',
        'Arrow point ends',
      ],
      priceRange: '$18-25',
      badge: 'Popular',
      href: '/products/luxury',
    },
    {
      id: 'deluxe',
      name: 'Deluxe Stoles',
      description: 'Classic Greek style with premium width and finish',
      width: '5"',
      features: [
        'Double lined construction',
        '100+ colors available',
        'Classic Greek style',
        'Finest regal satin',
        'Length: 62", 66" or 72"',
        'V-tip ends',
      ],
      priceRange: '$25-35',
      badge: 'Premium',
      href: '/products/deluxe',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Our Products
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose from our premium collection of graduation stoles. All products include free design work and fast shipping.
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Fast Free Delivery</h3>
                <p className="text-muted-foreground">
                  UPS or USPS shipping included in all prices. Custom orders ship within 28 days.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Free Design Work</h3>
                <p className="text-muted-foreground">
                  Free design proof before order confirmation. No obligation, unlimited revisions.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Satisfaction Guarantee</h3>
                <p className="text-muted-foreground">
                  100% satisfaction guarantee. Free returns within 48 hours if not satisfied.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Graduation Stoles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

