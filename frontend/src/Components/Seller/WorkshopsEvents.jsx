// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea";
// import { Calendar, Clock, Users, MapPin, Plus } from "lucide-react";
// import { Badge } from "../ui/badge";

// const WorkshopCard = ({
//   title,
//   date,
//   time,
//   location,
//   capacity,
//   enrolled,
//   status,
// }) => {
//   return (
//     <Card>
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-start">
//           <CardTitle>{title}</CardTitle>
//           <Badge
//             variant={
//               status === "upcoming"
//                 ? "outline"
//                 : status === "in-progress"
//                 ? "default"
//                 : "secondary"
//             }
//           >
//             {status === "upcoming"
//               ? "Upcoming"
//               : status === "in-progress"
//               ? "In Progress"
//               : "Completed"}
//           </Badge>
//         </div>
//         <CardDescription>Workshop / Event</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-2">
//           <div className="flex items-center text-sm">
//             <Calendar className="h-4 w-4 mr-2 text-gray-500" />
//             <span>{date}</span>
//           </div>
//           <div className="flex items-center text-sm">
//             <Clock className="h-4 w-4 mr-2 text-gray-500" />
//             <span>{time}</span>
//           </div>
//           <div className="flex items-center text-sm">
//             <MapPin className="h-4 w-4 mr-2 text-gray-500" />
//             <span>{location}</span>
//           </div>
//           <div className="flex items-center text-sm">
//             <Users className="h-4 w-4 mr-2 text-gray-500" />
//             <span>
//               {enrolled} / {capacity} enrolled
//             </span>
//           </div>
//         </div>
//       </CardContent>
//       <CardFooter className="flex justify-between">
//         <Button variant="outline" size="sm">
//           Edit
//         </Button>
//         <Button size="sm">Manage Participants</Button>
//       </CardFooter>
//     </Card>
//   );
// };

// const WorkshopsEvents = () => {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold tracking-tight">
//           Workshops & Events
//         </h1>
//         <Button>
//           <Plus className="h-4 w-4 mr-2" /> Create New Workshop
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         <WorkshopCard
//           title="Pottery Basics"
//           date="June 15, 2023"
//           time="2:00 PM - 4:00 PM"
//           location="Your Studio"
//           capacity={12}
//           enrolled={8}
//           status="upcoming"
//         />
//         <WorkshopCard
//           title="Advanced Glazing Techniques"
//           date="June 22, 2023"
//           time="3:00 PM - 6:00 PM"
//           location="Your Studio"
//           capacity={8}
//           enrolled={8}
//           status="in-progress"
//         />
//         <WorkshopCard
//           title="Summer Craft Fair"
//           date="July 8-9, 2023"
//           time="10:00 AM - 5:00 PM"
//           location="Downtown Plaza"
//           capacity={500}
//           enrolled={342}
//           status="upcoming"
//         />
//         <WorkshopCard
//           title="Beginner's Wheel Throwing"
//           date="May 30, 2023"
//           time="1:00 PM - 3:00 PM"
//           location="Your Studio"
//           capacity={10}
//           enrolled={10}
//           status="completed"
//         />
//       </div>

//       <Card className="mt-8">
//         <CardHeader>
//           <CardTitle>Create New Workshop</CardTitle>
//           <CardDescription>
//             Set up a new workshop or event for your customers
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="workshop-title">Workshop Title</Label>
//             <Input
//               id="workshop-title"
//               placeholder="e.g., Introduction to Pottery"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="workshop-date">Date</Label>
//               <Input id="workshop-date" type="date" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="workshop-time">Time</Label>
//               <Input id="workshop-time" type="time" />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="workshop-location">Location</Label>
//             <Input id="workshop-location" placeholder="Your Studio or Online" />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="workshop-capacity">Capacity</Label>
//               <Input id="workshop-capacity" type="number" placeholder="12" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="workshop-price">Price</Label>
//               <Input id="workshop-price" type="text" placeholder="$45.00" />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="workshop-description">Description</Label>
//             <Textarea
//               id="workshop-description"
//               placeholder="Describe what participants will learn and what to bring..."
//               rows={4}
//             />
//           </div>
//         </CardContent>
//         <CardFooter>
//           <Button className="w-full">Create Workshop</Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// // export default WorkshopsEvents;
// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "../ui/card";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea";
// import { Calendar, Clock, Users, MapPin, Plus } from "lucide-react";
// import { Badge } from "../ui/badge";

// // Status badge styling
// const statusStyles = {
//   upcoming: "bg-yellow-200 text-yellow-800",
//   "in-progress": "bg-blue-200 text-blue-800",
//   completed: "bg-green-200 text-green-800",
// };

// const WorkshopCard = ({
//   title,
//   date,
//   time,
//   location,
//   capacity,
//   enrolled,
//   status,
//   image,
// }) => {
//   return (
//     <Card className="rounded-xl overflow-hidden shadow-lg border border-muted-foreground/10 bg-white">
//       <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
//       <CardHeader className="py-4 px-5">
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
//           <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status]}`}>
//             {status === "upcoming"
//               ? "Upcoming"
//               : status === "in-progress"
//               ? "In Progress"
//               : "Completed"}
//           </Badge>
//         </div>
//         <CardDescription className="text-sm text-muted-foreground mt-1">
//           Craft Workshop Event
//         </CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-2 px-5 pb-4 text-sm text-muted-foreground">
//         <div className="flex items-center gap-2">
//           <Calendar className="w-4 h-4 text-primary" />
//           <span>{date}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Clock className="w-4 h-4 text-primary" />
//           <span>{time}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <MapPin className="w-4 h-4 text-primary" />
//           <span>{location}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Users className="w-4 h-4 text-primary" />
//           <span>
//             {enrolled} / {capacity} enrolled
//           </span>
//         </div>
//       </CardContent>
//       <CardFooter className="flex justify-between px-5 pb-5">
//         <Button variant="ghost" size="sm" className="rounded-full text-primary">
//           Edit
//         </Button>
//         <Button size="sm" className="rounded-full bg-primary text-white hover:bg-primary/90">
//           Manage
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// const WorkshopsEvents = () => {
//   return (
//     <div className="space-y-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-primary">Workshops & Events</h1>
//           <p className="text-muted-foreground text-sm">
//             Inspire creativity through handmade experiences.
//           </p>
//         </div>
//         <Button className="rounded-full bg-primary text-white hover:bg-primary/90">
//           <Plus className="w-4 h-4 mr-2" /> Create New
//         </Button>
//       </div>

//       {/* Grid */}
// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//   <WorkshopCard
//     title="Pottery Basics"
//     date="June 15, 2023"
//     time="2:00 PM - 4:00 PM"
//     location="Craft Studio A"
//     capacity={12}
//     enrolled={8}
//     status="upcoming"
//     image="https://craftandtravel.com/wp-content/uploads/2024/12/block-printing-workshop-548x730.jpg"
//   />
//   <WorkshopCard
//     title="Glazing Techniques"
//     date="June 22, 2023"
//     time="3:00 PM - 6:00 PM"
//     location="Studio B"
//     capacity={8}
//     enrolled={8}
//     status="in-progress"
//     image="https://images.stockcake.com/public/9/8/a/98a0dc62-4be3-462e-bc1f-53730175f975_large/pottery-workshop-scene-stockcake.jpg"
//   />
//   <WorkshopCard
//     title="Summer Craft Fair"
//     date="July 8-9, 2023"
//     time="10:00 AM - 5:00 PM"
//     location="Downtown Plaza"
//     capacity={500}
//     enrolled={342}
//     status="upcoming"
//     image="https://images.unsplash.com/photo-1611780327754-0f2c3d57416c"
//   />
//   <WorkshopCard
//     title="Wheel Throwing"
//     date="May 30, 2023"
//     time="1:00 PM - 3:00 PM"
//     location="Studio C"
//     capacity={10}
//     enrolled={10}
//     status="completed"
//     image="https://images.unsplash.com/photo-1631286498482-7fdbce13cf00"
//   />
// </div>

// <Card className="mt-10 rounded-2xl shadow-lg border border-muted bg-white/80 backdrop-blur-md">
//   <CardHeader className="px-6 pt-6 pb-2">
//     <CardTitle className="text-2xl font-bold text-primary">Create New Workshop</CardTitle>
//     <CardDescription className="text-sm text-muted-foreground">
//       Set up a new workshop or event for your customers.
//     </CardDescription>
//   </CardHeader>

//   <CardContent className="px-6 py-4 space-y-6">
//     {/* Title */}
//     <div>
//       <Label htmlFor="workshop-title" className="text-sm font-medium text-gray-700">
//         Workshop Title
//       </Label>
//       <Input
//         id="workshop-title"
//         placeholder="e.g., Introduction to Pottery"
//         className="mt-1"
//       />
//     </div>

//     {/* Date & Time */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="workshop-date" className="text-sm font-medium text-gray-700">
//           Date
//         </Label>
//         <Input id="workshop-date" type="date" className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="workshop-time" className="text-sm font-medium text-gray-700">
//           Time
//         </Label>
//         <Input id="workshop-time" type="time" className="mt-1" />
//       </div>
//     </div>

//     {/* Location */}
//     <div>
//       <Label htmlFor="workshop-location" className="text-sm font-medium text-gray-700">
//         Location
//       </Label>
//       <Input
//         id="workshop-location"
//         placeholder="Your Studio or Online"
//         className="mt-1"
//       />
//     </div>

//     {/* Capacity & Price */}
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="workshop-capacity" className="text-sm font-medium text-gray-700">
//           Capacity
//         </Label>
//         <Input id="workshop-capacity" type="number" placeholder="e.g., 12" className="mt-1" />
//       </div>
//       <div>
//         <Label htmlFor="workshop-price" className="text-sm font-medium text-gray-700">
//           Price
//         </Label>
//         <Input id="workshop-price" type="text" placeholder="e.g., $45.00" className="mt-1" />
//       </div>
//     </div>

//     {/* Description */}
//     <div>
//       <Label htmlFor="workshop-description" className="text-sm font-medium text-gray-700">
//         Description
//       </Label>
//       <Textarea
//         id="workshop-description"
//         placeholder="Describe what participants will learn and what to bring..."
//         rows={4}
//         className="mt-1"
//       />
//     </div>
//   </CardContent>

//   <CardFooter className="px-6 pb-6">
//     <Button className="w-full rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-200">
//       Create Workshop
//     </Button>
//   </CardFooter>
// </Card>
//     </div>
//   );
// }
// export default WorkshopsEvents;


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

// Status badge styling
const statusStyles = {
  upcoming: "bg-yellow-200 text-yellow-800",
  "in-progress": "bg-blue-200 text-blue-800",
  completed: "bg-green-200 text-green-800",
};

const WorkshopCard = ({
  title,
  date,
  time,
  location,
  capacity,
  enrolled,
  status,
  image,
}) => {
  return (
    <Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100 bg-white">
      <div
        className="h-48 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <CardHeader className="py-4 px-5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[status]}`}>
            {status === "upcoming"
              ? "Upcoming"
              : status === "in-progress"
              ? "In Progress"
              : "Completed"}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Craft Workshop Event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-5 pb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span>
            {enrolled} / {capacity} enrolled
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-5 pb-5">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-primary hover:bg-muted-foreground/10 transition"
        >
          Edit
        </Button>
        <Button
          size="sm"
          className="rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-200"
        >
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
};

const WorkshopsEvents = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Workshops & Events</h1>
          <p className="text-muted-foreground text-base mt-1">
            Inspire creativity through hands-on, memorable experiences.
          </p>
        </div>
<div className="flex justify-end items-center mb-6">
  <Button className="rounded-full bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-transform hover:scale-105">
    <Plus className="w-4 h-4 mr-2" /> Create New
  </Button>
</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkshopCard
          title="Pottery Basics"
          date="June 15, 2023"
          time="2:00 PM - 4:00 PM"
          location="Craft Studio A"
          capacity={12}
          enrolled={8}
          status="upcoming"
          image="https://craftandtravel.com/wp-content/uploads/2024/12/block-printing-workshop-548x730.jpg"
        />
        <WorkshopCard
          title="Glazing Techniques"
          date="June 22, 2023"
          time="3:00 PM - 6:00 PM"
          location="Studio B"
          capacity={8}
          enrolled={8}
          status="in-progress"
          image="https://images.stockcake.com/public/9/8/a/98a0dc62-4be3-462e-bc1f-53730175f975_large/pottery-workshop-scene-stockcake.jpg"
        />
        <WorkshopCard
          title="Summer Craft Fair"
          date="July 8-9, 2023"
          time="10:00 AM - 5:00 PM"
          location="Downtown Plaza"
          capacity={500}
          enrolled={342}
          status="upcoming"
          image="https://images.unsplash.com/photo-1584999501254-2d8fbc044934?auto=format&fit=crop&w=800&q=80"
        />
        <WorkshopCard
          title="Wheel Throwing"
          date="May 30, 2023"
          time="1:00 PM - 3:00 PM"
          location="Studio C"
          capacity={10}
          enrolled={10}
          status="completed"
          image="https://images.unsplash.com/photo-1584999501254-2d8fbc044934"
        />
      </div>

      {/* Create Form */}
      <Card className="mt-12 rounded-2xl shadow-lg border border-muted bg-white/90 backdrop-blur-sm">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-2xl font-bold text-primary">Create New Workshop</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Set up a new workshop or event for your customers.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="workshop-title" className="text-sm font-medium text-gray-700">
              Workshop Title
            </Label>
            <Input
              id="workshop-title"
              placeholder="e.g., Introduction to Pottery"
              className="mt-1"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workshop-date" className="text-sm font-medium text-gray-700">
                Date
              </Label>
              <Input id="workshop-date" type="date" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="workshop-time" className="text-sm font-medium text-gray-700">
                Time
              </Label>
              <Input id="workshop-time" type="time" className="mt-1" />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="workshop-location" className="text-sm font-medium text-gray-700">
              Location
            </Label>
            <Input
              id="workshop-location"
              placeholder="Your Studio or Online"
              className="mt-1"
            />
          </div>

          {/* Capacity & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workshop-capacity" className="text-sm font-medium text-gray-700">
                Capacity
              </Label>
              <Input id="workshop-capacity" type="number" placeholder="e.g., 12" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="workshop-price" className="text-sm font-medium text-gray-700">
                Price
              </Label>
              <Input id="workshop-price" type="text" placeholder="e.g., $45.00" className="mt-1" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="workshop-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="workshop-description"
              placeholder="Describe what participants will learn and what to bring..."
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6">
         <Button className="w-full rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200 hover:scale-105">
            Create Workshop
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkshopsEvents;
