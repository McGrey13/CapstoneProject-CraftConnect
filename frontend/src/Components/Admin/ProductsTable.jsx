import React, { useState } from "react";
import { Edit, Trash2, Eye, MoreHorizontal, Plus, Filter } from "lucide-react";
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

const mockProducts = [
  {
    id: "PRD-1234",
    name: "Handcrafted Ceramic Mug",
    artisan: "Sarah's Pottery",
    category: "Home",
    price: 24.99,
    stock: 15,
    status: "active",
  },
  {
    id: "PRD-2345",
    name: "Woven Basket Set",
    artisan: "Weaving Wonders",
    category: "Home",
    price: 49.99,
    stock: 8,
    status: "active",
  },
  {
    id: "PRD-3456",
    name: "Hand-Poured Soy Candle",
    artisan: "Glow Artisan",
    category: "Home",
    price: 18.99,
    stock: 0,
    status: "out-of-stock",
  },
  {
    id: "PRD-4567",
    name: "Macrame Wall Hanging",
    artisan: "Knot & Fiber",
    category: "Home",
    price: 89.99,
    stock: 3,
    status: "active",
  },
  {
    id: "PRD-5678",
    name: "Hand-Carved Wooden Bowl",
    artisan: "Forest Crafts",
    category: "Kitchen",
    price: 42.5,
    stock: 7,
    status: "active",
  },
  {
    id: "PRD-6789",
    name: "Beaded Statement Necklace",
    artisan: "Bead & Gem Studio",
    category: "Jewelry",
    price: 65.0,
    stock: 12,
    status: "active",
  },
  {
    id: "PRD-7890",
    name: "Embroidered Linen Pillow",
    artisan: "Stitch & Thread",
    category: "Home",
    price: 55.0,
    stock: 0,
    status: "draft",
  },
];

function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState(mockProducts);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setProducts(mockProducts);
    } else {
      const filtered = mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.artisan.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query)
      );
      setProducts(filtered);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Artisan</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.id}</div>
                  </div>
                </TableCell>
                <TableCell>{product.artisan}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
          Showing {products.length} of {mockProducts.length} products
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
    </div>
  );
}

export default ProductsTable;
