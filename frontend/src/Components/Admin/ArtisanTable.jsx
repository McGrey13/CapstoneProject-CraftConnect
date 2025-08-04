import React from "react";
import { Edit, Trash2, Eye, MoreHorizontal, Filter } from "lucide-react";
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

const mockArtisans = [
  {
    id: "ART-1001",
    name: "Sarah Johnson",
    location: "Calamba, Laguna",
    category: "Ceramics",
    productsCount: 24,
    joinDate: "2023-01-15",
    status: "active",
    rating: 4.8,
  },
  {
    id: "ART-1002",
    name: "Miguel Santos",
    location: "San Pedro, Laguna",
    category: "Jewelry",
    productsCount: 18,
    joinDate: "2023-02-22",
    status: "active",
    rating: 4.5,
  },
  {
    id: "ART-1003",
    name: "Elena Cruz",
    location: "Victoria, Laguna",
    category: "Textiles",
    productsCount: 31,
    joinDate: "2023-01-05",
    status: "active",
    rating: 4.9,
  },
  {
    id: "ART-1004",
    name: "Antonio Reyes",
    location: "Paete, Laguna",
    category: "Woodworking",
    productsCount: 15,
    joinDate: "2023-03-10",
    status: "pending",
    rating: 0,
  },
  {
    id: "ART-1005",
    name: "Maria Lim",
    location: "Pakil, Laguna",
    category: "Paper Crafts",
    productsCount: 12,
    joinDate: "2023-02-18",
    status: "suspended",
    rating: 3.2,
  },
  {
    id: "ART-1006",
    name: "Jose Garcia",
    location: "Liliw, Laguna",
    category: "Glass Works",
    productsCount: 9,
    joinDate: "2023-03-25",
    status: "active",
    rating: 4.6,
  },
];

const ArtisanTable = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [artisans, setArtisans] = React.useState(mockArtisans);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setArtisans(mockArtisans);
    } else {
      const filtered = mockArtisans.filter(
        (artisan) =>
          artisan.name.toLowerCase().includes(query) ||
          artisan.location.toLowerCase().includes(query) ||
          artisan.id.toLowerCase().includes(query)
      );
      setArtisans(filtered);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            Pending
          </Badge>
        );
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artisans</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search artisans..."
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
              <TableHead>Artisan</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artisans.map((artisan) => (
              <TableRow key={artisan.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{artisan.name}</div>
                    <div className="text-sm text-gray-500">{artisan.id}</div>
                  </div>
                </TableCell>
                <TableCell>{artisan.location}</TableCell>
                <TableCell>{artisan.category}</TableCell>
                <TableCell>{artisan.productsCount}</TableCell>
                <TableCell>
                  {new Date(artisan.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {artisan.rating > 0 ? (
                      <>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(artisan.rating) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm">
                          {artisan.rating.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No ratings</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(artisan.status)}</TableCell>
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
                        <Eye className="h-4 w-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      {artisan.status === "pending" && (
                        <DropdownMenuItem>
                          <svg
                            className="h-4 w-4 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </DropdownMenuItem>
                      )}
                      {artisan.status === "active" && (
                        <DropdownMenuItem className="text-amber-600">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Suspend
                        </DropdownMenuItem>
                      )}
                      {artisan.status === "suspended" && (
                        <DropdownMenuItem className="text-green-600">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Reactivate
                        </DropdownMenuItem>
                      )}
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
          Showing {artisans.length} of {mockArtisans.length} artisans
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
};

export default ArtisanTable;
