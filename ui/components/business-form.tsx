"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, X } from "lucide-react";

interface BusinessFormProps {
  onSubmit: (businessData: any) => void;
  onCancel: () => void;
}

const INDUSTRY_SECTORS = [
  "Pharma & Healthcare",
  "E-commerce, D2C & Retail",
  "IT & Electronics",
  "Industries & Edutech",
  "Real Estate & Construction",
  "Finance & Banking",
  "Food & Beverage",
  "Automotive",
  "Energy & Utilities",
  "Media & Entertainment",
  "Transportation & Logistics",
  "Agriculture & Farming",
  "Textiles & Apparel",
  "Tourism & Hospitality"
];

const LEGAL_STRUCTURES = [
  "Private Limited Company",
  "Public Limited Company",
  "Partnership",
  "Limited Liability Partnership (LLP)",
  "Sole Proprietorship",
  "One Person Company (OPC)",
  "Section 8 Company (NGO)",
  "Cooperative Society"
];

const TURNOVER_RANGES = [
  "Below 1 Crore",
  "1-5 Crore",
  "5-10 Crore",
  "Above 10 Crore"
];

const EMPLOYMENT_RANGES = [
  "1 to 20",
  "20 to 50",
  "50 to 100",
  "100 to 500",
  "Above 500"
];

export function BusinessForm({ onSubmit, onCancel }: BusinessFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    industrySector: "",
    subSector: "",
    location: "",
    positionTitle: "",
    establishmentYear: "",
    legalStructure: "",
    briefDescription: "",
    productsOrServices: "",
    website: "",
    annualTurnoverRange: "",
    directEmployment: "",
    indirectEmployment: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.industrySector) newErrors.industrySector = "Industry sector is required";
    if (!formData.subSector.trim()) newErrors.subSector = "Sub-sector is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.positionTitle.trim()) newErrors.positionTitle = "Position title is required";
    if (!formData.establishmentYear.trim()) newErrors.establishmentYear = "Establishment year is required";
    if (!formData.legalStructure) newErrors.legalStructure = "Legal structure is required";
    if (!formData.briefDescription.trim()) newErrors.briefDescription = "Brief description is required";
    if (!formData.productsOrServices.trim()) newErrors.productsOrServices = "Products/Services description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 bg-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Add New Business
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="md:col-span-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name *
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter company name"
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>

            {/* Industry Sector */}
            <div>
              <Label htmlFor="industrySector" className="text-sm font-medium">
                Industry Sector *
              </Label>
              <select
                id="industrySector"
                value={formData.industrySector}
                onChange={(e) => handleInputChange("industrySector", e.target.value)}
                className={`w-full h-10 px-3 py-2 border rounded-md text-sm ${
                  errors.industrySector ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select industry sector</option>
                {INDUSTRY_SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              {errors.industrySector && (
                <p className="text-red-500 text-xs mt-1">{errors.industrySector}</p>
              )}
            </div>

            {/* Sub Sector */}
            <div>
              <Label htmlFor="subSector" className="text-sm font-medium">
                Sub-Sector *
              </Label>
              <Input
                id="subSector"
                value={formData.subSector}
                onChange={(e) => handleInputChange("subSector", e.target.value)}
                placeholder="e.g., Hospitals, Software, etc."
                className={errors.subSector ? "border-red-500" : ""}
              />
              {errors.subSector && (
                <p className="text-red-500 text-xs mt-1">{errors.subSector}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>

            {/* Position Title */}
            <div>
              <Label htmlFor="positionTitle" className="text-sm font-medium">
                Your Position *
              </Label>
              <Input
                id="positionTitle"
                value={formData.positionTitle}
                onChange={(e) => handleInputChange("positionTitle", e.target.value)}
                placeholder="e.g., CEO, Founder, Manager"
                className={errors.positionTitle ? "border-red-500" : ""}
              />
              {errors.positionTitle && (
                <p className="text-red-500 text-xs mt-1">{errors.positionTitle}</p>
              )}
            </div>

            {/* Establishment Year */}
            <div>
              <Label htmlFor="establishmentYear" className="text-sm font-medium">
                Establishment Year *
              </Label>
              <Input
                id="establishmentYear"
                value={formData.establishmentYear}
                onChange={(e) => handleInputChange("establishmentYear", e.target.value)}
                placeholder="e.g., 2020"
                className={errors.establishmentYear ? "border-red-500" : ""}
              />
              {errors.establishmentYear && (
                <p className="text-red-500 text-xs mt-1">{errors.establishmentYear}</p>
              )}
            </div>

            {/* Legal Structure */}
            <div>
              <Label htmlFor="legalStructure" className="text-sm font-medium">
                Legal Structure *
              </Label>
              <select
                id="legalStructure"
                value={formData.legalStructure}
                onChange={(e) => handleInputChange("legalStructure", e.target.value)}
                className={`w-full h-10 px-3 py-2 border rounded-md text-sm ${
                  errors.legalStructure ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select legal structure</option>
                {LEGAL_STRUCTURES.map(structure => (
                  <option key={structure} value={structure}>{structure}</option>
                ))}
              </select>
              {errors.legalStructure && (
                <p className="text-red-500 text-xs mt-1">{errors.legalStructure}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://www.example.com"
              />
            </div>

            {/* Annual Turnover */}
            <div>
              <Label htmlFor="annualTurnoverRange" className="text-sm font-medium">
                Annual Turnover Range
              </Label>
              <select
                id="annualTurnoverRange"
                value={formData.annualTurnoverRange}
                onChange={(e) => handleInputChange("annualTurnoverRange", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select turnover range</option>
                {TURNOVER_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Direct Employment */}
            <div>
              <Label htmlFor="directEmployment" className="text-sm font-medium">
                Direct Employment
              </Label>
              <select
                id="directEmployment"
                value={formData.directEmployment}
                onChange={(e) => handleInputChange("directEmployment", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select employment range</option>
                {EMPLOYMENT_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Indirect Employment */}
            <div>
              <Label htmlFor="indirectEmployment" className="text-sm font-medium">
                Indirect Employment
              </Label>
              <select
                id="indirectEmployment"
                value={formData.indirectEmployment}
                onChange={(e) => handleInputChange("indirectEmployment", e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select employment range</option>
                {EMPLOYMENT_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Brief Description */}
            <div className="md:col-span-2">
              <Label htmlFor="briefDescription" className="text-sm font-medium">
                Brief Description *
              </Label>
              <textarea
                id="briefDescription"
                value={formData.briefDescription}
                onChange={(e) => handleInputChange("briefDescription", e.target.value)}
                placeholder="Brief description of your business"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm resize-none ${
                  errors.briefDescription ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.briefDescription && (
                <p className="text-red-500 text-xs mt-1">{errors.briefDescription}</p>
              )}
            </div>

            {/* Products or Services */}
            <div className="md:col-span-2">
              <Label htmlFor="productsOrServices" className="text-sm font-medium">
                Products or Services *
              </Label>
              <textarea
                id="productsOrServices"
                value={formData.productsOrServices}
                onChange={(e) => handleInputChange("productsOrServices", e.target.value)}
                placeholder="Describe your products or services"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm resize-none ${
                  errors.productsOrServices ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.productsOrServices && (
                <p className="text-red-500 text-xs mt-1">{errors.productsOrServices}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Business
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}