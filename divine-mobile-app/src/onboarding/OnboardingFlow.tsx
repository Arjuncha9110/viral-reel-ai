import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import { kundliService } from "../services/kundliService";
import { StepContainer } from "../components/onboarding/StepContainer";
import { ProgressIndicator } from "../components/onboarding/ProgressIndicator";

import { WelcomeStep } from "./steps/WelcomeStep";
import { NameStep } from "./steps/NameStep";
import { BirthDetailsStep } from "./steps/BirthDetailsStep";
import { CompletionStep } from "./steps/CompletionStep";

export const OnboardingFlow: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    displayName: "",
    gender: "",
    date: "",
    time: "",
    googlePlaceId: null as string | null,
    formattedAddress: "",
    latitude: null as number | null,
    longitude: null as number | null,
    city: "",
    state: "",
    country: "",
    timezoneId: "",
    timezoneName: "",
    rawOffset: 0,
    dstOffset: 0,
    utcOffset: "",
  });

  const handleComplete = async () => {
    if (!currentUser) return;
    try {
      if (formData.latitude == null || formData.longitude == null) {
        alert("Please go back and enter your full birth city so the app can save the correct coordinates.");
        setStep(3);
        return;
      }

      const birthDetailsParams = {
        date: formData.date,
        time: formData.time,
        googlePlaceId: formData.googlePlaceId,
        formattedAddress: formData.formattedAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        timezoneId: formData.timezoneId || "Asia/Kolkata",
        timezoneName: formData.timezoneName || "India Standard Time",
        rawOffset: formData.rawOffset,
        dstOffset: formData.dstOffset,
        utcOffset: formData.utcOffset || "+05:30",
      };

      await userService.completeOnboarding(currentUser.uid, {
        profile: {
          displayName: formData.displayName,
          gender: formData.gender || undefined,
          photoURL: currentUser.photoURL,
        },
        birthDetails: birthDetailsParams
      });

      try {
        const generatedKundli = await kundliService.generateKundli(birthDetailsParams);
        await kundliService.saveKundli(currentUser.uid, generatedKundli);
      } catch (calcError) {
        console.error("Failed to generate Cosmic Identity:", calcError);
        // We log the error but still let them through to the dashboard,
        // because their onboarding is technically complete.
        alert("Your profile is created, but we had trouble generating your Cosmic Identity right now. You can retry from your dashboard later.");
      }

      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save profile. Please check your database connection.";
      console.error("Failed to complete onboarding", err);
      alert(`Error saving details: ${errorMessage}\n\nPlease make sure Firestore Database is created and rules are enabled in your Firebase Console!`);
      // Do not navigate, let them retry
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 font-body">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-glow-gold relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>
        
        {step > 1 && step < 4 && (
          <ProgressIndicator currentStep={step - 1} totalSteps={2} />
        )}

        <div className="mt-4">
          <StepContainer stepKey={step}>
            {step === 1 && (
              <WelcomeStep onNext={nextStep} />
            )}
            {step === 2 && (
              <NameStep 
                initialData={formData} 
                onNext={(data) => { setFormData(prev => ({ ...prev, ...data })); nextStep(); }} 
                onBack={prevStep} 
              />
            )}
            {step === 3 && (
              <BirthDetailsStep 
                initialData={formData} 
                onNext={(data) => { setFormData(prev => ({ ...prev, ...data })); nextStep(); }} 
                onBack={prevStep} 
              />
            )}
            {step === 4 && (
              <CompletionStep onComplete={handleComplete} />
            )}
          </StepContainer>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
