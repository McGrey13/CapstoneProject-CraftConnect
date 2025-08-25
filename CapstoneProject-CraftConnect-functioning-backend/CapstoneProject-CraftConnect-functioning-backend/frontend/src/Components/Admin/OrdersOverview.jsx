import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

const orders = [
  {
    id: "ORD-7652",
    customer: "Maria Rodriguez",
    date: "2023-06-15",
    amount: "$129.99",
    status: "Completed",
    items: 3,
  },
  {
    id: "ORD-7651",
    customer: "John Smith",
    date: "2023-06-14",
    amount: "$85.50",
    status: "Processing",
    items: 2,
  },
  {
    id: "ORD-7650",
    customer: "Emily Johnson",
    date: "2023-06-14",
    amount: "$210.75",
    status: "Shipped",
    items: 4,
  },
  {
    id: "ORD-7649",
    customer: "Michael Brown",
    date: "2023-06-13",
    amount: "$45.00",
    status: "Completed",
    items: 1,
  },
  {
    id: "ORD-7648",
    customer: "Sarah Wilson",
    date: "2023-06-12",
    amount: "$178.25",
    status: "Completed",
    items: 3,
  },
  {
    id: "ORD-7647",
    customer: "David Lee",
    date: "2023-06-11",
    amount: "$95.00",
    status: "Shipped",
    items: 2,
  },
  {
    id: "ORD-7646",
    customer: "Jennifer Taylor",
    date: "2023-06-10",
    amount: "$150.50",
    status: "Cancelled",
    items: 3,
  },
  {
    id: "ORD-7645",
    customer: "Robert Anderson",
    date: "2023-06-09",
    amount: "$67.25",
    status: "Completed",
    items: 1,
  },
];

function OrdersOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage all customer orders
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Filter Orders</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Manage and review the latest orders from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Items</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">{order.items}</td>
                    <td className="py-3 px-4 font-medium">{order.amount}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          order.status === "Completed"
                            ? "success"
                            : order.status === "Processing"
                            ? "default"
                            : order.status === "Shipped"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrdersOverview;
