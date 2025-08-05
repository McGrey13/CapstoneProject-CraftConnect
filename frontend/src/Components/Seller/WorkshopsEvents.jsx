import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar, Clock, Users, MapPin, Plus } from "lucide-react";
import { Badge } from "../ui/badge";

const WorkshopCard = ({
  title,
  date,
  time,
  location,
  capacity,
  enrolled,
  status,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{title}</CardTitle>
          <Badge
            variant={
              status === "upcoming"
                ? "outline"
                : status === "in-progress"
                ? "default"
                : "secondary"
            }
          >
            {status === "upcoming"
              ? "Upcoming"
              : status === "in-progress"
              ? "In Progress"
              : "Completed"}
          </Badge>
        </div>
        <CardDescription>Workshop / Event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {enrolled} / {capacity} enrolled
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button size="sm">Manage Participants</Button>
      </CardFooter>
    </Card>
  );
};

const WorkshopsEvents = () => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Workshops & Events
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create New Workshop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WorkshopCard
          title="Pottery Basics"
          date="June 15, 2023"
          time="2:00 PM - 4:00 PM"
          location="Your Studio"
          capacity={12}
          enrolled={8}
          status="upcoming"
        />
        <WorkshopCard
          title="Advanced Glazing Techniques"
          date="June 22, 2023"
          time="3:00 PM - 6:00 PM"
          location="Your Studio"
          capacity={8}
          enrolled={8}
          status="in-progress"
        />
        <WorkshopCard
          title="Summer Craft Fair"
          date="July 8-9, 2023"
          time="10:00 AM - 5:00 PM"
          location="Downtown Plaza"
          capacity={500}
          enrolled={342}
          status="upcoming"
        />
        <WorkshopCard
          title="Beginner's Wheel Throwing"
          date="May 30, 2023"
          time="1:00 PM - 3:00 PM"
          location="Your Studio"
          capacity={10}
          enrolled={10}
          status="completed"
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Create New Workshop</CardTitle>
          <CardDescription>
            Set up a new workshop or event for your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workshop-title">Workshop Title</Label>
            <Input
              id="workshop-title"
              placeholder="e.g., Introduction to Pottery"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workshop-date">Date</Label>
              <Input id="workshop-date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workshop-time">Time</Label>
              <Input id="workshop-time" type="time" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workshop-location">Location</Label>
            <Input
              id="workshop-location"
              placeholder="Your Studio or Online"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workshop-capacity">Capacity</Label>
              <Input id="workshop-capacity" type="number" placeholder="12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workshop-price">Price</Label>
              <Input id="workshop-price" type="text" placeholder="$45.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workshop-description">Description</Label>
            <Textarea
              id="workshop-description"
              placeholder="Describe what participants will learn and what to bring..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Create Workshop</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkshopsEvents;
