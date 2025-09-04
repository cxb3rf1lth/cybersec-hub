import { useState } from 'react'
import { X } from '@/lib/phosphor-icons-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { MarketplaceFilters as Filters } from '@/types/marketplace'

interface MarketplaceFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  categories: { value: string; label: string }[]
}

export function MarketplaceFilters({ filters, onFiltersChange, categories }: MarketplaceFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 100000
  ])

  const skills = [
    'OWASP Top 10',
    'Network Security',
    'Web Application Security',
    'Mobile Security',
    'API Testing',
    'Social Engineering',
    'Phishing Campaigns',
    'Physical Security',
    'Active Directory',
    'C2 Frameworks',
    'Vulnerability Assessment',
    'Triage',
    'Program Management',
    'HackerOne',
    'Bugcrowd',
    'AWS Security',
    'Azure Security',
    'GCP Security',
    'Kubernetes',
    'Terraform',
    'DevSecOps',
    'Security Training',
    'Secure Coding',
    'Incident Response',
    'Security Awareness'
  ]

  const availabilityOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'within-week', label: 'Within a week' },
    { value: 'within-month', label: 'Within a month' },
    { value: 'future', label: 'Future availability' }
  ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category || []
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category)
    
    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    })
  }

  const handleSkillChange = (skill: string, checked: boolean) => {
    const currentSkills = filters.skills || []
    const newSkills = checked
      ? [...currentSkills, skill]
      : currentSkills.filter(s => s !== skill)
    
    onFiltersChange({
      ...filters,
      skills: newSkills.length > 0 ? newSkills : undefined
    })
  }

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const currentAvailability = filters.availability || []
    const newAvailability = checked
      ? [...currentAvailability, availability]
      : currentAvailability.filter(a => a !== availability)
    
    onFiltersChange({
      ...filters,
      availability: newAvailability.length > 0 ? newAvailability : undefined
    })
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    onFiltersChange({
      ...filters,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    })
  }

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: rating === filters.rating ? undefined : rating
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({})
    setPriceRange([0, 100000])
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof Filters]
    return Array.isArray(value) ? value.length > 0 : value !== undefined
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Service Categories</Label>
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.value}`}
                  checked={filters.category?.includes(category.value) || false}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Price Range (USD)</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Minimum Rating</Label>
          <div className="flex gap-2">
            {[4, 4.5, 5].map(rating => (
              <Button
                key={rating}
                variant={filters.rating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatingChange(rating)}
              >
                {rating}+ ★
              </Button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Availability</Label>
          <div className="space-y-2">
            {availabilityOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`availability-${option.value}`}
                  checked={filters.availability?.includes(option.value) || false}
                  onCheckedChange={(checked) => 
                    handleAvailabilityChange(option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`availability-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Skills & Expertise</Label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {skills.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={filters.skills?.includes(skill) || false}
                  onCheckedChange={(checked) => 
                    handleSkillChange(skill, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`skill-${skill}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {skill}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.category?.map(category => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {categories.find(c => c.value === category)?.label || category}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(category, false)}
                  />
                </Badge>
              ))}
              {filters.skills?.map(skill => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleSkillChange(skill, false)}
                  />
                </Badge>
              ))}
              {filters.availability?.map(availability => (
                <Badge key={availability} variant="secondary" className="gap-1">
                  {availabilityOptions.find(a => a.value === availability)?.label || availability}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleAvailabilityChange(availability, false)}
                  />
                </Badge>
              ))}
              {filters.rating && (
                <Badge variant="secondary" className="gap-1">
                  {filters.rating}+ ★
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleRatingChange(filters.rating!)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}