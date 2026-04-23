import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, Mail, Phone, School, 
  MessageSquare, AlertCircle,
  ArrowLeft, ArrowRight, Check, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'School & Experience', icon: School },
  { id: 3, title: 'Questions', icon: MessageSquare },
  { id: 4, title: 'Final Details', icon: Check },
];

export default function ApplicationForm({ user, onSuccess, existingApplication = null }) {
  const buildInitialFormData = (application = null) => ({
    full_name: application?.full_name || user?.full_name || '',
    email: application?.email || user?.email || '',
    phone: application?.phone || '',
    age: application?.age ? String(application.age) : '',
    school: application?.school || '',
    grade: application?.grade || '',
    experience_level: application?.experience_level || '',
    dietary_restrictions: application?.dietary_restrictions || '',
    tshirt_size: application?.tshirt_size || '',
    why_attend: application?.why_attend || '',
    project_idea: application?.project_idea || '',
    heard_from: application?.heard_from || '',
    emergency_contact_name: application?.emergency_contact_name || '',
    emergency_contact_phone: application?.emergency_contact_phone || '',
    agree_to_terms: application?.agree_to_terms ?? false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(buildInitialFormData(existingApplication));

  useEffect(() => {
    setFormData(buildInitialFormData(existingApplication));
    setCurrentStep(1);
    setErrors({});
  }, [existingApplication, user]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.full_name) newErrors.full_name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.age) newErrors.age = 'Age is required';
    } else if (step === 2) {
      if (!formData.school) newErrors.school = 'School is required';
      if (!formData.grade) newErrors.grade = 'Grade is required';
      if (!formData.experience_level) newErrors.experience_level = 'Experience level is required';
    } else if (step === 3) {
      if (!formData.why_attend) newErrors.why_attend = 'Please tell us why you want to attend';
    } else if (step === 4) {
      if (!formData.agree_to_terms) newErrors.agree_to_terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    
    const applicationData = {
      ...formData,
      age: parseInt(formData.age) || 0,
    };
    
    try {
      // Add user_id so RLS policies know who owns the application
      const applicationWithUserId = {
        ...applicationData,
        user_id: user?.id,
      };

      let savedApplication = null;
      let error = null;

      if (existingApplication?.id) {
        const { data, error: updateError } = await supabase
          .from('applications')
          .update(applicationWithUserId)
          .eq('id', existingApplication.id)
          .eq('user_id', user?.id)
          .select()
          .single();
        savedApplication = data;
        error = updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('applications')
          .insert([applicationWithUserId])
          .select()
          .single();
        savedApplication = data;
        error = insertError;
      }

      if (error) throw error;

      onSuccess(savedApplication);
    } catch (error) {
      console.error('Failed to submit application:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="full_name" className="text-white mb-2 block">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Your full name"
                />
              </div>
              {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-white mb-2 block">
                Email <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-white mb-2 block">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="age" className="text-white mb-2 block">
                  Age <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="17"
                />
                {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="school" className="text-white mb-2 block">
                School / Institution <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => updateField('school', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Your school name"
                />
              </div>
              {errors.school && <p className="text-red-400 text-sm mt-1">{errors.school}</p>}
            </div>

            <div>
              <Label htmlFor="grade" className="text-white mb-2 block">
                Grade Level <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.grade} onValueChange={(value) => updateField('grade', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-red-400 text-sm mt-1">{errors.grade}</p>}
            </div>

            <div>
              <Label htmlFor="experience_level" className="text-white mb-2 block">
                Coding Experience <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.experience_level} onValueChange={(value) => updateField('experience_level', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Built some projects</SelectItem>
                  <SelectItem value="advanced">Advanced - Experienced developer</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience_level && <p className="text-red-400 text-sm mt-1">{errors.experience_level}</p>}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="why_attend" className="text-white mb-2 block">
                Why do you want to attend? <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="why_attend"
                value={formData.why_attend}
                onChange={(e) => updateField('why_attend', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7] min-h-[120px]"
                placeholder="Tell us what excites you about this hackathon..."
              />
              {errors.why_attend && <p className="text-red-400 text-sm mt-1">{errors.why_attend}</p>}
            </div>

            <div>
              <Label htmlFor="project_idea" className="text-white mb-2 block">
                Any project ideas you'd like to work on?
              </Label>
              <Textarea
                id="project_idea"
                value={formData.project_idea}
                onChange={(e) => updateField('project_idea', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7] min-h-[100px]"
                placeholder="Share any ideas you have in mind (optional)..."
              />
            </div>

            <div>
              <Label htmlFor="heard_from" className="text-white mb-2 block">
                How did you hear about us?
              </Label>
              <Select value={formData.heard_from} onValueChange={(value) => updateField('heard_from', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="friend">Friend / Word of Mouth</SelectItem>
                  <SelectItem value="school">School Announcement</SelectItem>
                  <SelectItem value="mlh">MLH</SelectItem>
                  <SelectItem value="search">Google Search</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tshirt_size" className="text-white mb-2 block">T-Shirt Size</Label>
                <Select value={formData.tshirt_size} onValueChange={(value) => updateField('tshirt_size', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dietary_restrictions" className="text-white mb-2 block">Dietary Restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => updateField('dietary_restrictions', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="None, Vegetarian, etc."
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Emergency Contact</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Contact name"
                />
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2072C7]"
                  placeholder="Contact phone"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#084F9A]/20 border border-[#2072C7]/30">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree_to_terms"
                  checked={formData.agree_to_terms}
                  onCheckedChange={(checked) => updateField('agree_to_terms', checked)}
                  className="mt-1 border-[#2072C7] data-[state=checked]:bg-[#084F9A]"
                />
                <Label htmlFor="agree_to_terms" className="text-gray-300 text-sm leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-[#2072C7] hover:text-[#F68A42] hover:underline">Code of Conduct</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#2072C7] hover:text-[#F68A42] hover:underline">Terms of Service</a>.
                  I understand that my application will be reviewed and I will be notified via email.
                  <span className="text-red-400"> *</span>
                </Label>
              </div>
              {errors.agree_to_terms && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.agree_to_terms}
                </p>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-gradient-to-r from-[#2072C7] to-[#084F9A] text-white'
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={20} />
                ) : (
                  <step.icon size={20} />
                )}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${
                currentStep >= step.id ? 'text-white' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                currentStep > step.id ? 'bg-[#2072C7]' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form content */}
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      {/* Submit error message */}
      {errors.submit && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle size={16} />
          {errors.submit}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30 text-black"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            className="bg-gradient-to-r from-[#F68A42] to-[#E06E0A] hover:from-[#E06E0A] hover:to-[#F68A42] text-white"
          >
            Next
            <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                {existingApplication ? 'Resubmit Application' : 'Submit Application'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}