'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableColorSelect } from '@/components/searchable-color-select';
import { StolePreview } from '@/components/stole-preview';
import { FinishPreview } from '@/components/finish-preview';
import { Upload, X } from 'lucide-react';

const STOLE_TYPES = [
  { value: 'standard', label: 'Standard - 4"' },
  { value: 'luxury', label: 'Luxury - 4.5"' },
  { value: 'deluxe', label: 'Deluxe - 5"' },
];

const LENGTHS = [
  { value: '62', label: 'Short - 62"' },
  { value: '66', label: 'Medium - 66"' },
  { value: '72', label: 'Long - 72"' },
];

const COLORS = [
  'Black', 'Red', 'White', 'Royal Blue', 'Gold', 'Electric Blue', 'Daffodil',
  'Emerald Green', 'Silver', 'Purple', 'Burgundy', 'Ink Blue', 'Torrid Orange',
  'Pink', 'Forest Green', 'Off White', 'Shell Grey', 'Silver Metal Grey',
  'Antique White', 'Charcoal', 'Icy Pink', 'Sideshow Rose', 'Nude', 'Powder Pink',
  'Lt. Pink', 'Pearl Pink', 'Cinnabar', 'Cameo', 'Tulip', 'Wild Rose', 'Fantasy Rose',
  'Sherbert', 'Rosy Pink', 'Hot Pink', 'Quartz', 'Passion Fruit', 'Dusty Rose',
  'Antique Mauve', 'Sweet Nectar', 'Rosy Mauve', 'Colonial Rosy', 'Rosewood',
  'Victorian Rose', 'Shocking Pink', 'Rose Wine', 'Garden Rose', 'Azalea', 'Beauty',
  'La Rosa', 'Moonstone', 'Coral Rose', 'Poppy Red', 'Light Coral', 'Watermelon Red',
  'Hot Red', 'Scarlet', 'Ruby Wine', 'Burgundy', 'Plum Blue', 'Vapor', 'Light Blue',
  'Bluebell Blue', 'Tobaz', 'Blue Mist', 'Crystalline', 'Aqua Misty', 'Turquoise',
  'Ocean Blue', 'Tropic', 'Mineral Ice', 'Angean Blue', 'Island Blue', 'Cobalt',
  'French Blue', 'Bluebird', 'Copen', 'Porcelain Blue', 'Antique Blue', 'Turquoise',
  'Mallard', 'Tornado Blue', 'Jade', 'Smoke Blue', 'Light Navy', 'Batik Blue',
  'Military Blue', 'Navy', 'Lilac Mist', 'Light Orchid', 'Fresco', 'Thistle', 'Iris',
  'Wisteria', 'Grape', 'Delphinium', 'Ultra Violet', 'Regal Purple', 'Amethyst',
  'Grappa', 'Viola', 'Ice Mint', 'Pastel Green', 'Lime Juice', 'Pistachio', 'Mint',
  'Key Lime', 'Kiwi', 'Apple Green', 'Acid Green', 'Willow', 'Celadon', 'Soft Pine',
  'Spring Moss', 'Deep Sage', 'Moss', 'Sage Green', 'Parrot Green', 'Hunter', 'Spruce',
  'Chamois', 'Baby Maize', 'Pineapple', 'Lemon', 'Buttercup', 'Tangerine', 'Dijon',
  'Old Gold', 'Petal', 'Peach', 'Autumn Orange', 'Rust', 'Sherry', 'Raisin', 'Ivory',
  'Vanilla', 'Cream', 'Candlelight', 'Buttermilk', 'Raw Silk', 'Tan', 'Turftan',
  'Brown', 'Cappuccino',
];

const CUSTOMIZATION_TYPES = [
  { value: 'embroidery', label: 'Embroidery' },
  { value: 'print', label: 'Print' },
  { value: 'none', label: 'None (blank)' },
];

const STYLES = [
  { value: 'solid', label: 'Solid Color' },
  { value: 'trim', label: '2 Color with Trim' },
  { value: 'split', label: '2 Color Split' },
  { value: 'custom', label: 'Custom - Contact Us' },
];

const FINISHES = [
  { value: 'classic-pointed', label: 'Classic Pointed' },
  { value: 'angled', label: 'Angled' },
  { value: 'horizontal-cut', label: 'Horizontal Cut' },
];

const TRIM_WIDTHS = [
  { value: '0.5', label: '0.5"' },
  { value: '1', label: '1"' },
];

interface FilePreview {
  file: File;
  preview: string;
}

export function QuoteRequestForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  const [formData, setFormData] = useState({
    stoleType: typeParam || 'luxury',
    length: '66',
    style: 'solid',
    finish: 'classic-pointed',
    trimWidth: '0.5',
    mainColor: '',
    secondaryColor: '',
    upperColor: '',
    lowerColor: '',
    quantity: '',
    dateNeeded: '',
    customizationType: 'embroidery',
    leftText: '',
    leftSize: '',
    rightText: '',
    rightSize: '',
    additionalComments: '',
    firstName: '',
    lastName: '',
    cityState: '',
    organization: '',
    jobTitle: '',
    email: '',
    emailConfirm: '',
    phone: '',
  });

  useEffect(() => {
    if (typeParam && ['standard', 'luxury', 'deluxe'].includes(typeParam)) {
      setFormData(prev => ({ ...prev, stoleType: typeParam }));
    }
  }, [typeParam]);

  const [leftGraphic, setLeftGraphic] = useState<FilePreview | null>(null);
  const [rightGraphic, setRightGraphic] = useState<FilePreview | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-set the other color when one is selected (for backward compatibility)
      if (field === 'upperColor' && value && !prev.lowerColor && prev.style === 'split') {
        updated.lowerColor = value;
      } else if (field === 'lowerColor' && value && !prev.upperColor && prev.style === 'split') {
        updated.upperColor = value;
      }
      
      // Auto-set secondary color when main color is selected (for trim style)
      if (field === 'mainColor' && value && !prev.secondaryColor && prev.style === 'trim') {
        updated.secondaryColor = value;
      } else if (field === 'secondaryColor' && value && !prev.mainColor && prev.style === 'trim') {
        updated.mainColor = value;
      }
      
      // Clear color fields when style changes
      if (field === 'style') {
        if (value === 'solid') {
          updated.upperColor = '';
          updated.lowerColor = '';
          updated.secondaryColor = '';
          updated.mainColor = '';
        } else if (value === 'trim') {
          updated.upperColor = '';
          updated.lowerColor = '';
        } else if (value === 'split') {
          updated.mainColor = '';
          updated.secondaryColor = '';
        } else if (value === 'custom') {
          updated.upperColor = '';
          updated.lowerColor = '';
          updated.mainColor = '';
          updated.secondaryColor = '';
        }
      }
      
      return updated;
    });
  };

  const handleFileUpload = (side: 'left' | 'right', file: File | null) => {
    if (!file) {
      if (side === 'left') setLeftGraphic(null);
      else setRightGraphic(null);
      return;
    }

    const preview = URL.createObjectURL(file);
    if (side === 'left') {
      setLeftGraphic({ file, preview });
    } else {
      setRightGraphic({ file, preview });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const selectedStoleType = STOLE_TYPES.find(t => t.value === formData.stoleType);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Product Selection & Preview - Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Selection</CardTitle>
              <CardDescription>Choose your stole specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="stoleType">Width *</Label>
              <Select
                value={formData.stoleType}
                onValueChange={(value) => handleInputChange('stoleType', value)}
              >
                <SelectTrigger id="stoleType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length *</Label>
              <Select
                value={formData.length}
                onValueChange={(value) => handleInputChange('length', value)}
              >
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style *</Label>
              <Select
                value={formData.style}
                onValueChange={(value) => handleInputChange('style', value)}
              >
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finish">Finish *</Label>
              <Select
                value={formData.finish}
                onValueChange={(value) => handleInputChange('finish', value)}
              >
                <SelectTrigger id="finish">
                  <SelectValue placeholder="Select finish">
                    {formData.finish ? (
                      <div className="flex items-center gap-2">
                        <FinishPreview finish={formData.finish} className="w-8 h-4" />
                        <span>{FINISHES.find(f => f.value === formData.finish)?.label}</span>
                      </div>
                    ) : (
                      'Select finish'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FINISHES.map((finish) => (
                    <SelectItem key={finish.value} value={finish.value}>
                      <div className="flex items-center gap-2">
                        <FinishPreview finish={finish.value} className="w-8 h-4" />
                        <span>{finish.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection based on Style */}
            {formData.style === 'solid' && (
              <SearchableColorSelect
                id="mainColor"
                label="Color *"
                value={formData.mainColor}
                onValueChange={(value) => handleInputChange('mainColor', value)}
                colors={COLORS}
                placeholder="Please Select"
                required
              />
            )}

            {formData.style === 'trim' && (
              <>
                <SearchableColorSelect
                  id="mainColor"
                  label="Main Color *"
                  value={formData.mainColor}
                  onValueChange={(value) => handleInputChange('mainColor', value)}
                  colors={COLORS}
                  placeholder="Please Select"
                  required
                />
                <SearchableColorSelect
                  id="secondaryColor"
                  label="Trim Color *"
                  value={formData.secondaryColor}
                  onValueChange={(value) => handleInputChange('secondaryColor', value)}
                  colors={COLORS}
                  placeholder="Please Select"
                  required
                />
                <div className="space-y-2">
                  <Label htmlFor="trimWidth">Trim Width *</Label>
                  <Select
                    value={formData.trimWidth}
                    onValueChange={(value) => handleInputChange('trimWidth', value)}
                  >
                    <SelectTrigger id="trimWidth">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIM_WIDTHS.map((trim) => (
                        <SelectItem key={trim.value} value={trim.value}>
                          {trim.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.style === 'split' && (
              <>
                <SearchableColorSelect
                  id="upperColor"
                  label="Upper Color *"
                  value={formData.upperColor}
                  onValueChange={(value) => handleInputChange('upperColor', value)}
                  colors={COLORS}
                  placeholder="Please Select"
                  required
                />
                <SearchableColorSelect
                  id="lowerColor"
                  label="Lower Color *"
                  value={formData.lowerColor}
                  onValueChange={(value) => handleInputChange('lowerColor', value)}
                  colors={COLORS}
                  placeholder="Please Select"
                  required
                />
              </>
            )}

            {formData.style === 'custom' && (
              <div className="md:col-span-2 p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  For custom styles, please contact us directly. We'll work with you to create a unique design that meets your specific requirements.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customizationType">Customization *</Label>
              <Select
                value={formData.customizationType}
                onValueChange={(value) => handleInputChange('customizationType', value)}
              >
                <SelectTrigger id="customizationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMIZATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customization Details</CardTitle>
              <CardDescription>Add text and graphics to your stole</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {/* Left Side Customization */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                      <span className="text-2xl font-bold text-primary">L</span>
                    </div>
                    <Label className="text-base font-semibold">Left Side</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leftText">Customization Text</Label>
                    <Textarea
                      id="leftText"
                      placeholder="Describe here..."
                      value={formData.leftText}
                      onChange={(e) => handleInputChange('leftText', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leftGraphic">Upload Graphic (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="leftGraphic"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('left', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Label
                        htmlFor="leftGraphic"
                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Label>
                      {leftGraphic && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileUpload('left', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {leftGraphic && (
                      <div className="mt-2">
                        <img
                          src={leftGraphic.preview}
                          alt="Left graphic preview"
                          className="w-full h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leftSize">Approximate Size</Label>
                    <Input
                      id="leftSize"
                      placeholder="Length x Width"
                      value={formData.leftSize}
                      onChange={(e) => handleInputChange('leftSize', e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Side Customization */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                      <span className="text-2xl font-bold text-primary">R</span>
                    </div>
                    <Label className="text-base font-semibold">Right Side</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rightText">Customization Text</Label>
                    <Textarea
                      id="rightText"
                      placeholder="Describe here..."
                      value={formData.rightText}
                      onChange={(e) => handleInputChange('rightText', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rightGraphic">Upload Graphic (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rightGraphic"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('right', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Label
                        htmlFor="rightGraphic"
                        className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Label>
                      {rightGraphic && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileUpload('right', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {rightGraphic && (
                      <div className="mt-2">
                        <img
                          src={rightGraphic.preview}
                          alt="Right graphic preview"
                          className="w-full h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rightSize">Approximate Size</Label>
                    <Input
                      id="rightSize"
                      placeholder="Length x Width"
                      value={formData.rightSize}
                      onChange={(e) => handleInputChange('rightSize', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <StolePreview
              stoleType={formData.stoleType}
              length={formData.length}
              style={formData.style}
              mainColor={formData.mainColor}
              secondaryColor={formData.secondaryColor}
              trimWidth={formData.trimWidth}
              upperColor={formData.upperColor}
              lowerColor={formData.lowerColor}
              finish={formData.finish}
            />
            
            {/* Stole Diagram */}
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">L</span>
                    <div className="w-12 h-2 bg-primary/20 rounded" />
                  </div>
                  <div className="w-16 h-1 bg-border" />
                  <div className="flex items-center gap-1">
                    <div className="w-12 h-2 bg-primary/20 rounded" />
                    <span className="font-semibold">R</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Specify quantity, timeline, and any additional preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="10"
                  placeholder="Minimum 10 pieces"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateNeeded">Date Needed *</Label>
                <Input
                  id="dateNeeded"
                  type="date"
                  value={formData.dateNeeded}
                  onChange={(e) => handleInputChange('dateNeeded', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                placeholder="Let us know any other preferences you may have, here."
                value={formData.additionalComments}
                onChange={(e) => handleInputChange('additionalComments', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>We'll use this to contact you about your quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Your title or role"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="School, University, or Organization"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cityState">Address / City / State</Label>
              <Input
                id="cityState"
                placeholder="Address, City, State"
                value={formData.cityState}
                onChange={(e) => handleInputChange('cityState', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailConfirm">Re-enter Email *</Label>
              <Input
                id="emailConfirm"
                type="email"
                value={formData.emailConfirm}
                onChange={(e) => handleInputChange('emailConfirm', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" size="lg">
          Clear Form
        </Button>
        <Button type="submit" size="lg" className="min-w-[200px]">
          Request Quote & Free Design
        </Button>
      </div>
    </form>
  );
}

