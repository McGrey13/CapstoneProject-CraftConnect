import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Badge } from "../ui/badge";
import ProductDetail from "./ProductDetail";
import ProductEdit from "./ProductEdit";

function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("auth_token");
  
  // State for view and edit dialogs
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // ✅ Fetch products for admin
  const fetchProducts = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/products", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("Products data:", data);
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      fetchProducts();
    } else {
      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.productName?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.id?.toString().includes(query)
        )
      );
    }
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleApprove = (id) => {
    fetch(`http://localhost:8000/api/products/${id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, approval_status: "approved" } : p
          )
        );
      })
      .catch((err) => console.error("Error approving product:", err));
  };

  const handleReject = (id) => {
    fetch(`http://localhost:8000/api/products/${id}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, approval_status: "rejected" } : p
          )
        );
      })
      .catch((err) => console.error("Error rejecting product:", err));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6">Loading products...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load products: {error}</div>;

  return (
    <div className="p-6 space-y-4 main-content">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      <div className="border rounded-md table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right table-actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.id}</div>
                  </div>
                </TableCell>
                <TableCell>{product.category || "N/A"}</TableCell>
                <TableCell>₱{Number(product.productPrice).toFixed(2)}</TableCell>
                <TableCell>{product.productQuantity}</TableCell>
                <TableCell>{getStatusBadge(product.approval_status)}</TableCell>
                <TableCell className="text-right table-actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dropdown-content">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleApprove(product.id)}
                        className="text-green-600"
                      >
                        <Check className="h-4 w-4 mr-2" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReject(product.id)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4 mr-2" /> Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {products.length} of {products.length} products
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <ProductDetail
        productId={selectedProductId}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedProductId(null);
        }}
        onEdit={handleEditProduct}
      />

      {/* Product Edit Dialog */}
      <ProductEdit
        product={selectedProduct}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default ProductsTable;
