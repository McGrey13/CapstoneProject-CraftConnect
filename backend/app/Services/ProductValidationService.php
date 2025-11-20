<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ProductValidationService
{
    /**
     * Valid Laguna craft categories based on the study
     */
    private static $validLagunaCategories = [
        // Woodworking & Carving (Paete, Pakil)
        'woodworking',
        'wood carving',
        'wood sculpture',
        'papier-mâché',
        'paper crafts',
        'paper-mâché figures',
        'wooden bags',
        'metalwork',
        'woodwork',
        'handmade furniture',
        
        // Textiles & Embroidery (Lumban, Luisiana, Pila)
        'embroidery',
        'textiles',
        'weaving',
        'basketry',
        'basket weaving',
        'crochet',
        'knitting',
        'barong tagalog',
        'traditional garments',
        
        // Pottery & Ceramics (Pila, San Pedro, Victoria)
        'pottery',
        'ceramics',
        'clay pots',
        'ceramic art',
        
        // Jewelry & Accessories (Santa Cruz, Pagsanjan, Cavinti)
        'jewelry',
        'metalwork',
        'beaded accessories',
        'bracelets',
        'necklaces',
        'handmade accessories',
        
        // Footwear (Liliw, Biñan)
        'handmade slippers',
        'footwear',
        'traditional shoes',
        
        // Art & Statuary
        'statuary',
        'sculpture',
        'art',
        'paintings',
        'drawings',
        'charcoal art',
        
        // Other Laguna crafts
        'miniatures',
        'souvenirs',
        'rubber stamp',
        'traditional accessories',
        'handmade crafts',
        'handicrafts',
        'local crafts',
        
        // Paper & Fiber Arts
        'pineapple fiber',
        'abaca crafts',
        'native fiber crafts',
        'handwoven textiles',
        
        // Featured products
        'featured'
    ];

    /**
     * Banned words filter - Drugs, Weapons, Offensive content
     * Products containing these words will be automatically rejected
     */
    private static $bannedWords = [
        // Drugs and illegal substances
        'drug', 'drugs', 'cocaine', 'marijuana', 'cannabis', 'weed', 'heroin',
        'meth', 'methamphetamine', 'ecstasy', 'mdma', 'lsd', 'acid',
        'opium', 'morphine', 'crack', 'crystal meth', 'shabu', 'ice',
        'steroid', 'steroids', 'pills', 'pharmaceutical', 'prescription',
        'narcotic', 'narcotics', 'amphetamine', 'hallucinogen',
        
        // Weapons and firearms
        'weapon', 'weapons', 'gun', 'guns', 'rifle', 'rifles', 'pistol',
        'pistols', 'revolver', 'shotgun', 'shotguns', 'firearm', 'firearms',
        'knife', 'knives', 'blade', 'blades', 'sword', 'swords', 'dagger',
        'machete', 'bayonet', 'bomb', 'bombs', 'explosive', 'explosives',
        'grenade', 'grenades', 'ammunition', 'ammo', 'bullet', 'bullets',
        'taser', 'stun gun', 'pepper spray', 'brass knuckles', 'nunchaku',
        'knuckle duster', 'switchblade', 'throwing knife', 'combat knife',
        
        // Violence and threats
        'kill', 'killing', 'murder', 'murderer', 'assassination', 'assassin',
        'violence', 'violent', 'torture', 'abuse', 'terrorism', 'terrorist',
        'bombing', 'shooting', 'massacre', 'genocide', 'hate crime',
        
        // Common profanity
        'fuck', 'fucking', 'shit', 'damn', 'hell', 'asshole', 'bitch',
        'bastard', 'piss', 'pissed', 'crap', 'crap', 'dick', 'cock',
        'pussy', 'whore', 'slut', 'motherfucker', 'motherfucking',
        
        // Racial slurs and hate speech
        'nigger', 'nigga', 'chink', 'gook', 'kike', 'spic', 'wetback',
        'towelhead', 'sand nigger', 'raghead',
        
        // Adult/sexual content
        'sex', 'sexual', 'porn', 'pornography', 'xxx', 'nude', 'naked',
        'erotic', 'explicit', 'adult', 'mature', '18+', 'nsfw',
        'escort', 'prostitute', 'hooker', 'stripper',
        
        // Scam and fraud terms
        'scam', 'fraud', 'fake', 'counterfeit', 'replica', 'knockoff',
        'phishing', 'identity theft', 'pyramid scheme', 'ponzi',
        
        // Copyright infringement
        'pirate', 'pirated', 'unauthorized', 'illegal copy',
        'counterfeit', 'fake rolex', 'fake gucci', 'fake louis vuitton',
        
        // Illegal activities
        'illegal', 'stolen', 'theft', 'robbery', 'burglary', 'hacking',
        'hack', 'crack', 'warez', 'keygen', 'serial number',
        
        // Dangerous items
        'poison', 'toxic', 'hazardous', 'dangerous', 'harmful',
        'chemical weapon', 'biological weapon', 'nuclear',
        
        // Add more filters as needed
    ];

    /**
     * Towns and locations in Laguna
     */
    private static $lagunaTowns = [
        'paete', 'lumban', 'pila', 'pakil',
        'calauan', 'liliw', 'victoria',
        'pagsanjan', 'kalayaan', 'san pedro',
        'santa cruz', 'binan', 'calamba',
        'san pablo', 'bay', 'siniloan',
        'luisiana', 'cavinti', 'laguna',
        'los baños', 'los banos', 'cabuyao',
        'nagcarlan', 'mabitac', 'majayjay',
        'famy', 'alaminos', 'magdalena'
    ];

    /**
     * Location-based craft keywords mapping
     * Maps locations to their traditional craft keywords
     */
    private static $locationCraftKeywords = [
        // Paete, Laguna - Wood Carving / Cement Carving / Marble Carving (statues, religious icons, furniture)
        'paete' => [
            'keywords' => ['statue', 'sculpture', 'paet', 'chisel', 'wood carving', 'woodcarving', 'carved', 'carving', 'santo', 'religious', 'icon', 'statuary', 'wooden', 'woodwork', 'nativity', 'nativity set', 'devotional', 'ornate panel', 'furniture', 'wooden furniture', 'religious art', 'religious icon', 'saint', 'saints', 'santol', 'batikuling', 'narra', 'wall décor', 'wall decor', 'mask', 'masks', 'cement carving', 'cement statue', 'cement sculpture', 'marble carving', 'marble statue', 'marble sculpture', 'cement art', 'marble art'],
            'categories' => ['woodworking', 'wood carving', 'wood sculpture', 'statuary', 'sculpture', 'art', 'woodwork', 'furniture', 'religious art', 'woodcraft', 'sculpture'],
            'province' => 'laguna'
        ],
        // Lumban, Laguna - Hand Embroidery / Bead & Lace Accessories
        'lumban' => [
            'keywords' => ['embroidery', 'embroidered', 'barong', 'barong tagalog', 'thread', 'stitch', 'needlework', 'textile', 'jusi', 'piña', 'organza', 'filipiniana', 'lacework', 'lace', 'formal wear', 'gown', 'gowns', 'hand embroidery', 'piña fabric', 'jusi fabric', 'organza fabric', 'lace panel', 'bead', 'beads', 'sequin', 'sequins', 'headpiece', 'headpieces', 'apparel craft'],
            'categories' => ['embroidery', 'textiles', 'barong tagalog', 'traditional garments', 'traditional clothing', 'textile', 'embroidery', 'apparel craft'],
            'province' => 'laguna'
        ],
        // Pila, Laguna - Basket Weaving (baskets, bayong, trays) - Rattan, bamboo, pandan
        'pila' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'porcelain', 'heritage', 'souvenir', 'souvenirs', 'woven basket', 'basket', 'bayong', 'home décor', 'historic', 'ancestral', 'basket weaving', 'rattan', 'bamboo', 'pandan', 'tray', 'trays'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'historical crafts', 'souvenirs', 'weaving', 'home décor'],
            'province' => 'laguna'
        ],
        // Pakil, Laguna - Wood Whittling (small figurines, mini sculptures) - Light wood
        'pakil' => [
            'keywords' => ['papier-mâché', 'paper mache', 'wood carving', 'carved', 'santo', 'religious', 'whittling', 'whittle', 'small carving', 'wooden item', 'carved souvenir', 'figure', 'figures', 'light wood', 'small figurine', 'mini sculpture', 'mini sculptures'],
            'categories' => ['woodworking', 'papier-mâché', 'paper crafts', 'wood carving', 'whittling', 'woodcraft'],
            'province' => 'laguna'
        ],
        // Liliw, Laguna - Footwear (Tsinelas) - Leather, rubber, abaca, synthetic straps
        'liliw' => [
            'keywords' => ['slipper', 'footwear', 'shoe', 'sandal', 'tsinelas', 'handmade slippers', 'leather sandal', 'abaca sandal', 'craft footwear', 'hand-crafted shoe', 'leather', 'rubber', 'synthetic strap', 'wedge', 'wedges'],
            'categories' => ['handmade slippers', 'footwear', 'traditional shoes', 'leather', 'fashion accessories', 'footwear', 'leathercraft'],
            'province' => 'laguna'
        ],
        // Biñan City, Laguna - Puto Biñan & Wood & Metal Furniture
        'binan' => [
            'keywords' => ['slipper', 'footwear', 'shoe', 'accessory', 'handmade', 'puto binan', 'puto', 'rice cake', 'delicacy', 'furniture', 'wood furniture', 'metal furniture', 'cabinet', 'table', 'welded', 'metal design', 'custom cabinet'],
            'categories' => ['handmade slippers', 'footwear', 'accessories', 'culinary heritage', 'furniture craftsmanship', 'metalworks'],
            'province' => 'laguna'
        ],
        // Pagsanjan, Laguna - Local Souvenirs (wood items, pottery) near tourist sites
        'pagsanjan' => [
            'keywords' => ['jewelry', 'jewellery', 'bracelet', 'necklace', 'accessory', 'beaded', 'metalwork', 'souvenir', 'souvenirs', 'wood carving', 'small wood carving', 'pottery', 'woven souvenir', 'tourist', 'pagsanjan falls'],
            'categories' => ['jewelry', 'metalwork', 'beaded accessories', 'bracelets', 'necklaces', 'souvenirs', 'wood carving', 'pottery'],
            'province' => 'laguna'
        ],
        // Santa Cruz, Laguna - Known for jewelry
        'santa cruz' => [
            'keywords' => ['jewelry', 'jewellery', 'accessory', 'beaded', 'metalwork'],
            'categories' => ['jewelry', 'metalwork', 'beaded accessories'],
            'province' => 'laguna'
        ],
        // Cavinti, Laguna - Rattan & Bamboo Furniture (chairs, tables, hampers, baskets)
        'cavinti' => [
            'keywords' => ['jewelry', 'jewellery', 'accessory', 'beaded', 'rattan', 'bamboo', 'rattan chair', 'bamboo table', 'hamper', 'basket', 'resort furniture', 'eco-tourism', 'outdoor gear', 'handmade accessory', 'sling', 'rope', 'keychain', 'camping accessory', 'lumot lake', 'cavinti falls', 'rattan furniture', 'bamboo furniture'],
            'categories' => ['jewelry', 'beaded accessories', 'natural-fiber furniture', 'basketry', 'outdoor craft', 'accessory craft', 'furniture', 'natural fiber craft'],
            'province' => 'laguna'
        ],
        // Calamba, Laguna - Known for pottery and clay pots
        'calamba' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'claypot', 'clay pot'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'kitchenware'],
            'province' => 'laguna'
        ],
        // San Pablo City, Laguna - Buri & Coco Crafts (fans, baskets, wall décor, lamps) - Buri leaves, coconut shells
        'san pablo' => [
            'keywords' => ['coconut', 'buri', 'basket', 'basketry', 'weaving', 'woven', 'coconut shell', 'coconut husk', 'coir', 'native', 'fiber', 'buri hat', 'buri fan', 'bamboo', 'bamboo décor', 'coconut décor', 'art studio', 'craft studio', 'craft café', 'contemporary craft', 'buri leaf', 'buri leaves', 'wall décor', 'wall decor', 'lamp', 'lamps'],
            'categories' => ['basketry', 'basket weaving', 'coconut crafts', 'rattan/bamboo crafts', 'native fiber crafts', 'plant-fiber crafts', 'bamboo handicrafts', 'contemporary craft studios', 'natural fiber craft'],
            'province' => 'laguna'
        ],
        // Bay, Laguna - Native Bag Weaving (bayong, handbags) - Pandan, buri, abaca
        'bay' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'native bag', 'bayong', 'handbag', 'pandan', 'buri', 'abaca', 'bag weaving'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'weaving'],
            'province' => 'laguna'
        ],
        // Victoria, Laguna - Duck-themed Souvenirs (duck figurines, magnets, décor) - Wood, resin, paint
        'victoria' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'duck', 'duck figurine', 'duck magnet', 'duck décor', 'duck theme', 'resin', 'paint', 'souvenir craft'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'souvenir craft'],
            'province' => 'laguna'
        ],
        // Calauan, Laguna - Food Packaging Craft (delicacy boxes, food packaging) - Native boxes (buri, bamboo)
        'calauan' => [
            'keywords' => ['basket', 'basketry', 'weaving', 'woven', 'rattan', 'bamboo', 'native', 'fiber', 'food packaging', 'delicacy box', 'native box', 'buri box', 'bamboo box', 'packaging craft'],
            'categories' => ['basketry', 'basket weaving', 'rattan/bamboo crafts', 'native fiber crafts', 'packaging craft'],
            'province' => 'laguna'
        ],
        // Siniloan, Laguna - Bamboo Handicrafts (fans, trays, décor, containers)
        'siniloan' => [
            'keywords' => ['basket', 'basketry', 'weaving', 'woven', 'rattan', 'bamboo', 'native', 'fiber', 'abaca', 'bamboo craft', 'home décor', 'fan', 'bamboo fan', 'pasalubong', 'nature park', 'pangil river', 'eco park', 'wooden spoon', 'plant stand', 'mini sculpture', 'eco-souvenir', 'farm', 'nature-inspired', 'bamboo tray', 'bamboo container', 'bamboo décor'],
            'categories' => ['basketry', 'basket weaving', 'rattan/bamboo crafts', 'native fiber crafts', 'abaca crafts', 'bamboo craft', 'eco-friendly handicraft', 'wood craft', 'eco-souvenir'],
            'province' => 'laguna'
        ],
        // San Pedro, Laguna - Known for pottery and ceramics
        'san pedro' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art'],
            'province' => 'laguna'
        ],
        // Kalayaan, Laguna - Known for pottery and ceramics
        'kalayaan' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art'],
            'province' => 'laguna'
        ],
        // Luisiana - Pandan Weaving (bags, bayong, mats, hats)
        'luisiana' => [
            'keywords' => ['textile', 'weaving', 'woven', 'basket', 'basketry', 'fiber', 'pandan', 'pandan leaf', 'pandan bag', 'pandan hat', 'pandan mat', 'native', 'hand-woven pandan', 'pandan product', 'fashion accessory', 'bayong', 'pandan leaves'],
            'categories' => ['textiles', 'weaving', 'basketry', 'basket weaving', 'native fiber crafts', 'natural-fiber weaving'],
            'province' => 'laguna'
        ],
        // Los Baños, Laguna - Water Hyacinth Weaving (bags, baskets, organizers)
        'los baños' => [
            'keywords' => ['water hyacinth', 'water lily', 'hyacinth', 'woven bag', 'organizer', 'home good', 'social enterprise', 'upcycled', 'upcycle', 'craft studio', 'souvenir', 'university', 'tourist', 'dried water lily', 'water lily stalk', 'eco craft'],
            'categories' => ['weaving', 'upcycling', 'home décor', 'accessories', 'upcycled weaving', 'eco craft'],
            'province' => 'laguna'
        ],
        // Cabuyao City, Laguna - Clay Pots & Cement Craft / Embroidery (especially flowers)
        'cabuyao' => [
            'keywords' => ['clay pot', 'garden pot', 'clay planter', 'cement', 'plant stand', 'home décor', 'landscaper', 'garden craft', 'processed food', 'sweet', 'jam', 'preserved food', 'cottage industry', 'clay pots', 'cement craft', 'plant pot', 'jar', 'sculpture', 'embroidery', 'embroidered', 'flower embroidery', 'embroidered flower', 'floral embroidery', 'flower design', 'floral design', 'thread', 'stitch', 'needlework'],
            'categories' => ['pottery', 'cement craft', 'home décor', 'food craft', 'embroidery', 'textiles'],
            'province' => 'laguna'
        ],
        // Nagcarlan, Laguna - Small-scale Handicrafts / Decorative Items
        'nagcarlan' => [
            'keywords' => ['handicraft', 'decorative', 'polymer', 'paper craft', 'textile', 'cottage', 'small-scale', 'decorative item', 'handcrafted home décor'],
            'categories' => ['mixed crafts', 'cottage industries', 'home décor', 'textiles'],
            'province' => 'laguna'
        ],
        // Mabitac, Laguna - Abaca-based Weaving
        'mabitac' => [
            'keywords' => ['abaca', 'abaca bag', 'abaca hat', 'abaca wallet', 'abaca mat', 'natural fiber', 'weaving'],
            'categories' => ['natural-fiber weaving'],
            'province' => 'laguna'
        ],
        // Majayjay, Laguna - Crochet & Handwoven Items / Food delicacies
        'majayjay' => [
            'keywords' => ['crochet', 'handwoven', 'bag', 'table runner', 'textile craft', 'longganisa', 'espasol', 'delicacy', 'culinary'],
            'categories' => ['textile craft', 'culinary crafts'],
            'province' => 'laguna'
        ],
        // Magdalena, Laguna - Wooden Household Items (spoons, bowls, chopping boards) - Local hardwood
        'magdalena' => [
            'keywords' => ['wooden household', 'wooden spoon', 'wooden bowl', 'kitchen item', 'woodcraft', 'chopping board', 'hardwood', 'local hardwood', 'spoon', 'bowl', 'household item'],
            'categories' => ['woodcraft'],
            'province' => 'laguna'
        ],
        // Kalayaan, Laguna - Wooden Household Items
        'kalayaan' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'wooden household', 'wooden spoon', 'wooden bowl', 'kitchen item', 'woodcraft'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'woodcraft'],
            'province' => 'laguna'
        ],
        // Famy, Laguna - Walis Tambo (Soft Broom) - Tiger grass (tambo), bamboo stick
        'famy' => [
            'keywords' => ['walis tambo', 'walis', 'broom', 'broom-making', 'household', 'cleaning', 'tiger grass', 'tambo', 'bamboo stick', 'soft broom', 'household broom'],
            'categories' => ['household craft', 'broom-making'],
            'province' => 'laguna'
        ],
        // Santa Cruz, Laguna (Capital) - Processed Foods, Sweets, and Artisanal Delicacies / Local souvenir makers
        'santa cruz' => [
            'keywords' => ['jewelry', 'jewellery', 'accessory', 'beaded', 'metalwork', 'processed food', 'sweet', 'delicacy', 'artisanal', 'pasalubong', 'souvenir'],
            'categories' => ['jewelry', 'metalwork', 'beaded accessories', 'culinary crafts', 'pasalubong crafts'],
            'province' => 'laguna'
        ],
        // Alaminos, Laguna - Furniture-making (wood & steel)
        'alaminos' => [
            'keywords' => ['furniture', 'wood furniture', 'steel furniture', 'furniture-making', 'cabinet', 'table', 'chair'],
            'categories' => ['furniture craft'],
            'province' => 'laguna'
        ],
        // San Pedro City, Laguna - Digital Printing & Modern Souvenir Products
        'san pedro' => [
            'keywords' => ['pottery', 'ceramic', 'clay', 'pot', 'vase', 'jar', 'earthenware', 'terracotta', 'digital printing', 'modern souvenir', 'graphic merchandise', 'print'],
            'categories' => ['pottery', 'ceramics', 'clay pots', 'ceramic art', 'modern graphic merchandise'],
            'province' => 'laguna'
        ],
    ];

    /**
     * Craft keywords that should be in product names
     */
    private static $craftKeywords = [
        'handmade', 'handcrafted', 'traditional',
        'artisan', 'craft', 'art', 'workshop',
        'custom', 'unique', 'local', 'laguna',
        'carved', 'embroidered', 'woven', 'pottery',
        'ceramic', 'wooden', 'textile', 'jewelry'
    ];

    /**
     * Main validation function
     * 
     * @param array $productData Product data including name, description, category
     * @param array|null $sellerLocation Optional seller location data (city, province)
     * @return array Validation result with auto_approve flag
     */
    public static function validateProduct(array $productData, ?array $sellerLocation = null): array
    {
        $validationResult = [
            'valid' => true,
            'errors' => [],
            'warnings' => [],
            'auto_approve' => false,
            'requires_review' => false,
            'rejection_reason' => null
        ];

        // Extract product information
        $productName = strtolower($productData['productName'] ?? '');
        $description = strtolower($productData['productDescription'] ?? '');
        $category = strtolower($productData['category'] ?? '');
        $combinedText = $productName . ' ' . $description;

        // 1. Check for banned words in product name (strict check)
        $nameBannedCheck = self::checkBannedWords($productName, true);
        if ($nameBannedCheck['found']) {
            $validationResult['valid'] = false;
            $validationResult['errors'][] = 'Product name contains banned words: ' . implode(', ', $nameBannedCheck['words']);
            $validationResult['rejection_reason'] = 'Product name contains prohibited content (drugs, weapons, or offensive language)';
            return $validationResult;
        }

        // 2. Check for banned words in description and combined text
        $profanityCheck = self::checkBannedWords($combinedText, false);
        if ($profanityCheck['found']) {
            $validationResult['valid'] = false;
            $validationResult['errors'][] = 'Product contains inappropriate language: ' . implode(', ', $profanityCheck['words']);
            $validationResult['rejection_reason'] = 'Contains inappropriate or offensive language, drugs, weapons, or prohibited content';
            return $validationResult;
        }

        // 3. Validate category
        if (!self::isValidCategory($category)) {
            $validationResult['valid'] = false;
            $validationResult['errors'][] = 'Invalid category. Product must be a traditional Laguna craft item.';
            $validationResult['rejection_reason'] = 'Category does not match traditional Laguna crafts';
            return $validationResult;
        }

        // 4. Check product name quality
        $nameQuality = self::validateProductName($productName, $category);
        if (!$nameQuality['valid']) {
            $validationResult['valid'] = false;
            $validationResult['errors'] = array_merge($validationResult['errors'], $nameQuality['errors']);
            $validationResult['rejection_reason'] = $nameQuality['errors'][0];
            return $validationResult;
        }
        if (!empty($nameQuality['warnings'])) {
            $validationResult['warnings'] = array_merge($validationResult['warnings'], $nameQuality['warnings']);
        }

        // 5. Check description quality
        $descriptionQuality = self::validateDescription($description, $category);
        if (!$descriptionQuality['valid']) {
            $validationResult['warnings'] = array_merge($validationResult['warnings'], $descriptionQuality['errors']);
            $validationResult['requires_review'] = true;
        }

        // 6. Location-based auto-approval check
        // Check if product matches location-specific craft keywords
        if ($validationResult['valid'] && $sellerLocation) {
            $locationMatch = self::checkLocationBasedAutoApprove($combinedText, $category, $sellerLocation);
            if ($locationMatch['match']) {
                $validationResult['auto_approve'] = true;
                Log::info('Product auto-approved based on location match', [
                    'location' => $locationMatch['location'],
                    'matched_keywords' => $locationMatch['matched_keywords'],
                    'category' => $category
                ]);
            }
        }

        // 7. General auto-approval criteria (if not already auto-approved)
        // Product can be auto-approved if it passes all checks and has high quality indicators
        if ($validationResult['valid'] && !$validationResult['auto_approve'] && empty($validationResult['warnings'])) {
            $qualityScore = self::calculateQualityScore($productName, $description, $category);
            if ($qualityScore >= 0.8) {
                $validationResult['auto_approve'] = true;
            } else {
                $validationResult['requires_review'] = true;
            }
        }

        // Log validation results
        Log::info('Product validation completed', [
            'product_name' => $productName,
            'valid' => $validationResult['valid'],
            'auto_approve' => $validationResult['auto_approve'],
            'requires_review' => $validationResult['requires_review'],
            'errors' => count($validationResult['errors']),
            'warnings' => count($validationResult['warnings'])
        ]);

        return $validationResult;
    }

    /**
     * Check for banned words (drugs, weapons, offensive content)
     * 
     * @param string $text Text to check
     * @param bool $strict If true, uses word boundaries for exact matches (for product names)
     * @return array Result with found flag and matched words
     */
    private static function checkBannedWords(string $text, bool $strict = false): array
    {
        $foundWords = [];
        $lowerText = strtolower(trim($text));

        if (empty($lowerText)) {
            return [
                'found' => false,
                'words' => []
            ];
        }

        foreach (self::$bannedWords as $word) {
            $wordLower = strtolower($word);
            
            if ($strict) {
                // For product names, use word boundaries for exact matches
                // This prevents false positives (e.g., "sculpture" containing "sculpt")
                $pattern = '/\b' . preg_quote($wordLower, '/') . '\b/i';
                if (preg_match($pattern, $lowerText)) {
                    $foundWords[] = $word;
                }
            } else {
                // For descriptions, use substring matching (less strict)
                if (strpos($lowerText, $wordLower) !== false) {
                    $foundWords[] = $word;
                }
            }
        }

        return [
            'found' => !empty($foundWords),
            'words' => array_unique($foundWords)
        ];
    }

    /**
     * Validate if category is valid for Laguna crafts
     */
    private static function isValidCategory(string $category): bool
    {
        // Check exact match
        if (in_array($category, self::$validLagunaCategories)) {
            return true;
        }

        // Check partial match (handles variations like "Wood Carving" vs "woodcarving")
        foreach (self::$validLagunaCategories as $validCategory) {
            if (strpos($category, $validCategory) !== false || strpos($validCategory, $category) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate product name quality
     */
    private static function validateProductName(string $name, string $category): array
    {
        $result = [
            'valid' => true,
            'errors' => [],
            'warnings' => []
        ];

        // Check minimum length
        if (strlen($name) < 5) {
            $result['valid'] = false;
            $result['errors'][] = 'Product name is too short. Please provide a more descriptive name.';
        }

        // Check maximum length
        if (strlen($name) > 100) {
            $result['warnings'][] = 'Product name is very long. Consider making it more concise.';
        }

        // Check if it contains craft keywords
        $hasCraftKeyword = false;
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name, $keyword) !== false) {
                $hasCraftKeyword = true;
                break;
            }
        }

        // Check if it's related to category
        $categoryRelated = false;
        foreach (self::$validLagunaCategories as $validCategory) {
            if (strpos($name, $validCategory) !== false || strpos($category, $validCategory) !== false) {
                $categoryRelated = true;
                break;
            }
        }

        // Warning if no craft keywords and not strongly category-related
        if (!$hasCraftKeyword && !$categoryRelated) {
            $result['warnings'][] = 'Product name should better describe the craft nature of the item.';
        }

        // Check for generic or vague names
        $genericNames = ['item', 'product', 'thing', 'object', 'stuff', 'goods', 'product1', 'test'];
        if (in_array($name, $genericNames)) {
            $result['valid'] = false;
            $result['errors'][] = 'Product name is too generic. Please provide a specific descriptive name.';
        }

        return $result;
    }

    /**
     * Validate product description quality
     */
    private static function validateDescription(string $description, string $category): array
    {
        $result = [
            'valid' => true,
            'errors' => []
        ];

        if (empty($description)) {
            $result['valid'] = false;
            $result['errors'][] = 'Product description is required';
            return $result;
        }

        // Check minimum length
        if (strlen($description) < 20) {
            $result['valid'] = false;
            $result['errors'][] = 'Product description is too short. Please provide more details.';
        }

        // Check if description is meaningful (not just repetitive)
        $wordCount = str_word_count($description);
        if ($wordCount < 10) {
            $result['valid'] = false;
            $result['errors'][] = 'Description needs more detail about the product.';
        }

        return $result;
    }

    /**
     * Calculate quality score for auto-approval decision
     */
    private static function calculateQualityScore(string $name, string $description, string $category): float
    {
        $score = 0.0;

        // Name quality (30%)
        $nameScore = 0;
        if (strlen($name) >= 10 && strlen($name) <= 80) $nameScore += 0.1;
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name, $keyword) !== false) {
                $nameScore += 0.1;
                break;
            }
        }
        $score += min($nameScore, 0.3);

        // Description quality (40%)
        $descScore = 0;
        $descLength = strlen($description);
        if ($descLength >= 50) $descScore += 0.15;
        if ($descLength >= 100) $descScore += 0.15;
        
        $wordCount = str_word_count($description);
        if ($wordCount >= 15) $descScore += 0.1;
        $score += min($descScore, 0.4);

        // Category relevance (20%)
        if (self::isValidCategory($category)) $score += 0.2;

        // Craft specificity (10%)
        foreach (self::$craftKeywords as $keyword) {
            if (strpos($name . ' ' . $description, $keyword) !== false) {
                $score += 0.05;
            }
        }

        return min($score, 1.0);
    }

    /**
     * Get suggestion for improving product listing
     */
    public static function getImprovementSuggestion(array $validationResult): array
    {
        $suggestions = [];

        if (!empty($validationResult['errors'])) {
            $suggestions[] = [
                'type' => 'error',
                'message' => 'Critical issues found. Please address these errors.',
                'details' => $validationResult['errors']
            ];
        }

        if (!empty($validationResult['warnings'])) {
            $suggestions[] = [
                'type' => 'warning',
                'message' => 'Improvements recommended for better product visibility.',
                'details' => $validationResult['warnings']
            ];
        }

        if (empty($suggestions)) {
            $suggestions[] = [
                'type' => 'success',
                'message' => 'Product meets all quality standards!'
            ];
        }

        return $suggestions;
    }

    /**
     * Check if product should be auto-approved based on location and craft keywords
     * 
     * @param string $combinedText Product name and description combined
     * @param string $category Product category
     * @param array $sellerLocation Seller location data (city, province)
     * @return array Match result with location and matched keywords
     */
    private static function checkLocationBasedAutoApprove(string $combinedText, string $category, array $sellerLocation): array
    {
        $city = strtolower(trim($sellerLocation['city'] ?? ''));
        $province = strtolower(trim($sellerLocation['province'] ?? ''));

        // Normalize city name variations (e.g., "los banos" vs "los baños")
        $cityNormalized = str_replace(['ñ', 'Ñ'], 'n', $city);
        $cityNormalized = str_replace(['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú'], ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u'], $cityNormalized);

        // Check if location matches any known craft location
        foreach (self::$locationCraftKeywords as $location => $locationData) {
            // Normalize location name for comparison
            $locationNormalized = str_replace(['ñ', 'Ñ'], 'n', $location);
            $locationNormalized = str_replace(['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú'], ['a', 'e', 'i', 'o', 'u', 'a', 'e', 'i', 'o', 'u'], $locationNormalized);
            
            // Check if seller's city matches this location
            $cityMatches = !empty($city) && (
                strpos($city, $location) !== false || 
                strpos($location, $city) !== false ||
                strpos($cityNormalized, $locationNormalized) !== false ||
                strpos($locationNormalized, $cityNormalized) !== false
            );

            // Check if province matches
            $provinceMatches = !empty($province) && (
                strpos($province, $locationData['province']) !== false ||
                strpos($locationData['province'], $province) !== false
            );

            if ($cityMatches || $provinceMatches) {
                // Check if product name/description contains location-specific keywords
                $matchedKeywords = [];
                foreach ($locationData['keywords'] as $keyword) {
                    if (strpos($combinedText, strtolower($keyword)) !== false) {
                        $matchedKeywords[] = $keyword;
                    }
                }

                // Check if category matches location's traditional categories
                $categoryMatches = false;
                foreach ($locationData['categories'] as $locationCategory) {
                    if (strpos($category, strtolower($locationCategory)) !== false ||
                        strpos(strtolower($locationCategory), $category) !== false) {
                        $categoryMatches = true;
                        break;
                    }
                }

                // Auto-approve if:
                // 1. At least one keyword matches in name/description, AND
                // 2. Category matches location's traditional craft categories
                if (!empty($matchedKeywords) && $categoryMatches) {
                    return [
                        'match' => true,
                        'location' => $location,
                        'matched_keywords' => $matchedKeywords,
                        'category_match' => true
                    ];
                }
            }
        }

        return [
            'match' => false,
            'location' => null,
            'matched_keywords' => []
        ];
    }
}

