          import React, { useEffect, useState } from "react";
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
          import api, { getToken } from "../../api";
          import {
            Instagram,
            Facebook,
            Twitter,
            Youtube,
            Link,
            Image,
            Calendar,
            Clock,
            Upload,
            X,
          } from "lucide-react";

          const SocialMedia = () => {
            const [fbStatus, setFbStatus] = useState({ connected: false, page: null });
            const [loading, setLoading] = useState(false);
            const [pages, setPages] = useState([]);
            const [posting, setPosting] = useState(false);
            const [message, setMessage] = useState("");
            const [link, setLink] = useState("");
            const [selectedImage, setSelectedImage] = useState(null);
            const [imagePreview, setImagePreview] = useState(null);
            const [error, setError] = useState("");
            const [success, setSuccess] = useState("");
            const [postToInstagram, setPostToInstagram] = useState(false);
            const [activeTab, setActiveTab] = useState("accounts");

            const fetchStatus = async () => {
              try {
                const token = getToken();
                if (!token) {
                  setError("Please log in to connect social media accounts");
                  return;
                }
                const res = await api.get("/social/facebook/status");
                setFbStatus(res.data);
                setError("");
              } catch (err) {
                console.error("Failed to fetch Facebook status:", err);
                setError("Failed to check Facebook connection status");
              }
            };

            useEffect(() => {
              fetchStatus();
              
              // Handle OAuth callback parameters
              const params = new URLSearchParams(window.location.search);
              
              // Handle tab parameter
              const tabParam = params.get("tab");
              if (tabParam === "posts") {
                setActiveTab("posts");
              }
              
              // Handle platform parameter
              const platformParam = params.get("platform");
              if (platformParam === "instagram") {
                setPostToInstagram(true);
              }
              
              // Handle pending post from product share
              const pendingPost = sessionStorage.getItem('pendingPost');
              if (pendingPost) {
                try {
                  const postData = JSON.parse(pendingPost);
                  
                  // Set message and link
                  setMessage(postData.message || "");
                  setLink(postData.link || "");
                  
                  // Set platform
                  if (postData.platform === "instagram") {
                    setPostToInstagram(true);
                  }
                  
                  // Convert base64 image to File object
                  if (postData.imageData) {
                    fetch(postData.imageData)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], `${postData.productName || 'product'}-preview.png`, { type: 'image/png' });
                        setSelectedImage(file);
                        setImagePreview(postData.imageData);
                      })
                      .catch(err => console.error('Error loading preview image:', err));
                  }
                  
                  // Clear pending post from storage
                  sessionStorage.removeItem('pendingPost');
                  
                  // Switch to posts tab
                  setActiveTab("posts");
                  
                  // Show success message
                  setSuccess(`Product preview loaded! Review and click "Post to ${postData.platform === 'instagram' ? 'Instagram' : 'Facebook'}" when ready.`);
                  
                } catch (error) {
                  console.error('Error loading pending post:', error);
                }
              }
              
              // Handle successful connection
              if (params.get("connected") === "facebook") {
                fetchStatus();
                if (params.get("success") === "1") {
                  setSuccess("Facebook account connected successfully!");
                  // Clear URL parameters
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
              }
              
              // Handle user cancellation
              if (params.get("cancelled") === "1") {
                setError("Facebook connection cancelled. You can try again anytime.");
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              
              // Handle other errors
              if (params.get("error") === "1") {
                const errorMessage = params.get("message") || "Facebook connection failed. Please try again.";
                setError(decodeURIComponent(errorMessage));
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }, []);

            const handleConnectFacebook = async () => {
              try {
                setLoading(true);
                setError("");
                const res = await api.get("/social/facebook/redirect");
                const { url } = res.data;
                if (url) {
                  window.location.href = url;
                } else {
                  setError("Failed to get Facebook redirect URL");
                }
              } catch (err) {
                console.error("Failed to start Facebook connect:", err);
                setError("Failed to start Facebook connection. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const loadPages = async () => {
              try {
                setLoading(true);
                setError("");
                const res = await api.get("/social/facebook/pages");
                const fetchedPages = res.data || [];
                setPages(fetchedPages);
                
                if (fetchedPages.length === 0) {
                  setError("No Facebook Pages found. Please create a Facebook Page first at facebook.com/pages/create, then try again.");
                } else {
                  setSuccess(`Found ${fetchedPages.length} Facebook page(s). Please select one to continue.`);
                }
              } catch (err) {
                console.error("Failed to load Facebook pages:", err);
                setError("Failed to load Facebook pages. Make sure you're connected to Facebook.");
              } finally {
                setLoading(false);
              }
            };

            const selectPage = async (pageId) => {
              try {
                setLoading(true);
                setError("");
                await api.post("/social/facebook/select-page", { page_id: pageId });
                await fetchStatus();
                setSuccess("Page selected successfully!");
                setPages([]); // Clear pages after selection
              } catch (err) {
                console.error("Failed to select page:", err);
                setError("Failed to select page. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const disconnectFacebook = async () => {
              if (!window.confirm("Are you sure you want to disconnect your Facebook account?")) {
                return;
              }
              try {
                setLoading(true);
                setError("");
                await api.post("/social/facebook/disconnect");
                setFbStatus({ connected: false, page: null });
                setPages([]);
                setSuccess("Facebook account disconnected successfully!");
              } catch (err) {
                console.error("Failed to disconnect Facebook:", err);
                setError("Failed to disconnect Facebook. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const handleImageSelect = (event) => {
              const file = event.target.files[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                  setError("Image size must be less than 10MB");
                  return;
                }
                setSelectedImage(file);
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target.result);
                reader.readAsDataURL(file);
                setError("");
              }
            };

            const removeImage = () => {
              setSelectedImage(null);
              setImagePreview(null);
            };

            const createPost = async () => {
              if (!message.trim()) {
                setError("Please enter post content");
                return;
              }
              
              if (!fbStatus.connected || !fbStatus.page) {
                setError("Please connect to Facebook and select a page first");
                return;
              }

              // Instagram requires an image
              if (postToInstagram && !selectedImage) {
                setError("Instagram posts require an image");
                return;
              }

              try {
                setPosting(true);
                setError("");
                setSuccess("");

                const formData = new FormData();
                formData.append('message', message);
                if (link) formData.append('link', link);
                if (selectedImage) formData.append('image', selectedImage);

                // Choose the appropriate endpoint
                const endpoint = postToInstagram ? "/social/facebook/instagram-post" : "/social/facebook/post";
                
                const response = await api.post(endpoint, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });

                if (response.data.success) {
                  setMessage("");
                  setLink("");
                  setSelectedImage(null);
                  setImagePreview(null);
                  setPostToInstagram(false);
                  setSuccess(`Posted to ${postToInstagram ? 'Instagram' : 'Facebook'} successfully!`);
                } else {
                  setError(`Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}`);
                }
              } catch (err) {
                console.error(`Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}:`, err);
                const errorMsg = err.response?.data?.message;
                if (errorMsg && errorMsg.includes('Select a Facebook Page first')) {
                  setError('Please load your Facebook pages and select a page before posting.');
                } else {
                  setError(errorMsg || `Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}. Please try again.`);
                }
              } finally {
                setPosting(false);
              }
            };

            return (
              <div className="space-y-6 bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold tracking-tight">Social Media</h1>
                  <Button>Schedule Post</Button>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                  </div>
                )}

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        How Social Media Linking Works
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          When you connect your social media accounts, you're linking them to your existing CraftConnect account. 
                          This allows you to post content directly from CraftConnect to your social media platforms without creating new accounts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                            Link via Facebook (requires Facebook page with Instagram Business account)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              {fbStatus.connected && fbStatus.page ? (
                                <span className="text-green-600 font-medium">
                                  Available via Facebook
                                </span>
                              ) : (
                                <span className="text-gray-500 font-medium">
                                  Connect Facebook first
                                </span>
                              )}
                            </div>
                            {fbStatus.connected && fbStatus.page ? (
                              <Button variant="outline" size="sm" disabled>
                                Managed via Facebook
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                Connect Facebook First
                              </Button>
                            )}
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
                          <CardDescription>Link your existing Facebook account to CraftConnect</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              {fbStatus.connected ? (
                                <span className="text-green-600 font-medium">Connected</span>
                              ) : (
                                <span className="text-gray-500 font-medium">Not Connected</span>
                              )}
                              {fbStatus.page?.name && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Page: 
                                  {fbStatus.page.url ? (
                                    <a 
                                      href={fbStatus.page.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                                    >
                                      {fbStatus.page.name}
                                    </a>
                                  ) : (
                                    <span className="ml-1">{fbStatus.page.name}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {!fbStatus.connected ? (
                              <Button size="sm" onClick={handleConnectFacebook} disabled={loading}>
                                {loading ? "Linking Account..." : "Link Account"}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={loadPages} disabled={loading}>
                                  {loading ? "Loading..." : "Manage Pages"}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={disconnectFacebook} disabled={loading}>
                                  Disconnect
                                </Button>
                              </div>
                            )}
                          </div>
                          {pages.length > 0 ? (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-medium">Select a Page</div>
                              <div className="flex flex-wrap gap-2">
                                {pages.map((p) => (
                                  <div key={p.id} className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={fbStatus.page?.id === p.id ? "default" : "outline"}
                                      onClick={() => selectPage(p.id)}
                                    >
                                      {p.name}
                                    </Button>
                                    <a
                                      href={`https://www.facebook.com/${p.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                      View Page
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : pages.length === 0 && fbStatus.connected && loading === false ? (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="text-sm text-amber-800">
                                <p className="font-medium mb-2">No Facebook Pages found</p>
                                <p className="mb-3">You need a Facebook Page to post content. Create one now:</p>
                                <a
                                  href="https://www.facebook.com/pages/create"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                >
                                  <Button size="sm" variant="outline">
                                    Create Facebook Page
                                  </Button>
                                </a>
                                <p className="text-xs mt-2">After creating a page, click "Manage Pages" again.</p>
                              </div>
                            </div>
                          ) : null}
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
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="post-link">Link (Optional)</Label>
                          <Input
                            id="post-link"
                            placeholder="https://example.com/your-product"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Add a link to your product or website that will be included in the post</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button 
                              variant="outline" 
                              className="flex items-center"
                              onClick={() => document.getElementById('image-upload').click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Post to</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant={postToInstagram ? "default" : "outline"} 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => setPostToInstagram(!postToInstagram)}
                              disabled={!fbStatus.connected || !fbStatus.page}
                            >
                              <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                              Instagram
                            </Button>
                            <Button 
                              variant={!postToInstagram ? "default" : "outline"} 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => setPostToInstagram(false)}
                              disabled={!fbStatus.connected || !fbStatus.page}
                            >
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
                          {postToInstagram && (
                            <p className="text-sm text-amber-600">
                              Note: Instagram posts require an image and will be posted to your connected Instagram Business account.
                            </p>
                          )}
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
                      <CardFooter className="flex justify-end">
                        <Button onClick={createPost} disabled={!fbStatus.connected || !fbStatus.page || posting || (postToInstagram && !selectedImage)}>
                          {posting ? "Posting..." : `Post to ${postToInstagram ? 'Instagram' : 'Facebook'}`}
                        </Button>
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

                {/* Important Reminder */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Instagram Posting Requirements
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          To post to Instagram, your Facebook page must be connected to an Instagram Business account. 
                          If you don't see Instagram posting options, please:
                        </p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Connect your Facebook page to an Instagram Business account</li>
                          <li>Make sure your Instagram account is set to Business or Creator mode</li>
                          <li>Verify the connection in your Facebook Page settings</li>
                          <li>Refresh this page after making the connection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          export default SocialMedia;
