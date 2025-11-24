import React, { useState } from "react";
import { CheckCircle, Settings, UserCircle, LogOut } from "lucide-react";
import { createStore } from "../../api/storeApi";
import { useNavigate } from "react-router-dom";
import StoreDetails from "./StoreDetails";
import OwnerInfo from "./OwnerInfo";
import VerificationDocuments from "./VerificationDocuments";
import RulesGuidelines from "./RulesGuidelines";
import VerificationPending from "./VerificationPending";
import NotificationDropdown from "../ui/NotificationDropdown";
import { useUser } from "../Context/UserContext";

const SellerOnboardingNavbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-white to-[#faf9f8] shadow-lg border-b border-[#e5ded7] px-4 flex items-center justify-between z-40">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/seller")}
      >
        <div className="p-2 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg shadow-sm">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[#5c3d28]">
            CraftConnect
          </span>
          <span className="text-xs text-[#7b5a3b] font-medium uppercase tracking-wide">
            Seller Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#f5eee6] rounded-full border border-[#e5ded7]">
          <UserCircle className="h-4 w-4 text-[#a4785a]" />
          <span className="text-xs font-medium text-[#5c3d28]">
            {user?.userName || "Seller"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 transition"
          title="Logout"
        >
          <LogOut className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </nav>
  );
};

const CreateStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeData, setStoreData] = useState({
    storeName: "",
    storeDescription: "",
    category: "Native Handicraft",
    logo: null,
    birPermit: null,
    dtiPermit: null,
    idImage: null,
    idType: "",
    tinNumber: "",
    agreedToTerms: false,
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
    ownerCity: "",
    ownerProvince: "Laguna",
    ownerRegion: "CALABARZON",
  });

  const categories = [
    "Native Handicraft",
    "Miniatures & Souvenirs",
    "Rubber Stamp Engraving",
    "Traditional Accessories",
    "Statuary & Sculpture",
    "Basketry & Weaving",
    "Shoe & Sandals Making",
    "Leather Crafts",
    "Candle Making",
    "Wood Carving",
    "House Garments",
    "Beadwork",
    "Crochet",
    
  ];
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
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

  // File size limits
  const MAX_LOGO_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

  const validateFilesBeforeSubmit = () => {
    const errors = [];

    // Validate logo
    if (storeData.logo) {
      if (storeData.logo.size > MAX_LOGO_SIZE) {
        const sizeMB = (storeData.logo.size / (1024 * 1024)).toFixed(2);
        errors.push(`Store logo is too large (${sizeMB}MB). Maximum size is 10MB.`);
      }
    }

    // Validate BIR permit
    if (storeData.birPermit) {
      if (storeData.birPermit.size > MAX_DOCUMENT_SIZE) {
        const sizeMB = (storeData.birPermit.size / (1024 * 1024)).toFixed(2);
        errors.push(`BIR Permit is too large (${sizeMB}MB). Maximum size is 20MB.`);
      }
    }

    // Validate DTI permit
    if (storeData.dtiPermit) {
      if (storeData.dtiPermit.size > MAX_DOCUMENT_SIZE) {
        const sizeMB = (storeData.dtiPermit.size / (1024 * 1024)).toFixed(2);
        errors.push(`DTI Permit is too large (${sizeMB}MB). Maximum size is 20MB.`);
      }
    }

    // Validate ID image
    if (storeData.idImage) {
      if (storeData.idImage.size > MAX_DOCUMENT_SIZE) {
        const sizeMB = (storeData.idImage.size / (1024 * 1024)).toFixed(2);
        errors.push(`ID Document is too large (${sizeMB}MB). Maximum size is 20MB.`);
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    if (!storeData.agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    // Validate files before submission
    const fileErrors = validateFilesBeforeSubmit();
    if (fileErrors.length > 0) {
      setError(fileErrors.join('\n'));
      // Navigate to step 3 (documents) if there are file errors
      if (fileErrors.some(err => err.includes('logo'))) {
        setCurrentStep(1); // Go to Store Details for logo
      } else {
        setCurrentStep(3); // Go to Documents step
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Generate unique token for this submission
    const uniqueToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const formData = new FormData();
    formData.append('store_name', storeData.storeName);
    formData.append('store_description', storeData.storeDescription);
    formData.append('category', storeData.category);
    if (storeData.logo) formData.append('logo', storeData.logo);
    if (storeData.birPermit) formData.append('bir', storeData.birPermit);
    if (storeData.dtiPermit) formData.append('dti', storeData.dtiPermit);
    if (storeData.idImage) formData.append('id_image', storeData.idImage);
    if (storeData.idType) formData.append('id_type', storeData.idType);
    if (storeData.tinNumber) formData.append('tin_number', storeData.tinNumber);
    formData.append('owner_name', storeData.ownerName);
    formData.append('owner_email', storeData.ownerEmail);
    formData.append('owner_phone', storeData.ownerPhone);
    formData.append('owner_address', storeData.ownerAddress);
    if (storeData.ownerCity) formData.append('owner_city', storeData.ownerCity);
    if (storeData.ownerProvince) formData.append('owner_province', storeData.ownerProvince);
    if (storeData.ownerRegion) formData.append('owner_region', storeData.ownerRegion);
    formData.append('submission_token', uniqueToken);

    try {
      await createStore(formData);
      setIsSubmitted(true);
      // Stay on verification pending page - no redirect
    } catch (err) {
      console.error('Failed to create store', err);
      console.error('Error response:', err.response?.data);
      
      const backendErrors = err.response?.data;
      let errorMessage = 'Failed to submit store. Please try again.';
      
      // Handle validation errors (422)
      if (err.response?.status === 422 && backendErrors?.errors) {
        const errorMessages = [];
        
        // Format field errors
        Object.entries(backendErrors.errors).forEach(([field, messages]) => {
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const messageArray = Array.isArray(messages) ? messages : [messages];
          errorMessages.push(`${fieldName}: ${messageArray.join(', ')}`);
        });
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n');
        } else {
          errorMessage = backendErrors.message || 'Please check your inputs and try again.';
        }
      } 
      // Handle file size errors
      else if (err.response?.status === 413 || err.response?.status === 500) {
        if (backendErrors?.message) {
          errorMessage = backendErrors.message;
        } else {
          errorMessage = 'File size too large or server error. Please ensure all files are under the size limits (10MB for logo, 20MB for documents) and try again.';
        }
      }
      // Handle other errors
      else if (backendErrors?.message) {
        errorMessage = backendErrors.message;
      }
      
      setError(errorMessage);
      // Don't go back to step 1 - stay on current step so user can see the error
    } finally {
      setIsSubmitting(false);
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
              userCity: storeData.ownerCity,
              userProvince: storeData.ownerProvince,
              userRegion: storeData.ownerRegion,
            }}
            setOwnerData={(data) => {
              updateStoreData({
                ownerName: data.fullName,
                ownerEmail: data.email,
                ownerPhone: data.phone,
                ownerAddress: data.address,
                ownerCity: data.userCity || storeData.ownerCity,
                ownerProvince: data.userProvince || storeData.ownerProvince,
                ownerRegion: data.userRegion || storeData.ownerRegion,
              });
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <VerificationDocuments
            storeData={storeData}
            updateStoreData={updateStoreData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <RulesGuidelines
            onNext={handleNext}
            onBack={handleBack}
            onAgree={(agreed) => updateStoreData({ agreedToTerms: agreed })}
            agreed={storeData.agreedToTerms}
          />
        );
      case 5:
        return (
          <div className="w-full bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Review Your Store Details</h2>
            <div className="space-y-6">
              {/* Store and Owner Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Store Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.storeName}</p>
                    <p><span className="font-medium">Category:</span> {storeData.category}</p>
                    <p><span className="font-medium">Description:</span><br/>{storeData.storeDescription}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Owner Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.ownerName}</p>
                    <p><span className="font-medium">Email:</span> {storeData.ownerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {storeData.ownerPhone}</p>
                    <p><span className="font-medium">Address:</span><br/>{storeData.ownerAddress}</p>
                  </div>
                </div>
              </div>
              
              {/* Store Logo */}
              {storeData.logo && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Store Logo</h3>
                  <img 
                    src={URL.createObjectURL(storeData.logo)} 
                    alt="Store Logo Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {/* Verification Documents */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* BIR Permit */}
                  {storeData.birPermit && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">BIR Permit</h4>
                      {storeData.birPermit.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.birPermit)} 
                          alt="BIR Permit Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.birPermit.name}</p>
                    </div>
                  )}
                  
                  {/* DTI Permit */}
                  {storeData.dtiPermit && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">DTI Permit</h4>
                      {storeData.dtiPermit.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.dtiPermit)} 
                          alt="DTI Permit Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.dtiPermit.name}</p>
                    </div>
                  )}
                  
                  {/* ID Document */}
                  {storeData.idImage && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">ID Document</h4>
                      {storeData.idImage.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.idImage)} 
                          alt="ID Document Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.idImage.name}</p>
                      {storeData.idType && (
                        <p className="text-xs text-gray-600">Type: {storeData.idType}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* TIN Number */}
              {storeData.tinNumber && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Tax Information</h3>
                  <p><span className="font-medium">TIN Number:</span> {storeData.tinNumber}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {"Back"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-amber-700 text-black rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Store"
                )}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSuccessScreen = () => (
    <VerificationPending 
      storeData={storeData}
      onCheckStatus={() => {
        // This will be handled by the VerificationPending component
      }}
    />
  );

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, name: "Store Details" },
      { number: 2, name: "Owner Info" },
      { number: 3, name: "Documents" },
      { number: 4, name: "Guidelines" },
      { number: 5, name: "Review" },
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
    <div className="min-h-screen bg-[#faf9f8]">
      <SellerOnboardingNavbar />
      <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-amber-100 mt-24 mb-12">
      {!isSubmitted ? (
        <>
          {renderStepIndicator()}
          {renderStepContent()}
        </>
      ) : (
        renderSuccessScreen()
      )}
      </div>

      {/* Error Modal */}
      {error && !isSubmitting && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setError(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#5c3d28]">Submission Error</h3>
              </div>
              <div className="mb-6">
                <p className="text-[#7b5a3b] whitespace-pre-line">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="w-full px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold shadow-md"
                style={{ color: '#ffffff' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-amber-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-2xl font-bold text-[#5c3d28] mb-2">Submitting Store</h3>
              <p className="text-[#7b5a3b] text-center">
                Please wait while we process your store submission. This may take a few moments...
              </p>
              <p className="text-sm text-[#7b5a3b] mt-4 text-center">
                ⚠️ Please do not close this page or click the submit button again.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStore;
