import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  width: string;
  features: string[];
  priceRange: string;
  badge?: string;
  href: string;
}

export function ProductCard({
  id,
  name,
  description,
  width,
  features,
  priceRange,
  badge,
  href,
}: ProductCardProps) {
  return (
    <Card className="group flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">{name}</CardTitle>
            <CardDescription className="text-base font-medium text-foreground">
              {width} width
            </CardDescription>
          </div>
          {badge && (
            <Badge variant="secondary" className="ml-2">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-4">
        <div className="w-full text-center">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="text-2xl font-bold">{priceRange}</p>
        </div>
        <Link href={`/quote?type=${id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary/90">
            Request Quote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

