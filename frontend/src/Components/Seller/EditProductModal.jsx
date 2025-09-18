import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Upload, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

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
  const [mainImage, setMainImage] = useState({ file: null, preview: '' });
  const [video, setVideo] = useState({ file: null, preview: '' });
  const [categories, setCategories] = useState([
    { id: 'miniatures-souvenirs', name: 'Miniatures & Souvenirs' },
    { id: 'rubber-stamp-engraving', name: 'Rubber Stamp Engraving' },
    { id: 'traditional-accessories', name: 'Traditional Accessories' },
    { id: 'statuary-sculpture', name: 'Statuary & Sculpture' },
    { id: 'basketry-weaving', name: 'Basketry & Weaving' },
  ]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        productDescription: product.productDescription || '',
        productPrice: product.productPrice || '',
        productQuantity: product.productQuantity || '',
        category: product.category || '',
        status: product.status || 'in stock',
        publishStatus: product.publish_status || 'draft',
      });
      
      if (product.productImage) {
        setMainImage({
          file: null,
          preview: product.productImage
        });
      }
      
      if (product.productVideo) {
        setVideo({
          file: null,
          preview: product.productVideo
        });
      }
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage({
          file,
          preview: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
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
    
    // Add files if they exist
    if (mainImage.file) {
      submitData.append('productImage', mainImage.file);
    } else if (mainImage.preview) {
      // If no new image was uploaded but there's a preview, it means we're using the existing image
      submitData.append('productImage', mainImage.preview);
    }
    
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
    onSave(submitData, product?.id);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              type="button"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                    <Label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </Label>
                    <Input
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="w-full"
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </Label>
                    <Textarea
                      id="productDescription"
                      name="productDescription"
                      value={formData.productDescription}
                      onChange={handleChange}
                      className="w-full min-h-[100px]"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₱)
                      </Label>
                      <Input
                        id="productPrice"
                        name="productPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.productPrice}
                        onChange={handleChange}
                        className="w-full"
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </Label>
                      <Input
                        id="productQuantity"
                        name="productQuantity"
                        type="number"
                        min="0"
                        value={formData.productQuantity}
                        onChange={handleChange}
                        className="w-full"
                        required
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </Label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleSelectChange('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Publish Status
                      </Label>
                      <select
                        value={formData.publishStatus}
                        onChange={(e) => handleSelectChange('publishStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Product Image */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Product Image</h3>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    {mainImage.preview ? (
                      <div className="relative w-full">
                        <img
                          src={mainImage.preview}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setMainImage({ file: null, preview: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm text-gray-600">
                          <label
                            htmlFor="productImage"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="productImage"
                              name="productImage"
                              type="file"
                              className="sr-only"
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Video */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Product Video (Optional)</h3>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    {video.preview ? (
                      <div className="relative w-full">
                        <video
                          src={video.preview}
                          className="w-full h-48 object-contain rounded-lg"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => setVideo({ file: null, preview: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4 flex text-sm text-gray-600">
                          <label
                            htmlFor="productVideo"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a video</span>
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
                        <p className="text-xs text-gray-500 mt-2">
                          MP4, WebM up to 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Product Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        <button
                          type="button"
                          className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add tags (press Enter to add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleAddTag}
                  />
                  <p className="text-xs text-gray-400 mt-1">Press Enter to add tags</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 px-6"
              >
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
