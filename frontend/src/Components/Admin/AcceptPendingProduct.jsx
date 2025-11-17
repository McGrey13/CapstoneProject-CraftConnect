import React, { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Package,
  DollarSign,
  Hash,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import api from "../../api";
import "./AdminTableDesign.css";

function AcceptPendingProduct() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productDetailsCache, setProductDetailsCache] = useState({});
  const [isProductDetailsLoading, setIsProductDetailsLoading] = useState(false);
  const [productDetailError, setProductDetailError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [productToAction, setProductToAction] = useState(null);
  const [openMenuProductId, setOpenMenuProductId] = useState(null);

  // Fetch products for admin
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Filter products based on search and status
  const filterProducts = () => {
    let filtered = products;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.approval_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.id?.toString().includes(searchQuery)
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search query or status filter changes
  useEffect(() => {
    filterProducts();
  }, [searchQuery, statusFilter, products]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 text-white">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "draft":
        return <Badge className="bg-gray-400">Draft</Badge>;
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const closeProductMenu = () => {
    setOpenMenuProductId(null);
  };

  const fixImageUrl = useCallback((url) => {
    if (!url || typeof url !== "string") return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/storage/") || url.startsWith("/images/")) {
      return `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${url}`;
    }
    return `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/storage/${url}`;
  }, []);

  const parseVariations = useCallback((rawVariations) => {
    if (!rawVariations) return [];

    let variations = rawVariations;

    if (typeof variations === "string") {
      try {
        const parsed = JSON.parse(variations);
        if (Array.isArray(parsed)) {
          variations = parsed;
        }
      } catch (error) {
        console.warn("Failed to parse variations string:", error);
        variations = [];
      }
    }

    if (!Array.isArray(variations)) return [];

    return variations
      .filter(Boolean)
      .map((variation, index) => {
        const label =
          variation?.label ||
          variation?.name ||
          variation?.size ||
          variation?.option ||
          `Variation ${index + 1}`;
        const priceValue =
          variation?.price !== undefined && variation?.price !== null
            ? Number(variation.price)
            : null;
        const quantityValue =
          variation?.quantity !== undefined && variation?.quantity !== null
            ? Number(variation.quantity)
            : null;

        return {
          id: variation?.variation_id || variation?.id || `${index}`,
          label,
          price: !Number.isNaN(priceValue) ? priceValue : null,
          quantity: !Number.isNaN(quantityValue) ? quantityValue : null,
          sku: variation?.sku || null,
          attributes: variation?.attributes || variation?.values || [],
        };
      });
  }, []);

  const normalizeProductData = useCallback(
    (rawData, fallback = {}) => {
      if (!rawData && !fallback) return null;

      const base =
        (rawData && typeof rawData === "object"
          ? rawData.data || rawData
          : {}) || {};

      const merged = {
        ...fallback,
        ...base,
      };

      const toNumber = (value, defaultValue = 0) => {
        if (value === null || value === undefined || value === "") {
          return defaultValue;
        }
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : defaultValue;
      };

      const imageSources = [];

      if (Array.isArray(merged.images)) {
        merged.images.forEach((image) => {
          if (typeof image === "string") {
            imageSources.push(image);
          } else if (image?.url) {
            imageSources.push(image.url);
          } else if (image?.path) {
            imageSources.push(image.path);
          } else if (image?.image_url) {
            imageSources.push(image.image_url);
          }
        });
      }

      if (Array.isArray(merged.productImages)) {
        merged.productImages.forEach((image) => {
          if (typeof image === "string") {
            imageSources.push(image);
          } else if (image?.url) {
            imageSources.push(image.url);
          } else if (image?.image_path) {
            imageSources.push(image.image_path);
          }
        });
      } else if (typeof merged.productImages === "string") {
        try {
          const parsed = JSON.parse(merged.productImages);
          if (Array.isArray(parsed)) {
            parsed.forEach((image) => {
              if (typeof image === "string") {
                imageSources.push(image);
              } else if (image?.url) {
                imageSources.push(image.url);
              }
            });
          }
        } catch (error) {
          console.warn("Failed to parse productImages string:", error);
        }
      }

      if (merged.gallery && Array.isArray(merged.gallery)) {
        merged.gallery.forEach((image) => {
          if (typeof image === "string") {
            imageSources.push(image);
          } else if (image?.url) {
            imageSources.push(image.url);
          }
        });
      }

      if (merged.productImage) {
        imageSources.push(merged.productImage);
      } else if (merged.image) {
        imageSources.push(merged.image);
      }

      const normalizedImages = Array.from(
        new Set(
          imageSources
            .filter(Boolean)
            .map((source) => fixImageUrl(source) || source)
            .filter(Boolean)
        )
      );

      const resolvedSeller =
        merged.seller ||
        merged.seller_info ||
        merged.sellerDetails ||
        merged.sellerData ||
        {};

      const resolvedStore =
        merged.store ||
        resolvedSeller?.store ||
        merged.store_details ||
        merged.storeData ||
        merged.store_info ||
        {};

      const variations =
        parseVariations(
          merged.variations ||
            merged.productVariations ||
            merged.product_variations ||
            merged.variation_data
        ) || [];

      return {
        ...merged,
        id: merged.id || merged.product_id || fallback.id,
        product_id: merged.product_id || merged.id || fallback.product_id,
        productName:
          merged.productName ||
          merged.name ||
          fallback.productName ||
          "Unnamed Product",
        productPrice: toNumber(
          merged.productPrice ?? merged.price ?? fallback.productPrice,
          0
        ),
        productQuantity: toNumber(
          merged.productQuantity ?? merged.quantity ?? fallback.productQuantity,
          0
        ),
        productDescription:
          merged.productDescription ??
          merged.description ??
          fallback.productDescription ??
          "",
        approval_status:
          merged.approval_status || merged.status || fallback.approval_status,
        status: merged.status || fallback.status,
        seller: resolvedSeller,
        store: resolvedStore,
        sellerName:
          merged.sellerName ||
          resolvedSeller?.user?.userName ||
          resolvedSeller?.name ||
          fallback.sellerName ||
          "Unknown Seller",
        storeName:
          merged.storeName ||
          resolvedStore?.store_name ||
          resolvedStore?.name ||
          resolvedSeller?.businessName ||
          fallback.storeName ||
          "Unknown Store",
        images: normalizedImages,
        primaryImage: normalizedImages[0] || null,
        variations,
      };
    },
    [fixImageUrl, parseVariations]
  );

  const fetchProductDetails = useCallback(
    async (productId, fallbackData) => {
      if (!productId) return;

      setIsProductDetailsLoading(true);
      setProductDetailError(null);

      try {
        const response = await api.get(`/products/${productId}`);
        const raw =
          response.data?.data ||
          response.data?.product ||
          response.data ||
          {};

        const normalized = normalizeProductData(raw, fallbackData);

        setProductDetailsCache((prev) => ({
          ...prev,
          [productId]: normalized,
        }));
        setSelectedProduct(normalized);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProductDetailError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch product details."
        );
        if (fallbackData) {
          setSelectedProduct(fallbackData);
        }
      } finally {
        setIsProductDetailsLoading(false);
      }
    },
    [normalizeProductData]
  );

  const handleViewProduct = (product) => {
    closeProductMenu();
    if (!product) return;

    const normalizedFallback = normalizeProductData(product);

    setSelectedProductId(product.id || product.product_id);
    setSelectedProduct(
      productDetailsCache[product.id] || normalizedFallback || product
    );
    setProductDetailError(null);
    setViewModalOpen(true);

    if (!productDetailsCache[product.id]) {
      fetchProductDetails(product.id, normalizedFallback);
    }
  };

  const handleRejectClick = (product) => {
    closeProductMenu();
    setProductToAction(product);
    setShowRejectConfirm(true);
  };

  const handleApproveClick = (product) => {
    closeProductMenu();
    setProductToAction(product);
    setShowApproveConfirm(true);
  };

  const handleDeleteClick = (product) => {
    closeProductMenu();
    setProductToAction(product);
    setShowDeleteConfirm(true);
  };

  const handleRejectConfirm = async () => {
    if (!productToAction) return;
    
    setIsProcessing(true);
    try {
      await api.put(`/products/${productToAction.id}`, { approval_status: 'rejected' });
      alert('Product rejected successfully!');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowRejectConfirm(false);
      setProductToAction(null);
    }
  };

  const handleApproveConfirm = async () => {
    if (!productToAction) return;

    setIsProcessing(true);
    try {
      await api.post(`/products/${productToAction.id}/approve`);
      alert('Product approved successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to approve product. Please try again.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      setShowApproveConfirm(false);
      setProductToAction(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToAction) return;
    
    setIsProcessing(true);
    try {
      await api.delete(`/products/${productToAction.id}`);
      alert('Product deleted successfully!');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setProductToAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#5c3d28] mb-2">Product Management</h1>
              <p className="text-[#7b5a3b] text-lg">Manage all products in your marketplace</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#5c3d28] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 px-4 py-3 rounded-lg border border-[#d5bfae]/30">
              <Package className="h-4 w-4 text-[#a4785a]" />
              <span className="font-medium">{filteredProducts.length} products found</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 text-[#5c3d28]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a4785a] h-4 w-4" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#a4785a]" />
                <span className="text-sm font-medium text-[#5c3d28]">Status:</span>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40 border-[#d5bfae] focus:border-[#a4785a] text-[#5c3d28] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[#d5bfae]/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10">
              <TableRow className="border-[#d5bfae]/30">
                <TableHead className="text-[#5c3d28] font-semibold">Product</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Category</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Price</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Quantity</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Status</TableHead>
                <TableHead className="text-right text-[#5c3d28] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-[#d5bfae]/20 hover:bg-[#a4785a]/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-[#a4785a]/20 to-[#7b5a3b]/20 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#a4785a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#5c3d28]">{product.productName}</div>
                        <div className="text-sm text-[#7b5a3b]">by Seller</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#a4785a]" />
                      <span className="text-[#5c3d28]">{product.category || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      
                      <span className="font-semibold text-green-600">₱{Number(product.productPrice).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-[#7b5a3b]" />
                      <span className="text-[#5c3d28]">{product.productQuantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.approval_status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openMenuProductId === product.id}
                      onOpenChange={(open) =>
                        setOpenMenuProductId(open ? product.id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="sm"
                          className="text-[#5c3d28] hover:bg-[#a4785a]/10"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setOpenMenuProductId((current) =>
                              current === product.id ? null : product.id
                            );
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={10}
                        className="border-[#d5bfae]/30"
                      >
                        <DropdownMenuLabel className="text-[#5c3d28]">Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleViewProduct(product)}
                          className="text-[#5c3d28] hover:bg-[#a4785a]/10"
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {product.approval_status !== 'approved' && (
                          <DropdownMenuItem 
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApproveClick(product)}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve Product
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-orange-600 hover:bg-orange-50" 
                          onClick={() => handleRejectClick(product)}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Reject Product
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 hover:bg-red-50" 
                          onClick={() => handleDeleteClick(product)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#7b5a3b]">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="border-[#d5bfae] text-[#5c3d28]"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="border-[#d5bfae] text-[#5c3d28]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      <Dialog
        open={viewModalOpen}
        onOpenChange={(open) => {
          setViewModalOpen(open);
          if (!open) {
            setSelectedProductId(null);
            setProductDetailError(null);
            setIsProductDetailsLoading(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl border-[#d5bfae]/30 bg-gradient-to-br from-white to-[#f9f4ef]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28] text-2xl">
              <div className="h-10 w-10 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Product Details
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b] text-lg">
              Complete information about this product
            </DialogDescription>
          </DialogHeader>

          {isProductDetailsLoading && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
              Loading latest product details…
            </div>
          )}

          {productDetailError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {productDetailError}
            </div>
          )}

          {selectedProduct && (
            <div className="space-y-8">
              {/* Product Header */}
              <div className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-xl p-6 border border-[#d5bfae]/30">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-xl flex items-center justify-center overflow-hidden">
                      {selectedProduct.primaryImage ? (
                        <img
                          src={selectedProduct.primaryImage}
                          alt={selectedProduct.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#5c3d28]">
                        {selectedProduct.productName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getStatusBadge(selectedProduct.approval_status)}
                        {selectedProduct.status &&
                          selectedProduct.status !== selectedProduct.approval_status && (
                            getStatusBadge(selectedProduct.status)
                          )}
                        <span className="text-sm text-[#7b5a3b]">
                          SKU / Product ID:{" "}
                          {selectedProduct.product_id || selectedProduct.id || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 border border-[#d5bfae]/40 rounded-lg px-4 py-3 shadow-sm">
                    <div className="text-sm uppercase tracking-wide text-[#7b5a3b] font-medium">
                      Listed Under
                    </div>
                    <div className="mt-1 text-[#5c3d28] font-semibold">
                      {selectedProduct.storeName}
                    </div>
                    <div className="text-sm text-[#7b5a3b]">
                      Seller: {selectedProduct.sellerName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#d5bfae]/20 shadow-sm">
                  <Label className="text-lg font-semibold text-[#5c3d28] mb-4 block">
                    Product Images
                  </Label>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selectedProduct.images.map((imageSrc, index) => (
                      <div
                        key={`${imageSrc}-${index}`}
                        className="min-w-[140px] h-36 rounded-lg border border-[#d5bfae]/40 overflow-hidden shadow-sm bg-gradient-to-br from-[#f8f1ea] to-[#f1e5d8]"
                      >
                        <img
                          src={imageSrc}
                          alt={`${selectedProduct.productName} image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Price
                    </Label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      ₱{Number(selectedProduct.productPrice).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Hash className="h-4 w-4 text-[#7b5a3b]" />
                      Quantity Available
                    </Label>
                    <p className="text-xl font-semibold text-[#5c3d28] mt-1">
                      {selectedProduct.productQuantity} units
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#a4785a]" />
                      Category
                    </Label>
                    <p className="text-lg font-medium text-[#5c3d28] mt-1">
                      {selectedProduct.category || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#a4785a]" />
                      Status
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getStatusBadge(selectedProduct.approval_status)}
                      {selectedProduct.status &&
                        selectedProduct.status !== selectedProduct.approval_status &&
                        getStatusBadge(selectedProduct.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {(selectedProduct.productDescription ||
                selectedProduct.description) && (
                <div className="bg-white rounded-lg p-6 border border-[#d5bfae]/20 shadow-sm">
                  <Label className="text-lg font-semibold text-[#5c3d28] mb-3 block">
                    Product Description
                  </Label>
                  <p className="text-[#7b5a3b] leading-relaxed whitespace-pre-line">
                    {selectedProduct.productDescription ||
                      selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Store & Seller Information */}
              {(selectedProduct.storeName || selectedProduct.sellerName) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] block mb-2">
                      Store
                    </Label>
                    <p className="text-lg font-semibold text-[#5c3d28]">
                      {selectedProduct.storeName}
                    </p>
                    {selectedProduct.store?.store_address && (
                      <p className="text-sm text-[#7b5a3b] mt-1">
                        {selectedProduct.store.store_address}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-6 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-sm font-semibold text-[#5c3d28] block mb-2">
                      Seller
                    </Label>
                    <p className="text-lg font-semibold text-[#5c3d28]">
                      {selectedProduct.sellerName}
                    </p>
                    {selectedProduct.seller?.user?.userEmail && (
                      <p className="text-sm text-[#7b5a3b] mt-1">
                        {selectedProduct.seller.user.userEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Variations */}
              {selectedProduct.variations &&
                selectedProduct.variations.length > 0 && (
                  <div className="bg-white rounded-lg p-6 border border-[#d5bfae]/20 shadow-sm">
                    <Label className="text-lg font-semibold text-[#5c3d28] mb-4 block">
                      Product Variations
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProduct.variations.map((variation) => (
                        <div
                          key={variation.id}
                          className="border border-[#d5bfae]/40 rounded-lg p-4 bg-gradient-to-br from-[#f9f4ef] to-[#f3e6da]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-base font-semibold text-[#5c3d28]">
                              {variation.label}
                            </span>
                            {variation.sku && (
                              <Badge className="bg-[#a4785a]/10 text-[#5c3d28] border border-[#a4785a]/20">
                                SKU: {variation.sku}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-[#5c3d28]">
                            {variation.price !== null && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Price</span>
                                <span className="text-green-600 font-semibold">
                                  ₱{variation.price.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {variation.quantity !== null && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Quantity</span>
                                <span>{variation.quantity} units</span>
                              </div>
                            )}
                            {Array.isArray(variation.attributes) &&
                              variation.attributes.length > 0 && (
                                <div>
                                  <span className="font-medium block mb-1">
                                    Attributes
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {variation.attributes.map((attribute, index) => (
                                      <Badge
                                        key={`${variation.id}-attr-${index}`}
                                        className="bg-white text-[#5c3d28] border border-[#d5bfae]/60"
                                      >
                                        {typeof attribute === "string"
                                          ? attribute
                                          : `${attribute.name}: ${attribute.value}`}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md border-[#d5bfae]/30 bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <AlertTriangle className="h-6 w-6 text-[#a4785a]" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              This action cannot be undone. The product will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          {productToAction && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border border-[#d5bfae]/30 backdrop-blur-sm">
                <p className="font-semibold text-[#5c3d28]">Product: {productToAction.productName}</p>
                <p className="text-sm text-[#7b5a3b]">Price: ₱{Number(productToAction.productPrice).toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="border-[#d5bfae] text-[#5c3d28] hover:bg-[#a4785a]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent className="max-w-md border-[#d5bfae]/30 bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <XCircle className="h-6 w-6 text-[#a4785a]" />
              Confirm Rejection
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              This will change the product status to rejected and remove it from the approved list.
            </DialogDescription>
          </DialogHeader>
          {productToAction && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border border-[#d5bfae]/30 backdrop-blur-sm">
                <p className="font-semibold text-[#5c3d28]">Product: {productToAction.productName}</p>
                <p className="text-sm text-[#7b5a3b]">Price: ₱{Number(productToAction.productPrice).toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={isProcessing}
                  className="border-[#d5bfae] text-[#5c3d28] hover:bg-[#a4785a]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRejectConfirm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent className="max-w-md border-[#d5bfae]/30 bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Confirm Approval
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              Approving will make this product visible in the marketplace.
            </DialogDescription>
          </DialogHeader>
          {productToAction && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border border-[#d5bfae]/30 backdrop-blur-sm">
                <p className="font-semibold text-[#5c3d28]">Product: {productToAction.productName}</p>
                <p className="text-sm text-[#7b5a3b]">Price: ₱{Number(productToAction.productPrice).toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApproveConfirm(false)}
                  disabled={isProcessing}
                  className="border-[#d5bfae] text-[#5c3d28] hover:bg-[#a4785a]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproveConfirm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AcceptPendingProduct;
