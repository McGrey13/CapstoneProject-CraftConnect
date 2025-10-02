<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Seller;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Review;
use App\Models\Analytics\RevenueAnalytics;
use App\Models\Analytics\SellerRevenueAnalytics;
use App\Models\Analytics\OrderAnalytics;
use App\Models\Analytics\ReviewAnalytics;
use App\Models\Analytics\ProductAnalytics;
use App\Models\Analytics\ContentModerationAnalytics;
use Carbon\Carbon;

class AnalyticsDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Analytics Data Seeder...');

        // Get all sellers
        $sellers = Seller::all();
        
        if ($sellers->isEmpty()) {
            $this->command->error('No sellers found. Please run seller seeder first.');
            return;
        }

        $this->command->info('Found ' . $sellers->count() . ' sellers');

        // Expanded sample product data with more variety
        $sampleProducts = [
            // Handmade Jewelry (15 products)
            ['name' => 'Handcrafted Silver Ring', 'description' => 'Beautiful handcrafted silver ring with intricate design', 'price' => 89.99, 'category' => 'Jewelry'],
            ['name' => 'Beaded Necklace Set', 'description' => 'Elegant beaded necklace set with matching earrings', 'price' => 65.50, 'category' => 'Jewelry'],
            ['name' => 'Wooden Pendant', 'description' => 'Unique wooden pendant with natural finish', 'price' => 45.00, 'category' => 'Jewelry'],
            ['name' => 'Gemstone Bracelet', 'description' => 'Hand-woven bracelet with natural gemstones', 'price' => 78.25, 'category' => 'Jewelry'],
            ['name' => 'Artisan Earrings', 'description' => 'Handmade earrings with vintage style', 'price' => 55.75, 'category' => 'Jewelry'],
            ['name' => 'Pearl Choker Necklace', 'description' => 'Classic pearl choker with elegant design', 'price' => 120.00, 'category' => 'Jewelry'],
            ['name' => 'Gold-plated Cufflinks', 'description' => 'Sophisticated gold-plated cufflinks', 'price' => 95.50, 'category' => 'Jewelry'],
            ['name' => 'Crystal Drop Earrings', 'description' => 'Sparkling crystal drop earrings', 'price' => 68.75, 'category' => 'Jewelry'],
            ['name' => 'Beaded Anklet', 'description' => 'Delicate beaded anklet for summer', 'price' => 35.25, 'category' => 'Jewelry'],
            ['name' => 'Silver Chain Bracelet', 'description' => 'Simple yet elegant silver chain bracelet', 'price' => 42.50, 'category' => 'Jewelry'],
            ['name' => 'Turquoise Pendant', 'description' => 'Natural turquoise pendant on leather cord', 'price' => 58.00, 'category' => 'Jewelry'],
            ['name' => 'Vintage Brooch', 'description' => 'Antique-style vintage brooch', 'price' => 85.75, 'category' => 'Jewelry'],
            ['name' => 'Wire-wrapped Ring', 'description' => 'Intricate wire-wrapped gemstone ring', 'price' => 72.25, 'category' => 'Jewelry'],
            ['name' => 'Charm Bracelet', 'description' => 'Personalized charm bracelet', 'price' => 105.00, 'category' => 'Jewelry'],
            ['name' => 'Moonstone Necklace', 'description' => 'Mystical moonstone pendant necklace', 'price' => 92.50, 'category' => 'Jewelry'],

            // Pottery & Ceramics (15 products)
            ['name' => 'Hand-thrown Ceramic Bowl', 'description' => 'Beautiful hand-thrown ceramic bowl perfect for serving', 'price' => 125.00, 'category' => 'Pottery'],
            ['name' => 'Decorative Vase', 'description' => 'Elegant decorative vase with unique glaze', 'price' => 95.50, 'category' => 'Pottery'],
            ['name' => 'Coffee Mug Set', 'description' => 'Set of 4 handcrafted coffee mugs', 'price' => 85.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Plate Collection', 'description' => 'Set of decorative ceramic plates', 'price' => 110.25, 'category' => 'Pottery'],
            ['name' => 'Artisan Teapot', 'description' => 'Handcrafted teapot with traditional design', 'price' => 145.75, 'category' => 'Pottery'],
            ['name' => 'Clay Sculpture', 'description' => 'Hand-sculpted clay art piece', 'price' => 185.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Salt Cellar', 'description' => 'Handmade ceramic salt cellar with spoon', 'price' => 65.50, 'category' => 'Pottery'],
            ['name' => 'Glazed Serving Bowl', 'description' => 'Large glazed serving bowl', 'price' => 98.75, 'category' => 'Pottery'],
            ['name' => 'Ceramic Candle Holder', 'description' => 'Decorative ceramic candle holder set', 'price' => 45.25, 'category' => 'Pottery'],
            ['name' => 'Hand-painted Tiles', 'description' => 'Set of hand-painted ceramic tiles', 'price' => 75.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Planter', 'description' => 'Beautiful ceramic plant pot', 'price' => 55.50, 'category' => 'Pottery'],
            ['name' => 'Raku Fired Vase', 'description' => 'Unique raku fired ceramic vase', 'price' => 165.25, 'category' => 'Pottery'],
            ['name' => 'Ceramic Spoon Rest', 'description' => 'Handmade ceramic spoon rest', 'price' => 25.75, 'category' => 'Pottery'],
            ['name' => 'Stoneware Pitcher', 'description' => 'Traditional stoneware water pitcher', 'price' => 115.00, 'category' => 'Pottery'],
            ['name' => 'Ceramic Butter Dish', 'description' => 'Elegant ceramic butter dish with lid', 'price' => 68.50, 'category' => 'Pottery'],

            // Textiles & Crafts (15 products)
            ['name' => 'Handwoven Scarf', 'description' => 'Luxurious handwoven scarf with natural fibers', 'price' => 75.00, 'category' => 'Textiles'],
            ['name' => 'Embroidered Pillow', 'description' => 'Beautiful embroidered decorative pillow', 'price' => 95.00, 'category' => 'Textiles'],
            ['name' => 'Quilted Blanket', 'description' => 'Hand-stitched quilted blanket', 'price' => 180.50, 'category' => 'Textiles'],
            ['name' => 'Woven Wall Hanging', 'description' => 'Decorative woven wall hanging', 'price' => 125.25, 'category' => 'Textiles'],
            ['name' => 'Hand-knitted Shawl', 'description' => 'Elegant hand-knitted shawl', 'price' => 105.75, 'category' => 'Textiles'],
            ['name' => 'Macrame Plant Hanger', 'description' => 'Decorative macrame plant hanger', 'price' => 45.50, 'category' => 'Textiles'],
            ['name' => 'Crocheted Doily Set', 'description' => 'Set of hand-crocheted doilies', 'price' => 35.25, 'category' => 'Textiles'],
            ['name' => 'Felted Wool Bag', 'description' => 'Hand-felted wool shoulder bag', 'price' => 85.75, 'category' => 'Textiles'],
            ['name' => 'Linen Table Runner', 'description' => 'Hand-embroidered linen table runner', 'price' => 68.00, 'category' => 'Textiles'],
            ['name' => 'Woven Basket', 'description' => 'Traditional hand-woven storage basket', 'price' => 95.50, 'category' => 'Textiles'],
            ['name' => 'Patchwork Quilt', 'description' => 'Colorful patchwork quilt', 'price' => 225.00, 'category' => 'Textiles'],
            ['name' => 'Tassel Garland', 'description' => 'Decorative tassel garland', 'price' => 42.75, 'category' => 'Textiles'],
            ['name' => 'Hand-dyed Scarf', 'description' => 'Beautiful hand-dyed silk scarf', 'price' => 88.25, 'category' => 'Textiles'],
            ['name' => 'Cross-stitch Art', 'description' => 'Hand-stitched cross-stitch artwork', 'price' => 125.50, 'category' => 'Textiles'],
            ['name' => 'Woven Placemats', 'description' => 'Set of 4 woven placemats', 'price' => 55.00, 'category' => 'Textiles'],

            // Woodworking (15 products)
            ['name' => 'Hand-carved Wooden Bowl', 'description' => 'Beautiful hand-carved wooden bowl', 'price' => 155.00, 'category' => 'Woodworking'],
            ['name' => 'Custom Cutting Board', 'description' => 'Premium custom cutting board', 'price' => 85.50, 'category' => 'Woodworking'],
            ['name' => 'Wooden Wall Art', 'description' => 'Intricate wooden wall art piece', 'price' => 225.00, 'category' => 'Woodworking'],
            ['name' => 'Handcrafted Coaster Set', 'description' => 'Set of handcrafted wooden coasters', 'price' => 45.25, 'category' => 'Woodworking'],
            ['name' => 'Custom Wooden Box', 'description' => 'Beautiful custom wooden storage box', 'price' => 135.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Wine Rack', 'description' => 'Handcrafted wooden wine rack', 'price' => 185.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Spoon', 'description' => 'Hand-carved wooden cooking spoon', 'price' => 35.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Picture Frame', 'description' => 'Custom wooden picture frame', 'price' => 65.25, 'category' => 'Woodworking'],
            ['name' => 'Wooden Salt Box', 'description' => 'Traditional wooden salt storage box', 'price' => 55.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Figurine', 'description' => 'Hand-carved wooden animal figurine', 'price' => 95.00, 'category' => 'Woodworking'],
            ['name' => 'Wooden Bread Box', 'description' => 'Handcrafted wooden bread storage box', 'price' => 125.75, 'category' => 'Woodworking'],
            ['name' => 'Wooden Phone Stand', 'description' => 'Minimalist wooden phone stand', 'price' => 42.50, 'category' => 'Woodworking'],
            ['name' => 'Carved Wooden Bowl Set', 'description' => 'Set of 3 hand-carved wooden bowls', 'price' => 175.25, 'category' => 'Woodworking'],
            ['name' => 'Wooden Utensil Holder', 'description' => 'Kitchen wooden utensil holder', 'price' => 75.00, 'category' => 'Woodworking'],
            ['name' => 'Wooden Laptop Stand', 'description' => 'Ergonomic wooden laptop stand', 'price' => 115.50, 'category' => 'Woodworking'],

            // Art & Paintings (15 products)
            ['name' => 'Original Watercolor Painting', 'description' => 'Original watercolor painting on canvas', 'price' => 250.00, 'category' => 'Art'],
            ['name' => 'Acrylic Landscape Art', 'description' => 'Beautiful acrylic landscape painting', 'price' => 195.50, 'category' => 'Art'],
            ['name' => 'Abstract Art Print', 'description' => 'Limited edition abstract art print', 'price' => 75.00, 'category' => 'Art'],
            ['name' => 'Hand-painted Ceramic Tile', 'description' => 'Decorative hand-painted ceramic tile', 'price' => 35.25, 'category' => 'Art'],
            ['name' => 'Mixed Media Artwork', 'description' => 'Unique mixed media artwork', 'price' => 175.75, 'category' => 'Art'],
            ['name' => 'Oil Painting Portrait', 'description' => 'Hand-painted oil portrait', 'price' => 325.00, 'category' => 'Art'],
            ['name' => 'Digital Art Print', 'description' => 'High-quality digital art print', 'price' => 65.50, 'category' => 'Art'],
            ['name' => 'Collage Artwork', 'description' => 'Creative collage art piece', 'price' => 125.75, 'category' => 'Art'],
            ['name' => 'Pencil Sketch', 'description' => 'Detailed pencil sketch artwork', 'price' => 85.25, 'category' => 'Art'],
            ['name' => 'Charcoal Drawing', 'description' => 'Dramatic charcoal drawing', 'price' => 95.00, 'category' => 'Art'],
            ['name' => 'Pastel Painting', 'description' => 'Soft pastel painting', 'price' => 145.50, 'category' => 'Art'],
            ['name' => 'Ink Wash Painting', 'description' => 'Traditional ink wash painting', 'price' => 155.75, 'category' => 'Art'],
            ['name' => 'Abstract Canvas', 'description' => 'Large abstract canvas painting', 'price' => 285.00, 'category' => 'Art'],
            ['name' => 'Botanical Illustration', 'description' => 'Detailed botanical illustration', 'price' => 105.25, 'category' => 'Art'],
            ['name' => 'Calligraphy Art', 'description' => 'Hand-lettered calligraphy artwork', 'price' => 75.50, 'category' => 'Art'],

            // Leather Goods (15 products)
            ['name' => 'Handcrafted Leather Wallet', 'description' => 'Premium handcrafted leather wallet', 'price' => 125.00, 'category' => 'Leather'],
            ['name' => 'Custom Leather Belt', 'description' => 'Hand-tooled leather belt', 'price' => 95.50, 'category' => 'Leather'],
            ['name' => 'Leather Journal Cover', 'description' => 'Beautiful leather journal cover', 'price' => 85.00, 'category' => 'Leather'],
            ['name' => 'Handbag', 'description' => 'Elegant handmade leather handbag', 'price' => 245.25, 'category' => 'Leather'],
            ['name' => 'Leather Keychain', 'description' => 'Hand-tooled leather keychain', 'price' => 25.75, 'category' => 'Leather'],
            ['name' => 'Leather Phone Case', 'description' => 'Handmade leather phone case', 'price' => 65.50, 'category' => 'Leather'],
            ['name' => 'Leather Laptop Sleeve', 'description' => 'Premium leather laptop sleeve', 'price' => 135.75, 'category' => 'Leather'],
            ['name' => 'Leather Coin Purse', 'description' => 'Small leather coin purse', 'price' => 45.25, 'category' => 'Leather'],
            ['name' => 'Leather Watch Band', 'description' => 'Handcrafted leather watch band', 'price' => 75.00, 'category' => 'Leather'],
            ['name' => 'Leather Backpack', 'description' => 'Handmade leather backpack', 'price' => 295.50, 'category' => 'Leather'],
            ['name' => 'Leather Sunglasses Case', 'description' => 'Leather sunglasses case', 'price' => 55.75, 'category' => 'Leather'],
            ['name' => 'Leather iPad Case', 'description' => 'Handcrafted leather iPad case', 'price' => 185.25, 'category' => 'Leather'],
            ['name' => 'Leather Dog Collar', 'description' => 'Handmade leather dog collar', 'price' => 85.50, 'category' => 'Leather'],
            ['name' => 'Leather Business Card Holder', 'description' => 'Elegant leather business card holder', 'price' => 65.25, 'category' => 'Leather'],
            ['name' => 'Leather Camera Strap', 'description' => 'Professional leather camera strap', 'price' => 95.75, 'category' => 'Leather'],

            // Candles & Soaps (15 products)
            ['name' => 'Soy Candle Collection', 'description' => 'Hand-poured soy candle collection', 'price' => 65.00, 'category' => 'Candles'],
            ['name' => 'Artisan Soap Set', 'description' => 'Handmade artisan soap set', 'price' => 45.50, 'category' => 'Candles'],
            ['name' => 'Essential Oil Candles', 'description' => 'Aromatherapy candles with essential oils', 'price' => 55.25, 'category' => 'Candles'],
            ['name' => 'Bath Bomb Collection', 'description' => 'Luxurious bath bomb collection', 'price' => 35.00, 'category' => 'Candles'],
            ['name' => 'Wax Melts Set', 'description' => 'Hand-poured wax melts in various scents', 'price' => 28.75, 'category' => 'Candles'],
            ['name' => 'Lavender Soap Bar', 'description' => 'Handmade lavender soap bar', 'price' => 12.50, 'category' => 'Candles'],
            ['name' => 'Vanilla Candle', 'description' => 'Hand-poured vanilla scented candle', 'price' => 42.75, 'category' => 'Candles'],
            ['name' => 'Tea Tree Soap', 'description' => 'Antibacterial tea tree soap', 'price' => 15.25, 'category' => 'Candles'],
            ['name' => 'Citrus Wax Melts', 'description' => 'Fresh citrus scented wax melts', 'price' => 22.50, 'category' => 'Candles'],
            ['name' => 'Rose Petal Soap', 'description' => 'Luxurious rose petal soap', 'price' => 18.75, 'category' => 'Candles'],
            ['name' => 'Sandalwood Candle', 'description' => 'Woody sandalwood scented candle', 'price' => 48.50, 'category' => 'Candles'],
            ['name' => 'Eucalyptus Bath Salts', 'description' => 'Relaxing eucalyptus bath salts', 'price' => 25.00, 'category' => 'Candles'],
            ['name' => 'Honey Soap', 'description' => 'Moisturizing honey soap bar', 'price' => 16.25, 'category' => 'Candles'],
            ['name' => 'Ocean Breeze Candle', 'description' => 'Fresh ocean breeze scented candle', 'price' => 52.75, 'category' => 'Candles'],
            ['name' => 'Oatmeal Soap', 'description' => 'Gentle oatmeal exfoliating soap', 'price' => 14.50, 'category' => 'Candles'],

            // Additional Categories for Better Distribution
            // Home Decor (10 products)
            ['name' => 'Decorative Wall Mirror', 'description' => 'Handcrafted decorative wall mirror', 'price' => 165.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Planter Set', 'description' => 'Set of decorative ceramic planters', 'price' => 85.25, 'category' => 'Home Decor'],
            ['name' => 'Woven Throw Pillow', 'description' => 'Colorful woven throw pillow', 'price' => 45.75, 'category' => 'Home Decor'],
            ['name' => 'Wooden Bookend Set', 'description' => 'Hand-carved wooden bookends', 'price' => 65.00, 'category' => 'Home Decor'],
            ['name' => 'Metal Wall Sculpture', 'description' => 'Abstract metal wall sculpture', 'price' => 125.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Coaster Set', 'description' => 'Set of hand-painted ceramic coasters', 'price' => 35.25, 'category' => 'Home Decor'],
            ['name' => 'Woven Storage Basket', 'description' => 'Large woven storage basket', 'price' => 95.75, 'category' => 'Home Decor'],
            ['name' => 'Wooden Candle Holder', 'description' => 'Handcrafted wooden candle holder', 'price' => 55.50, 'category' => 'Home Decor'],
            ['name' => 'Ceramic Vase Set', 'description' => 'Set of decorative ceramic vases', 'price' => 115.25, 'category' => 'Home Decor'],
            ['name' => 'Metal Wind Chime', 'description' => 'Handcrafted metal wind chime', 'price' => 75.00, 'category' => 'Home Decor'],

            // Accessories (10 products)
            ['name' => 'Handwoven Tote Bag', 'description' => 'Eco-friendly handwoven tote bag', 'price' => 65.50, 'category' => 'Accessories'],
            ['name' => 'Leather Hair Accessory', 'description' => 'Handmade leather hair accessory', 'price' => 35.25, 'category' => 'Accessories'],
            ['name' => 'Beaded Anklet', 'description' => 'Delicate beaded ankle bracelet', 'price' => 25.75, 'category' => 'Accessories'],
            ['name' => 'Macrame Purse', 'description' => 'Handmade macrame purse', 'price' => 85.00, 'category' => 'Accessories'],
            ['name' => 'Fabric Hair Scarf', 'description' => 'Colorful fabric hair scarf', 'price' => 28.50, 'category' => 'Accessories'],
            ['name' => 'Leather Headband', 'description' => 'Handcrafted leather headband', 'price' => 45.75, 'category' => 'Accessories'],
            ['name' => 'Woven Belt', 'description' => 'Handwoven fabric belt', 'price' => 55.25, 'category' => 'Accessories'],
            ['name' => 'Beaded Hair Clip', 'description' => 'Decorative beaded hair clip', 'price' => 18.75, 'category' => 'Accessories'],
            ['name' => 'Leather Wristlet', 'description' => 'Small leather wristlet purse', 'price' => 75.50, 'category' => 'Accessories'],
            ['name' => 'Fabric Makeup Bag', 'description' => 'Handmade fabric makeup bag', 'price' => 42.25, 'category' => 'Accessories'],
        ];

        // Add products for each seller with better category distribution
        foreach ($sellers as $seller) {
            $this->command->info("Adding products for seller: {$seller->businessName} (ID: {$seller->sellerID})");
            
            // Ensure each seller gets products from different categories
            $categories = collect($sampleProducts)->groupBy('category')->keys();
            $sellerProducts = collect();
            
            // Get 1-2 products from each category to ensure variety
            foreach ($categories as $category) {
                $categoryProducts = collect($sampleProducts)->where('category', $category);
                $sellerProducts = $sellerProducts->merge($categoryProducts->random(rand(1, 2)));
            }
            
            // Add a few more random products to reach 8-12 products per seller
            $additionalProducts = collect($sampleProducts)->random(rand(3, 5));
            $sellerProducts = $sellerProducts->merge($additionalProducts)->unique('name');
            
            foreach ($sellerProducts as $productData) {
                // Check if product already exists for this seller
                $existingProduct = Product::where('productName', $productData['name'])
                    ->where('seller_id', $seller->sellerID)
                    ->first();
                
                if ($existingProduct) {
                    continue; // Skip if product already exists
                }
                
                Product::create([
                    'productName' => $productData['name'],
                    'productDescription' => $productData['description'],
                    'productPrice' => $productData['price'],
                    'productQuantity' => rand(10, 100),
                    'status' => rand(0, 1) ? 'in stock' : (rand(0, 1) ? 'low stock' : 'out of stock'),
                    'category' => $productData['category'],
                    'seller_id' => $seller->sellerID,
                    'approval_status' => 'approved',
                    'publish_status' => 'published',
                    'is_featured' => rand(0, 1) ? true : false,
                    'productImage' => 'products/sample-product-' . rand(1, 10) . '.jpg',
                    'created_at' => Carbon::now()->subDays(rand(1, 90)),
                    'updated_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('Products created successfully');

        // Create some customers for orders
        $this->createSampleCustomers();

        // Generate analytics data for the past 3 months
        $this->generateAnalyticsData();

        $this->command->info('Analytics Data Seeder completed successfully!');
    }

    private function createSampleCustomers()
    {
        $this->command->info('Creating sample customers...');

        $customerData = [
            ['name' => 'John Smith', 'email' => 'john.smith@example.com'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah.johnson@example.com'],
            ['name' => 'Mike Davis', 'email' => 'mike.davis@example.com'],
            ['name' => 'Emily Wilson', 'email' => 'emily.wilson@example.com'],
            ['name' => 'David Brown', 'email' => 'david.brown@example.com'],
            ['name' => 'Lisa Anderson', 'email' => 'lisa.anderson@example.com'],
            ['name' => 'Tom Miller', 'email' => 'tom.miller@example.com'],
            ['name' => 'Jennifer Taylor', 'email' => 'jennifer.taylor@example.com'],
        ];

        $customers = [];
        foreach ($customerData as $data) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $data['email'])->first();
            
            if ($existingUser) {
                $customers[] = $existingUser;
                continue;
            }
            
            $user = User::create([
                'userName' => $data['name'],
                'userEmail' => $data['email'],
                'userPassword' => bcrypt('password123'),
                'role' => 'customer',
                'userContactNumber' => '09' . rand(100000000, 999999999),
                'userAddress' => 'Sample Address',
                'userCity' => 'Sample City',
                'userProvince' => 'Sample Province',
                'is_verified' => true,
                'created_at' => Carbon::now()->subDays(rand(30, 90)),
            ]);
            $customers[] = $user;
        }

        // Create sample orders
        $this->createSampleOrders($customers);
    }

    private function createSampleOrders($customers)
    {
        $this->command->info('Creating sample orders...');

        $products = Product::all();
        $sellers = Seller::all();

        // Create 50-100 sample orders over the past 3 months
        $orderCount = rand(50, 100);
        
        for ($i = 0; $i < $orderCount; $i++) {
            $customer = $customers[array_rand($customers)];
            $seller = $sellers->random();
            $sellerProducts = $products->where('seller_id', $seller->sellerID);
            
            if ($sellerProducts->isEmpty()) {
                continue;
            }

            // Get customer record for this user
            $customerRecord = \App\Models\Customer::where('user_id', $customer->userID)->first();
            if (!$customerRecord) {
                // Create customer record if it doesn't exist
                $customerRecord = \App\Models\Customer::create([
                    'user_id' => $customer->userID,
                    'profile_picture_path' => null,
                ]);
            }

            $order = Order::create([
                'customer_id' => $customerRecord->customerID,
                'totalAmount' => 0,
                'status' => $this->getRandomOrderStatus(),
                'location' => '123 Sample Street, Sample City, SC 12345',
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);

            $totalAmount = 0;
            $productCount = rand(1, 3);
            $selectedProducts = $sellerProducts->random($productCount);

            foreach ($selectedProducts as $product) {
                $quantity = rand(1, 3);
                $subtotal = $product->productPrice * $quantity;
                
                OrderProduct::create([
                    'order_id' => $order->orderID,
                    'product_id' => $product->product_id,
                    'quantity' => $quantity,
                    'price' => $product->productPrice,
                ]);

                $totalAmount += $subtotal;
            }

            $order->update(['totalAmount' => $totalAmount]);

            // Create some reviews for products
            if (rand(0, 1)) { // 50% chance of review
                $this->createSampleReview($customer, $selectedProducts->random());
            }
        }

        $this->command->info('Sample orders and reviews created');
    }

    private function createSampleReview($customer, $product)
    {
        // Check if review already exists for this user-product combination
        $existingReview = Review::where('user_id', $customer->userID)
            ->where('product_id', $product->product_id)
            ->first();
        
        if ($existingReview) {
            return; // Skip if review already exists
        }

        $ratings = [5, 5, 4, 4, 5, 3, 5, 4, 5]; // Mostly positive ratings
        $rating = $ratings[array_rand($ratings)];
        
        $reviewTexts = [
            'Amazing quality! Highly recommended.',
            'Beautiful craftsmanship, exactly as described.',
            'Great product, fast shipping!',
            'Love this item, perfect for my needs.',
            'Excellent quality and beautiful design.',
            'Very satisfied with this purchase.',
            'Outstanding workmanship, will buy again!',
            'Perfect gift for my loved one.',
        ];

        Review::create([
            'user_id' => $customer->userID,
            'product_id' => $product->product_id,
            'rating' => $rating,
            'comment' => $reviewTexts[array_rand($reviewTexts)],
            'review_date' => Carbon::now()->subDays(rand(1, 60)),
        ]);
    }

    private function getRandomOrderStatus()
    {
        $statuses = ['pending', 'packing', 'shipped', 'delivered'];
        $weights = [10, 20, 25, 45]; // Most orders are delivered
        
        $random = rand(1, 100);
        $cumulative = 0;
        
        for ($i = 0; $i < count($statuses); $i++) {
            $cumulative += $weights[$i];
            if ($random <= $cumulative) {
                return $statuses[$i];
            }
        }
        
        return 'delivered';
    }

    private function generateAnalyticsData()
    {
        $this->command->info('Generating analytics data...');

        $startDate = Carbon::now()->subMonths(3);
        $endDate = Carbon::now();

        // Generate daily analytics data
        $currentDate = $startDate->copy();
        while ($currentDate->lte($endDate)) {
            $this->generateDailyAnalytics($currentDate);
            $currentDate->addDay();
        }

        // Generate monthly analytics data
        $this->generateMonthlyAnalytics($startDate, $endDate);

        $this->command->info('Analytics data generated successfully');
    }

    private function generateDailyAnalytics($date)
    {
        // Revenue Analytics
        $dailyRevenue = rand(500, 3000);
        $platformCommission = $dailyRevenue * 0.10; // 10% commission
        $paymentFees = $dailyRevenue * 0.03; // 3% payment processing
        
        RevenueAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_revenue' => $dailyRevenue,
            'platform_commission' => $platformCommission,
            'payment_processing_fees' => $paymentFees,
            'total_orders' => rand(10, 50),
            'average_order_value' => $dailyRevenue / rand(10, 50),
        ]);

        // Order Analytics
        $totalOrders = rand(10, 50);
        $completedOrders = rand(5, 25);
        $pendingOrders = rand(1, 5);
        $processingOrders = rand(2, 8);
        $shippedOrders = rand(3, 10);
        $cancelledOrders = rand(0, 3);
        $refundedOrders = rand(0, 2);
        
        OrderAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders,
            'pending_orders' => $pendingOrders,
            'processing_orders' => $processingOrders,
            'shipped_orders' => $shippedOrders,
            'cancelled_orders' => $cancelledOrders,
            'refunded_orders' => $refundedOrders,
            'completion_rate' => $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0,
            'cancellation_rate' => $totalOrders > 0 ? ($cancelledOrders / $totalOrders) * 100 : 0,
            'refund_rate' => $totalOrders > 0 ? ($refundedOrders / $totalOrders) * 100 : 0,
            'average_order_value' => rand(50, 200),
        ]);

        // Review Analytics
        $totalReviews = rand(5, 20);
        $reviewsWithComments = rand(3, $totalReviews);
        
        ReviewAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_reviews' => $totalReviews,
            'average_rating' => rand(35, 50) / 10, // 3.5 to 5.0
            'five_star_reviews' => rand(2, 8),
            'four_star_reviews' => rand(1, 5),
            'three_star_reviews' => rand(0, 3),
            'two_star_reviews' => rand(0, 2),
            'one_star_reviews' => rand(0, 1),
            'reviews_with_comments' => $reviewsWithComments,
            'reviews_without_comments' => $totalReviews - $reviewsWithComments,
            'response_rate' => rand(60, 95),
        ]);

        // Product Analytics
        ProductAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'total_products' => Product::count(),
            'active_products' => Product::where('status', 'in stock')->count(),
            'inactive_products' => Product::where('status', 'out of stock')->count(),
            'low_stock_products' => Product::where('status', 'low stock')->count(),
            'featured_products' => Product::where('is_featured', true)->count(),
            'products_with_images' => Product::whereNotNull('productImage')->count(),
            'products_with_videos' => Product::whereNotNull('productVideo')->count(),
            'products_without_images' => Product::whereNull('productImage')->count(),
            'average_product_rating' => rand(35, 50) / 10,
        ]);

        // Content Moderation Analytics
        $productsPending = rand(5, 15);
        $productsApproved = rand(4, 12);
        $productsRejected = rand(0, 3);
        $totalProducts = $productsPending + $productsApproved + $productsRejected;
        
        ContentModerationAnalytics::create([
            'date' => $date,
            'period_type' => 'daily',
            'products_pending_approval' => $productsPending,
            'products_approved' => $productsApproved,
            'products_rejected' => $productsRejected,
            'reviews_flagged' => rand(1, 5),
            'reviews_approved' => rand(2, 8),
            'reviews_removed' => rand(0, 2),
            'users_suspended' => rand(0, 1),
            'users_reactivated' => rand(0, 1),
            'approval_rate' => $totalProducts > 0 ? ($productsApproved / $totalProducts) * 100 : 0,
            'rejection_rate' => $totalProducts > 0 ? ($productsRejected / $totalProducts) * 100 : 0,
        ]);

        // Seller Revenue Analytics
        $sellers = Seller::all();
        foreach ($sellers as $seller) {
            $sellerRevenue = rand(50, 500);
            SellerRevenueAnalytics::create([
                'seller_id' => $seller->sellerID,
                'date' => $date,
                'period_type' => 'daily',
                'total_revenue' => $sellerRevenue,
                'commission_earned' => $sellerRevenue * 0.10,
                'total_orders' => rand(1, 10),
                'average_order_value' => $sellerRevenue / rand(1, 10),
                'products_sold' => rand(1, 8),
            ]);
        }
    }

    private function generateMonthlyAnalytics($startDate, $endDate)
    {
        $currentDate = $startDate->copy()->startOfMonth();
        
        while ($currentDate->lte($endDate)) {
            $monthEnd = $currentDate->copy()->endOfMonth();
            
            // Aggregate daily data for monthly totals
            $dailyRevenueData = RevenueAnalytics::whereBetween('date', [$currentDate, $monthEnd])
                ->where('period_type', 'daily')
                ->get();
            
            if ($dailyRevenueData->isNotEmpty()) {
                RevenueAnalytics::create([
                    'date' => $currentDate,
                    'period_type' => 'monthly',
                    'total_revenue' => $dailyRevenueData->sum('total_revenue'),
                    'platform_commission' => $dailyRevenueData->sum('platform_commission'),
                    'payment_processing_fees' => $dailyRevenueData->sum('payment_processing_fees'),
                    'total_orders' => $dailyRevenueData->sum('total_orders'),
                    'average_order_value' => $dailyRevenueData->avg('average_order_value'),
                ]);
            }

            $currentDate->addMonth();
        }
    }
}
