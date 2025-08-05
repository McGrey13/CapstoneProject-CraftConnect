import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Link,
  Image,
  Calendar,
  Clock,
} from "lucide-react";

const SocialMedia = () => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
        <Button>Schedule Post</Button>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="posts">Create Posts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Content</TabsTrigger>
        </TabsList>

        {/* Connected Accounts */}
        <TabsContent value="accounts" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Instagram className="h-5 w-5 mr-2 text-pink-500" />
                  Instagram
                </CardTitle>
                <CardDescription>
                  Connect your Instagram business account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600 font-medium">
                      Connected
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Facebook */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                  Facebook
                </CardTitle>
                <CardDescription>Connect your Facebook page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600 font-medium">
                      Connected
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Twitter */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Twitter className="h-5 w-5 mr-2 text-blue-400" />
                  Twitter
                </CardTitle>
                <CardDescription>Connect your Twitter account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-gray-500 font-medium">
                      Not Connected
                    </span>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>

            {/* YouTube */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Youtube className="h-5 w-5 mr-2 text-red-600" />
                  YouTube
                </CardTitle>
                <CardDescription>
                  Connect your YouTube channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-gray-500 font-medium">
                      Not Connected
                    </span>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Post */}
        <TabsContent value="posts" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Social Media Post</CardTitle>
              <CardDescription>
                Create and schedule posts across your social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-text">Post Content</Label>
                <Textarea
                  id="post-text"
                  placeholder="What would you like to share about your crafts today?"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Post to</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                    Instagram
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center opacity-50"
                    disabled
                  >
                    <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                    Twitter
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="post-date">Schedule Date</Label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <Input id="post-date" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-time">Schedule Time</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <Input id="post-time" type="time" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save Draft</Button>
              <Button>Schedule Post</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Scheduled Content */}
        <TabsContent value="scheduled" className="space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center py-8">
              <p className="text-gray-500">
                You don't have any scheduled posts yet.
              </p>
              <Button className="mt-4" variant="outline">
                Create Your First Post
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMedia;
