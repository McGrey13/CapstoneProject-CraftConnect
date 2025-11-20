import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Video as VideoIcon, Image as ImageIcon, Check } from 'lucide-react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import api from "../../api";

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productPrice: '',
    productQuantity: '',
    category: '',
    status: 'in stock',
    publishStatus: 'draft',
  });
  const [productImages, setProductImages] = useState([]);
  const [video, setVideo] = useState({ file: null, preview: '' });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);

  const totalVariationQuantity = useMemo(() => {
    if (!hasVariations || variations.length === 0) return 0;
    return variations.reduce((sum, variation) => {
      const qty = parseInt(variation.quantity, 10);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }, [hasVariations, variations]);

  const variationPricingActive = hasVariations && variations.length > 0;

  const handleAddVariation = () => {
    setVariations((prev) => [
      ...prev,
      { label: '', size: '', quantity: '', price: '', variation_id: null, sku: '' },
    ]);
  };

  const handleRemoveVariation = (indexToRemove) => {
    setVariations((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (updated.length === 0) {
        setHasVariations(false);
      }
      return updated;
    });
  };

  const handleVariationChange = (index, field, value) => {
    setVariations((prev) => {
      const updated = [...prev];
      const variation = { ...updated[index] };

      if (field === 'label') {
        variation.label = value;
        variation.size = value;
      } else {
        variation[field] = value;
      }

      updated[index] = variation;
      return updated;
    });
  };

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      
      if (response.data) {
        const result = response.data;
        
        // Check if the API returns { status: 'success', data: [...] }
        if (result.status === 'success' && Array.isArray(result.data)) {
          const categoriesData = result.data.map(cat => ({
            id: cat.category_id || cat.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: cat.category_name,
          }));
          setCategories(categoriesData);
        } else if (Array.isArray(result)) {
          // If the API returns the array directly
          const categoriesData = result.map(cat => ({
            id: cat.category_id || cat.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: cat.category_name,
          }));
          setCategories(categoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to hardcoded categories if API fails
      setCategories([
        { id: 'basketry-weaving', name: 'Basketry & Weaving' },
        { id: 'miniatures-souvenirs', name: 'Miniatures & Souvenirs' },
        { id: 'rubber-stamp-engraving', name: 'Rubber Stamp Engraving' },
        { id: 'traditional-accessories', name: 'Traditional Accessories' },
        { id: 'statuary-sculpture', name: 'Statuary & Sculpture' },
        { id: 'pottery', name: 'Pottery' },
        { id: 'woodcrafts', name: 'Woodcrafts' },
        { id: 'textiles', name: 'Textiles' },
        { id: 'jewelry', name: 'Jewelry' },
      ]);
    }
  };

  useEffect(() => {
    if (product) {
      console.log("EditProductModal - Product object received:", product);
      console.log("EditProductModal - Product ID fields:", {
        id: product.id,
        product_id: product.product_id
      });
      
      // Handle variations - check has_variations flag and variations array
      const hasProductVariations = product.has_variations === true || product.has_variations === 1 || product.has_variations === '1';
      let productVariations = [];
      
      if (hasProductVariations && product.variations) {
        productVariations = product.variations;
        if (typeof productVariations === 'string') {
          try {
            const parsed = JSON.parse(productVariations);
            if (Array.isArray(parsed)) {
              productVariations = parsed;
            } else {
              productVariations = [];
            }
          } catch (error) {
            console.warn('Failed to parse variations string:', error);
            productVariations = [];
          }
        }
      }

      const mappedVariations = Array.isArray(productVariations) && productVariations.length > 0
        ? productVariations
            .filter(Boolean)
            .map((variation) => {
              const rawPrice =
                variation?.price !== null && variation?.price !== undefined
                  ? String(variation.price)
                  : '';
              const normalizedLabel = variation?.label || variation?.size || '';
              return {
                label: normalizedLabel,
                size: variation?.size || normalizedLabel,
                quantity:
                  variation?.quantity !== undefined && variation?.quantity !== null
                    ? String(variation.quantity)
                    : '',
                price: rawPrice,
                variation_id: variation?.variation_id || variation?.id || null,
                sku: variation?.sku || '',
              };
            })
        : [];

      const variationQuantityTotal = mappedVariations.reduce((sum, item) => {
        const qty = parseInt(item.quantity, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      }, 0);

      const firstVariationPrice =
        mappedVariations.find((item) => item.price !== '')?.price ?? '';

      const normalizedPrice =
        mappedVariations.length > 0
          ? firstVariationPrice || String(product.productPrice ?? '')
          : String(product.productPrice ?? '');

      const normalizedQuantity =
        mappedVariations.length > 0
          ? String(variationQuantityTotal)
          : String(product.productQuantity ?? '');

      setFormData({
        productName: product.productName || '',
        productDescription: product.productDescription || '',
        productPrice: normalizedPrice,
        productQuantity: normalizedQuantity,
        category: product.category || '',
        status: product.status || 'in stock',
        publishStatus: product.publish_status || 'draft',
      });

      setHasVariations(mappedVariations.length > 0);
      setVariations(mappedVariations);
      
      // Load tags if they exist
      if (product.tags) {
        if (Array.isArray(product.tags)) {
          setTags(product.tags);
        } else if (typeof product.tags === 'string') {
          try {
            const parsedTags = JSON.parse(product.tags);
            setTags(Array.isArray(parsedTags) ? parsedTags : []);
          } catch (e) {
            console.error('Error parsing tags:', e);
            setTags([]);
          }
        }
      } else {
        setTags([]);
      }
      
      // Handle multiple images - check if product has multiple images or single image
      const imagesToSet = [];
      
      // First add the main product image if it exists
      if (product.productImage) {
        imagesToSet.push({
          file: null,
          preview: product.productImage,
          id: `main-${Math.random().toString(36).substr(2, 9)}`,
          isMain: true
        });
      }
      
      // Then add additional images if they exist
      if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
        product.productImages.forEach((img, index) => {
          if (img) { // Make sure the image exists
            imagesToSet.push({
              file: null,
              preview: img,
              id: `additional-${index}-${Math.random().toString(36).substr(2, 9)}`,
              isMain: false
            });
          }
        });
      }
      
      console.log("Setting product images:", imagesToSet);
      setProductImages(imagesToSet);
      
      if (product.productVideo) {
        setVideo({
          file: null,
          preview: product.productVideo
        });
      }
    }
  }, [product]);

  useEffect(() => {
    if (hasVariations) {
      setFormData((prev) => {
        const nextQuantity = String(totalVariationQuantity);
        if (prev.productQuantity === nextQuantity) {
          return prev;
        }
        return {
          ...prev,
          productQuantity: nextQuantity,
        };
      });
    }
  }, [hasVariations, totalVariationQuantity]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const errors = [];
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes (15360 kilobytes)
    
    if (files.length > 0) {
      files.forEach((file, index) => {
        // Check file size (15MB = 15360 KB)
        if (file.size > maxSize) {
          const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
          errors.push({
            fileName: file.name,
            size: sizeInMB,
            message: `${file.name} is ${sizeInMB}MB. Maximum size is 15MB (15360 KB).`
          });
          return; // Skip this file
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push({
            fileName: file.name,
            message: `${file.name} is not a valid image file.`
          });
          return; // Skip this file
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setProductImages(prev => [...prev, {
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9)
          }]);
        };
        reader.readAsDataURL(file);
      });
      
      // Show errors if any
      if (errors.length > 0) {
        setImageErrors(errors);
        const errorMessages = errors.map(err => err.message).join('\n');
        alert(`Some images could not be uploaded:\n\n${errorMessages}`);
      } else {
        setImageErrors([]);
      }
    }
  };

  const removeImage = (imageId) => {
    setProductImages(prev => prev.filter(img => img.id !== imageId));
  };

  const setAsMainImage = (imageId) => {
    setProductImages(prev => prev.map(img => ({
      ...img,
      isMain: img.id === imageId
    })));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Using hardcoded categories to avoid 404 errors
  const getSubmitButtonText = () => {
    if (formData.publishStatus === 'published') return 'Update Product';
    if (formData.publishStatus === 'draft') return 'Save as Draft';
    return 'Update Product';
  };

  // Ensure required static categories are always present alongside API categories
  const staticCategoryNames = [
    'Miniatures & Souvenirs',
    'Rubber Stamp Engraving',
    'Traditional Accessories',
    'Statuary & Sculpture',
    'Basketry & Weaving',
    "Shoe & Sandals Making",
    "Leather Crafts",
    "Candle Making",
    "Wood Carving & WoodCraft Artisans",
    "House Garments",
    "Beadwork",
    "Crochet",
  ];
  const normalizedCategories = (categories || []).map((c) => ({
    id: c.id || c.category_id || (c.name || ''),
    name: c.name || c.category_name || '',
  })).filter((c) => !!c.name);
  const mergedCategories = (() => {
    const names = new Set(normalizedCategories.map((c) => c.name));
    const merged = [...normalizedCategories];
    staticCategoryNames.forEach((name) => {
      if (!names.has(name)) {
        merged.push({ id: name, name });
      }
    });
    return merged;
  })();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo({
          file,
          preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    
    // Add all form data
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    // Normalize pricing and quantity based on variations
    const validVariations =
      hasVariations && Array.isArray(variations)
        ? variations.filter(
            (variation) =>
              variation &&
              variation.label &&
              variation.quantity !== '' &&
              variation.quantity !== null &&
              !Number.isNaN(parseInt(variation.quantity, 10))
          )
        : [];

    if (hasVariations && validVariations.length === 0) {
      alert('Please add at least one product option with a name and quantity before saving.');
      return;
    }

    const firstVariationWithPrice = validVariations.find(
      (variation) => variation.price !== '' && variation.price !== null && variation.price !== undefined
    );

    const normalizedBasePrice = hasVariations
      ? firstVariationWithPrice?.price ?? formData.productPrice ?? '0'
      : formData.productPrice ?? '0';
    const parsedBasePrice = parseFloat(normalizedBasePrice);
    const basePriceToSend = Number.isFinite(parsedBasePrice) ? parsedBasePrice.toString() : '0';

    submitData.set('productPrice', basePriceToSend);

    const quantityToSend = hasVariations
      ? validVariations.reduce((sum, variation) => {
          const qty = parseInt(variation.quantity, 10);
          return sum + (Number.isNaN(qty) ? 0 : qty);
        }, 0).toString()
      : (formData.productQuantity ?? '0');
    submitData.set('productQuantity', quantityToSend);

    submitData.set('status', formData.status || 'in stock');

    submitData.set('has_variations', hasVariations ? '1' : '0');

    if (submitData.has('publishStatus')) {
      submitData.delete('publishStatus');
    }
    submitData.set('publish_status', formData.publishStatus || 'draft');

    // Only send variations if hasVariations is true and we have valid variations
    // When hasVariations is false, don't send any variation data at all
    if (hasVariations && validVariations.length > 0) {
      validVariations.forEach((variation, index) => {
        if (!variation.label || variation.quantity === '' || variation.quantity === null) {
          return;
        }
        submitData.append(`variations[${index}][label]`, variation.label);
        submitData.append(`variations[${index}][size]`, variation.label);
        submitData.append(`variations[${index}][quantity]`, variation.quantity);
        if (variation.price !== '' && variation.price !== null && variation.price !== undefined) {
          submitData.append(`variations[${index}][price]`, variation.price);
        }
        if (variation.variation_id) {
          submitData.append(`variations[${index}][variation_id]`, variation.variation_id);
        }
        if (variation.sku && variation.sku !== '') {
          submitData.append(`variations[${index}][sku]`, variation.sku);
        }
      });
    } else {
      // Explicitly ensure no variation fields are sent when hasVariations is false
      // This prevents any leftover variation data from being sent
      console.log('Product has no variations - ensuring no variation data is sent');
    }
    
    // Validate image file sizes before submission (15MB = 15360 KB)
    const maxImageSize = 15 * 1024 * 1024; // 15MB in bytes
    const invalidImages = [];
    
    productImages.forEach((image, index) => {
      if (image.file && image.file.size > maxImageSize) {
        const sizeInMB = (image.file.size / (1024 * 1024)).toFixed(2);
        const sizeInKB = (image.file.size / 1024).toFixed(0);
        invalidImages.push({
          name: image.file.name || `Image ${index + 1}`,
          sizeMB: sizeInMB,
          sizeKB: sizeInKB,
          index: index
        });
      }
    });
    
    if (invalidImages.length > 0) {
      const errorMessages = invalidImages.map(img => 
        `• ${img.name}: ${img.sizeMB}MB (${img.sizeKB}KB) - Maximum allowed is 15MB (15360KB)`
      ).join('\n');
      alert(`❌ Image Size Error\n\nThe following images exceed the 15MB (15360KB) limit:\n\n${errorMessages}\n\nPlease remove or compress these images before saving.`);
      setImageErrors(invalidImages.map(img => ({
        fileName: img.name,
        size: img.sizeMB,
        message: `${img.name} is ${img.sizeMB}MB (${img.sizeKB}KB). Maximum size is 15MB (15360 KB).`
      })));
      return; // Prevent form submission
    }
    
    // Add multiple images - separate new files from existing images
    const newImages = [];
    const existingImages = [];
    let mainImageSet = false;
    
    productImages.forEach((image) => {
      if (image.file) {
        // New image file
        newImages.push({
          file: image.file,
          isMain: image.isMain
        });
        if (image.isMain) {
          mainImageSet = true;
        }
      } else if (image.preview) {
        // Existing image - store the URL for reference
        existingImages.push({
          url: image.preview,
          isMain: image.isMain
        });
        if (image.isMain) {
          mainImageSet = true;
        }
      }
    });
    
    // Add new images
    newImages.forEach((imageData, idx) => {
      submitData.append(`productImages[${idx}]`, imageData.file);
      if (imageData.isMain) {
        submitData.append(`mainImageIndex`, idx);
      }
    });
    
    // Add existing images as references (so backend knows to keep them)
    existingImages.forEach((imageData, idx) => {
      submitData.append(`existingImages[${idx}]`, imageData.url);
      if (imageData.isMain) {
        submitData.append(`mainExistingImageIndex`, idx);
      }
    });
    
    console.log("Form data - New images:", newImages.length, "Existing images:", existingImages.length, "Main image set:", mainImageSet);
    
    if (video.file) {
      submitData.append('productVideo', video.file);
    } else if (video.preview) {
      // If no new video was uploaded but there's a preview, it means we're using the existing video
      submitData.append('productVideo', video.preview);
    }
    
    // Add tags if any
    if (tags.length > 0) {
      tags.forEach(tag => {
        submitData.append('tags[]', tag);
      });
    }
    
    // Call the onSave prop with the form data and product ID if it exists
    const productId = product?.product_id || product?.id;
    console.log("EditProductModal - Product ID being passed:", productId);
    onSave(submitData, productId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg sm:rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-slideUp">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">Edit Product</h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1">Update your product information and details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white text-black rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-md transition-all duration-200"
              type="button"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Content with scroll */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(95vh-100px)]">
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Basic Information</h3>
                  </div>
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                    <Label htmlFor="productName" className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium"
                      required
                      placeholder="e.g., Handwoven Rattan Basket"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productDescription" className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Description
                    </Label>
                    <Textarea
                      id="productDescription"
                      name="productDescription"
                      value={formData.productDescription}
                      onChange={handleChange}
                      className="w-full min-h-[100px] sm:min-h-[120px] px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] resize-none"
                      placeholder="Describe your handcrafted product..."
                    />
                    <p className="text-xs text-[#7b5a3b] mt-2">📝 Tell the story behind your craft</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="productPrice" className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                        Price (₱) {!variationPricingActive && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#a4785a] font-bold text-base sm:text-lg">₱</span>
                        <Input
                          id="productPrice"
                          name="productPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.productPrice}
                          onChange={handleChange}
                          className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base md:text-lg border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 text-[#5c3d28] font-semibold ${variationPricingActive ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                          required={!variationPricingActive}
                          disabled={variationPricingActive}
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-[#7b5a3b] mt-2">
                        {variationPricingActive
                          ? '💡 Variation-level prices will be used when customers choose an option.'
                          : '💰 Set a fair price for your craft.'}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="productQuantity" className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="productQuantity"
                        name="productQuantity"
                        type="number"
                        min="0"
                        value={
                          hasVariations ? (totalVariationQuantity || '') : formData.productQuantity
                        }
                        onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base md:text-lg border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 text-[#5c3d28] font-semibold ${hasVariations ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                        required={!hasVariations}
                        disabled={hasVariations}
                        placeholder="0"
                      />
                      <p className="text-xs text-[#7b5a3b] mt-2">
                        {hasVariations
                          ? `📦 Total stock from options: ${totalVariationQuantity}`
                          : '📦 How many items do you have?'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVariations}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasVariations(checked);
                          if (!checked) {
                            // Clear variations and reset quantity to base product quantity
                            setVariations([]);
                            // Reset product quantity to the original product quantity if available
                            if (product && !checked) {
                              setFormData(prev => ({
                                ...prev,
                                productQuantity: product.productQuantity ? String(product.productQuantity) : prev.productQuantity
                              }));
                            }
                          } else if (variations.length === 0) {
                            // Add a new empty variation when enabling variations
                            setVariations([{ label: '', size: '', quantity: '', price: '', variation_id: null, sku: '' }]);
                          }
                        }}
                        className="w-5 h-5 text-[#a4785a] border-2 border-[#e5ded7] rounded focus:ring-2 focus:ring-[#a4785a]"
                      />
                      <span className="text-sm sm:text-base font-semibold text-[#5c3d28]">
                        This product has different options (e.g., size, color, style)
                      </span>
                    </label>
                  </div>

                  {hasVariations && (
                    <div className="mt-4 bg-gradient-to-br from-[#faf9f8] to-white rounded-lg sm:rounded-xl border-2 border-[#e5ded7] p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base sm:text-lg font-bold text-[#5c3d28]">Variation Options</h4>
                        <button
                          type="button"
                          onClick={handleAddVariation}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-[#8f674a] hover:to-[#6a4c34] transition-all duration-200 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Option
                        </button>
                      </div>

                      {variations.length === 0 ? (
                        <p className="text-sm text-[#7b5a3b] text-center py-4">
                          No options added yet. Click "Add Option" to create your first variation.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {variations.map((variation, index) => (
                            <div
                              key={variation.variation_id || `variation-${index}`}
                              className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-end bg-white p-3 rounded-lg border border-[#e5ded7]"
                            >
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-[#5c3d28] mb-1">
                                  Option Label
                                </label>
                                <Input
                                  type="text"
                                  value={variation.label}
                                  onChange={(e) => handleVariationChange(index, 'label', e.target.value)}
                                  placeholder="e.g., Large, Red, Style A"
                                  className="w-full px-3 py-2 text-sm border-2 border-[#e5ded7] rounded-lg focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                                  required
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-[#5c3d28] mb-1">
                                  Quantity
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={variation.quantity}
                                  onChange={(e) => handleVariationChange(index, 'quantity', e.target.value)}
                                  placeholder="Qty"
                                  className="w-full px-3 py-2 text-sm border-2 border-[#e5ded7] rounded-lg focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                                  required
                                />
                              </div>
                              <div className="sm:col-span-4">
                                <label className="block text-xs font-semibold text-[#5c3d28] mb-1">
                                  Price (Optional)
                                </label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#a4785a] text-xs">
                                    ₱
                                  </span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={variation.price}
                                    onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                                    placeholder="Same as base"
                                    className="w-full pl-6 pr-3 py-2 text-sm border-2 border-[#e5ded7] rounded-lg focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                                  />
                                </div>
                              </div>
                              <div className="sm:col-span-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariation(index)}
                                  className="w-full px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-1"
                                >
                                  <X className="h-4 w-4" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleSelectChange('category', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium cursor-pointer hover:border-[#a4785a]"
                      required
                    >
                      <option value="">Choose a category...</option>
                      {mergedCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#7b5a3b] mt-2"> {mergedCategories.length > 0 ? `${mergedCategories.length} categories available` : 'Loading categories...'}</p>
                  </div>

                  <div>
                    <Label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Publish Status
                    </Label>
                    <select
                      value={formData.publishStatus}
                      onChange={(e) => handleSelectChange('publishStatus', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium cursor-pointer hover:border-[#a4785a]"
                    >
                      <option value="draft">💾 Save as Draft</option>
                      <option value="published">🚀 Published</option>
                    </select>
                    <p className="text-xs text-[#7b5a3b] mt-2">
                      {formData.publishStatus === 'draft' ? '💾 Visible only to you' : '🚀 Visible to customers'}
                    </p>
                  </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Product Images */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Images</h3>
                  </div>
                  
                  {/* Upload Area */}
                  <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 border-3 border-dashed border-[#a4785a] rounded-lg sm:rounded-xl md:rounded-2xl mb-4 sm:mb-6 hover:border-[#7b5a3b] hover:bg-[#faf9f8] transition-all duration-300 group">
                    <div className="text-center">
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#a4785a]" />
                      </div>
                      <div className="mt-2 flex text-xs sm:text-sm text-[#5c3d28]">
                        <label
                          htmlFor="productImages"
                          className="relative cursor-pointer font-semibold text-[#a4785a] hover:text-[#7b5a3b] transition-colors duration-200"
                        >
                          <span className="underline">Upload images</span>
                          <input
                            id="productImages"
                            name="productImages"
                            type="file"
                            className="sr-only"
                            onChange={handleImageChange}
                            accept="image/*"
                            multiple
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">
                        PNG, JPG, GIF up to 15MB (15360 KB) each
                      </p>
                      {imageErrors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                          <p className="text-xs font-semibold text-red-800 mb-2">⚠️ Upload Errors:</p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {imageErrors.map((error, idx) => (
                              <li key={idx}>• {error.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Images Grid */}
                  {productImages.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-xs sm:text-sm font-bold text-[#5c3d28]">Current Product Images ({productImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                        {productImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg sm:rounded-xl border-3 border-[#e5ded7] shadow-md group-hover:shadow-xl transition-shadow duration-300"
                            />
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1 z-10">
                              <button
                                type="button"
                                onClick={() => setAsMainImage(image.id)}
                                className={`rounded-full p-1.5 sm:p-2 text-base sm:text-lg font-bold shadow-xl transition-all duration-200 hover:scale-110 ${
                                  image.isMain 
                                    ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white opacity-100 scale-110' 
                                    : 'bg-white/95 text-[#a4785a] opacity-100 hover:bg-white hover:text-[#7b5a3b] border-2 border-[#a4785a]'
                                }`}
                                title="Set as main image"
                              >
                                {image.isMain ? '★' : '☆'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-1 sm:p-1.5 hover:scale-110 opacity-100 transition-all duration-200 shadow-xl"
                                title="Remove image"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                            {image.isMain && (
                              <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold shadow-lg">
                                MAIN
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#7b5a3b]">📸 Click ★ to set main image • Click × to remove</p>
                    </div>
                  )}
                </div>

                {/* Product Video */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Video</h3>
                    <span className="ml-auto text-xs text-[#7b5a3b] bg-[#faf9f8] px-2 sm:px-3 py-1 rounded-full border border-[#e5ded7]">Optional</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 border-3 border-dashed border-[#a4785a] rounded-lg sm:rounded-xl md:rounded-2xl hover:border-[#7b5a3b] hover:bg-[#faf9f8] transition-all duration-300 group">
                    {video.preview ? (
                      <div className="relative w-full">
                        <video
                          src={video.preview}
                          className="w-full h-40 sm:h-48 md:h-56 object-contain rounded-lg sm:rounded-xl shadow-lg border-4 border-[#e5ded7]"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => setVideo({ file: null, preview: '' })}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <VideoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#a4785a]" />
                        </div>
                        <div className="mt-2 flex text-xs sm:text-sm text-[#5c3d28]">
                          <label
                            htmlFor="productVideo"
                            className="relative cursor-pointer font-semibold text-[#a4785a] hover:text-[#7b5a3b] transition-colors duration-200"
                          >
                            <span className="underline">Upload a video</span>
                            <input
                              id="productVideo"
                              name="productVideo"
                              type="file"
                              className="sr-only"
                              onChange={handleVideoChange}
                              accept="video/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">
                          MP4, WebM up to 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-h-[40px] p-2 sm:p-3 bg-[#faf9f8] rounded-lg sm:rounded-xl border-2 border-[#e5ded7]">
                    {tags.length > 0 ? tags.map((tag, index) => (
                      <span key={index} className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transition-shadow duration-200">
                        {tag}
                        <button
                          type="button"
                          className="bg-white/40 hover:bg-white/70 rounded-full p-0.5 sm:p-1.5 transition-all duration-200 ml-0.5 flex items-center justify-center hover:scale-110"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={16} className="sm:w-5 sm:h-5 text-[#7b5a3b] font-bold" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-[#7b5a3b] text-xs sm:text-sm italic">No tags yet - add some!</span>
                    )}
                  </div>
                  <Input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium"
                    placeholder="Type a tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleAddTag}
                  />
                  <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">🏷️ Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#e5ded7] rounded text-[#5c3d28] font-mono">Enter</kbd> to add tags</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 md:pt-8 border-t-2 border-[#e5ded7] mt-4 sm:mt-6 md:mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] rounded-lg sm:rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group"
              >
                <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2 inline group-hover:scale-110 transition-transform duration-300" />
                {getSubmitButtonText()}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
