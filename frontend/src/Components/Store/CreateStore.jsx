import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { createStore } from "../../api";

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

  const handleSubmit = async () => {
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
      const token = localStorage.getItem('auth_token');
      await createStore(formData, token);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to create store', err);
      alert('Failed to submit store. Please try again.');
    }
  };

  const updateStoreData = (data) => {
    setStoreData({ ...storeData, ...data });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-amber-900">Store Details</h2>
            <input
              type="text"
              placeholder="Store Name"
              value={storeData.storeName}
              onChange={(e) => updateStoreData({ storeName: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <textarea
              placeholder="Store Description"
              value={storeData.storeDescription}
              onChange={(e) =>
                updateStoreData({ storeDescription: e.target.value })
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <select
              value={storeData.category}
              onChange={(e) => updateStoreData({ category: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            >
              <option>Native Handicraft</option>
              <option>Woodcraft</option>
              <option>Textiles</option>
              <option>Accessories</option>
            </select>
            <div>
              <label className="block text-sm font-medium mb-1">Store Logo</label>
              <input type="file" accept="image/*" onChange={(e) => updateStoreData({ logo: e.target.files && e.target.files[0] ? e.target.files[0] : null })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">BIR Document (image or PDF)</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => updateStoreData({ birPermit: e.target.files && e.target.files[0] ? e.target.files[0] : null })} />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-amber-900">
              Owner Information
            </h2>
            <input
              type="text"
              placeholder="Owner Name"
              value={storeData.ownerName}
              onChange={(e) => updateStoreData({ ownerName: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <input
              type="email"
              placeholder="Email"
              value={storeData.ownerEmail}
              onChange={(e) => updateStoreData({ ownerEmail: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={storeData.ownerPhone}
              onChange={(e) => updateStoreData({ ownerPhone: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <textarea
              placeholder="Address"
              value={storeData.ownerAddress}
              onChange={(e) => updateStoreData({ ownerAddress: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-amber-600"
            />
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="border border-amber-700 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-amber-900">
              Rules & Guidelines
            </h2>
            <p className="text-sm text-gray-700">
              Please read and agree to the marketplace guidelines before
              proceeding.
            </p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={storeData.agreedToTerms}
                onChange={(e) =>
                  updateStoreData({ agreedToTerms: e.target.checked })
                }
              />
              <span>I agree to the terms and conditions.</span>
            </label>
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="border border-amber-700 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-amber-900">
              Review Your Store Information
            </h2>
            <div className="bg-amber-50 p-4 rounded-lg space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {storeData.storeName}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {storeData.storeDescription}
              </p>
              <p>
                <span className="font-medium">Category:</span>{" "}
                {storeData.category}
              </p>
              <p>
                <span className="font-medium">Owner:</span>{" "}
                {storeData.ownerName} ({storeData.ownerEmail})
              </p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="border border-amber-700 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
              >
                Submit Store
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
