'use client';

import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { getColorHex } from '@/lib/colors';

interface SearchableColorSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  colors: string[];
  placeholder?: string;
  required?: boolean;
}

export function SearchableColorSelect({
  id,
  label,
  value,
  onValueChange,
  colors,
  placeholder = 'Please Select',
  required = false,
}: SearchableColorSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredColors = useMemo(() => {
    if (!searchQuery.trim()) return colors;
    const query = searchQuery.toLowerCase();
    return colors.filter((color) =>
      color.toLowerCase().includes(query)
    );
  }, [colors, searchQuery]);

  const selectedColor = colors.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === value
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setSearchQuery('');
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedColor ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-border shadow-sm flex-shrink-0"
                  style={{ backgroundColor: getColorHex(value) }}
                />
                <span>{selectedColor}</span>
              </div>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Search Input */}
          <div className="sticky top-0 z-10 bg-popover backdrop-blur-md border-b p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Color List */}
          <div className="max-h-[250px] overflow-y-auto">
            {filteredColors.length > 0 ? (
              filteredColors.map((color) => {
                const colorValue = color.toLowerCase().replace(/\s+/g, '-');
                const colorHex = getColorHex(colorValue);
                return (
                  <SelectItem
                    key={color}
                    value={colorValue}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border shadow-sm flex-shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span>{color}</span>
                    </div>
                  </SelectItem>
                );
              })
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No colors found matching "{searchQuery}"
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}

