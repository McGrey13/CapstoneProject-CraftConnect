import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { createStore } from "../../api/storeApi";
import { useNavigate } from "react-router-dom";
import StoreDetails from "./StoreDetails";
import OwnerInfo from "./OwnerInfo";
import RulesGuidelines from "./RulesGuidelines";

const CreateStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeData, setStoreData] = useState({
    storeName: "",
    storeDescription: "",
    category: "Native Handicraft",
    logo: null,
    birPermit: null,
    agreedToTerms: false,
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
  });

  const categories = [
    "Native Handicraft",
    "Miniatures & Souvenirs",
    "Rubber Stamp Engraving",
    "Traditional Accessories",
    "Statuary & Sculpture",
    "Basketry & Weaving"
  ];
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!storeData.agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    const formData = new FormData();
    formData.append('store_name', storeData.storeName);
    formData.append('store_description', storeData.storeDescription);
    formData.append('category', storeData.category);
    if (storeData.logo) formData.append('logo', storeData.logo);
    if (storeData.birPermit) formData.append('bir', storeData.birPermit);
    formData.append('owner_name', storeData.ownerName);
    formData.append('owner_email', storeData.ownerEmail);
    formData.append('owner_phone', storeData.ownerPhone);
    formData.append('owner_address', storeData.ownerAddress);

    try {
      await createStore(formData);
      setIsSubmitted(true);
      
      // Wait 2 seconds before redirecting to allow user to see success message
      setTimeout(() => {
        navigate('/seller/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to create store', err);
      setError(err.response?.data?.message || 'Failed to submit store. Please try again.');
      setCurrentStep(1); // Return to first step if there's an error
    }
  };

  const updateStoreData = (data) => {
    setStoreData({ ...storeData, ...data });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StoreDetails
            storeData={storeData}
            updateStoreData={updateStoreData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <OwnerInfo
            ownerData={{
              fullName: storeData.ownerName,
              email: storeData.ownerEmail,
              phone: storeData.ownerPhone,
              address: storeData.ownerAddress,
            }}
            setOwnerData={(data) => {
              updateStoreData({
                ownerName: data.fullName,
                ownerEmail: data.email,
                ownerPhone: data.phone,
                ownerAddress: data.address,
              });
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <RulesGuidelines
            onNext={handleNext}
            onBack={handleBack}
            onAgree={(agreed) => updateStoreData({ agreedToTerms: agreed })}
            agreed={storeData.agreedToTerms}
          />
        );
      case 4:
        return (
          <div className="w-full bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Review Your Store Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Store Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.storeName}</p>
                    <p><span className="font-medium">Category:</span> {storeData.category}</p>
                    <p><span className="font-medium">Description:</span><br/>{storeData.storeDescription}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Owner Information</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.ownerName}</p>
                    <p><span className="font-medium">Email:</span> {storeData.ownerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {storeData.ownerPhone}</p>
                    <p><span className="font-medium">Address:</span><br/>{storeData.ownerAddress}</p>
                  </div>
                </div>
              </div>
              
              {storeData.logo && (
                <div>
                  <h3 className="font-semibold text-gray-700">Store Logo</h3>
                  <img 
                    src={URL.createObjectURL(storeData.logo)} 
                    alt="Store Logo Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {storeData.birPermit && (
                <div>
                  <h3 className="font-semibold text-gray-700">BIR Permit</h3>
                  <p className="text-sm text-gray-600">Document uploaded: {storeData.birPermit.name}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50"
              >
                {"Back"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-700 text-amber-700 rounded-lg hover:bg-amber-800"
              >
                {"Submit Store"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSuccessScreen = () => (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
      <div className="rounded-full bg-green-100 p-3">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-amber-900">
        Store Created Successfully!
      </h2>
      <p className="text-gray-700 max-w-md">
        Your store has been submitted for review. You will receive a
        notification once it's approved.
      </p>
      <button
        className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800"
        onClick={() => (window.location.href = "/")}
      >
        Go to Home
      </button>
    </div>
  );

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, name: "Store Details" },
      { number: 2, name: "Owner Info" },
      { number: 3, name: "Guidelines" },
      { number: 4, name: "Review" },
    ];

    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                currentStep >= step.number
                  ? "text-amber-700"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= step.number
                    ? "bg-amber-700 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span className="text-xs">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="h-2 bg-amber-700 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-amber-100">
      {!isSubmitted ? (
        <>
          {renderStepIndicator()}
          {renderStepContent()}
        </>
      ) : (
        renderSuccessScreen()
      )}
    </div>
  );
};

export default CreateStore;
