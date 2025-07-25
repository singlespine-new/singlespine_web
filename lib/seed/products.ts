import { PrismaClient, ProductAvailability } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// African-inspired product categories and data
export const AFRICAN_PRODUCTS = [
  // Food & Beverages
  {
    name: "Premium Ghanaian Cocoa Powder",
    slug: "premium-ghanaian-cocoa-powder",
    description: "Rich, dark cocoa powder sourced directly from the finest cocoa farms in Ghana's Western Region. Perfect for making traditional hot chocolate, baking, or adding to smoothies. This premium cocoa retains its natural flavor and nutritional benefits.",
    shortDescription: "Authentic Ghanaian cocoa powder with rich, natural flavor",
    price: 45.00,
    comparePrice: 55.00,
    images: [
      "/products/cocoa-powder-1.jpg",
      "/products/cocoa-powder-2.jpg"
    ],
    category: "food-beverages",
    subcategory: "beverages",
    tags: ["cocoa", "ghanaian", "premium", "organic", "traditional"],
    isFeatured: true,
    stock: 50,
    weight: 0.5,
    origin: "Ghana",
    vendor: "Kuapa Kokoo Cooperative",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Authentic Shea Butter (Raw)",
    slug: "authentic-raw-shea-butter",
    description: "Pure, unrefined shea butter from Northern Ghana. Hand-processed by women's cooperatives using traditional methods passed down through generations. Rich in vitamins A, E, and F, perfect for skincare and hair care.",
    shortDescription: "Pure, unrefined shea butter from Northern Ghana",
    price: 35.00,
    comparePrice: 45.00,
    images: [
      "/products/shea-butter-1.jpg",
      "/products/shea-butter-2.jpg",
      "/products/shea-butter-3.jpg"
    ],
    category: "health-beauty",
    subcategory: "skincare",
    tags: ["shea butter", "natural", "skincare", "ghana", "organic"],
    isFeatured: true,
    stock: 75,
    weight: 0.25,
    origin: "Ghana",
    vendor: "Northern Women's Shea Cooperative",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Kente Cloth Table Runner",
    slug: "kente-cloth-table-runner",
    description: "Handwoven Kente cloth table runner featuring traditional Akan symbols and vibrant colors. Each piece tells a story through its patterns - this design represents wisdom, creativity, and life's precious nature. Perfect for special occasions or daily elegance.",
    shortDescription: "Handwoven Kente table runner with traditional Akan symbols",
    price: 120.00,
    comparePrice: 150.00,
    images: [
      "/products/kente-runner-1.jpg",
      "/products/kente-runner-2.jpg"
    ],
    category: "home-living",
    subcategory: "textiles",
    tags: ["kente", "handwoven", "traditional", "akan", "home decor"],
    isFeatured: true,
    stock: 25,
    weight: 0.3,
    origin: "Ghana",
    vendor: "Bonwire Kente Weavers",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "African Black Soap (Dudu Osun)",
    slug: "african-black-soap-dudu-osun",
    description: "Traditional African black soap made with natural ingredients including plantain peel, palm kernel oil, cocoa pods, and shea butter. Known for its cleansing and moisturizing properties, suitable for all skin types.",
    shortDescription: "Traditional African black soap with natural ingredients",
    price: 18.00,
    comparePrice: 25.00,
    images: [
      "/products/black-soap-1.jpg",
      "/products/black-soap-2.jpg"
    ],
    category: "health-beauty",
    subcategory: "skincare",
    tags: ["black soap", "natural", "traditional", "skincare", "dudu osun"],
    isFeatured: false,
    stock: 100,
    weight: 0.15,
    origin: "Nigeria",
    vendor: "Tropical Naturals",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Adinkra Symbol Wall Art Set",
    slug: "adinkra-symbol-wall-art-set",
    description: "Beautiful set of 6 wooden wall art pieces featuring popular Adinkra symbols from Ghana. Each symbol carries deep meaning - Gye Nyame (supremacy of God), Sankofa (learning from the past), and more. Hand-carved and finished with natural oils.",
    shortDescription: "Set of 6 hand-carved Adinkra symbol wall art pieces",
    price: 85.00,
    comparePrice: 110.00,
    images: [
      "/products/adinkra-art-1.jpg",
      "/products/adinkra-art-2.jpg",
      "/products/adinkra-art-3.jpg"
    ],
    category: "crafts-art",
    subcategory: "wall art",
    tags: ["adinkra", "symbols", "wall art", "wooden", "handcarved", "ghana"],
    isFeatured: false,
    stock: 30,
    weight: 1.2,
    origin: "Ghana",
    vendor: "Kumase Craft Collective",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Moringa Leaf Powder (Organic)",
    slug: "organic-moringa-leaf-powder",
    description: "Nutrient-rich moringa leaf powder from the 'miracle tree'. Packed with vitamins, minerals, and antioxidants. Can be added to smoothies, teas, or meals. Sustainably harvested from small farms in Northern Ghana.",
    shortDescription: "Nutrient-rich organic moringa leaf powder",
    price: 32.00,
    comparePrice: 40.00,
    images: [
      "/products/moringa-powder-1.jpg",
      "/products/moringa-powder-2.jpg"
    ],
    category: "health-beauty",
    subcategory: "supplements",
    tags: ["moringa", "organic", "superfood", "health", "powder"],
    isFeatured: false,
    stock: 60,
    weight: 0.3,
    origin: "Ghana",
    vendor: "Moringa Ghana Ltd",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Ankara Print Face Masks (3-Pack)",
    slug: "ankara-print-face-masks-3pack",
    description: "Stylish and comfortable face masks made with authentic Ankara fabric. Set includes 3 different vibrant patterns. Reusable, washable, and features adjustable ear loops. Show your African pride while staying protected.",
    shortDescription: "Stylish Ankara fabric face masks, 3-pack with vibrant patterns",
    price: 22.00,
    comparePrice: 30.00,
    images: [
      "/products/ankara-masks-1.jpg",
      "/products/ankara-masks-2.jpg"
    ],
    category: "clothing-accessories",
    subcategory: "accessories",
    tags: ["ankara", "face masks", "african print", "fashion", "protective"],
    isFeatured: false,
    stock: 80,
    weight: 0.1,
    origin: "Ghana",
    vendor: "Accra Fashion House",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Baobab Fruit Powder",
    slug: "baobab-fruit-powder",
    description: "Tangy, vitamin C-rich baobab fruit powder from the iconic African baobab tree. Perfect for smoothies, yogurt, or baking. Known as the 'Tree of Life', baobab fruit is packed with antioxidants and fiber.",
    shortDescription: "Vitamin C-rich baobab fruit powder from the Tree of Life",
    price: 38.00,
    comparePrice: 48.00,
    images: [
      "/products/baobab-powder-1.jpg",
      "/products/baobab-powder-2.jpg"
    ],
    category: "food-beverages",
    subcategory: "supplements",
    tags: ["baobab", "superfood", "vitamin c", "antioxidants", "tree of life"],
    isFeatured: false,
    stock: 40,
    weight: 0.25,
    origin: "South Africa",
    vendor: "Baobab Harvest Co-op",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Carved Wooden Elephant Family",
    slug: "carved-wooden-elephant-family",
    description: "Beautiful hand-carved wooden elephant family (set of 3) made from sustainable hardwood. Represents wisdom, strength, and family bonds in African culture. Perfect decorative piece for home or office.",
    shortDescription: "Hand-carved wooden elephant family set of 3 pieces",
    price: 65.00,
    comparePrice: 80.00,
    images: [
      "/products/elephant-carving-1.jpg",
      "/products/elephant-carving-2.jpg"
    ],
    category: "crafts-art",
    subcategory: "sculptures",
    tags: ["wooden", "carved", "elephant", "family", "african art", "decor"],
    isFeatured: true,
    stock: 35,
    weight: 0.8,
    origin: "Kenya",
    vendor: "Maasai Carvers Collective",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Ethiopian Coffee Beans (Single Origin)",
    slug: "ethiopian-coffee-beans-single-origin",
    description: "Premium single-origin coffee beans from the birthplace of coffee - Ethiopia. Medium roast with floral notes and bright acidity. Sourced directly from small farmers in the Sidamo region. Fair trade certified.",
    shortDescription: "Premium Ethiopian single-origin coffee with floral notes",
    price: 28.00,
    comparePrice: 35.00,
    images: [
      "/products/ethiopian-coffee-1.jpg",
      "/products/ethiopian-coffee-2.jpg"
    ],
    category: "food-beverages",
    subcategory: "beverages",
    tags: ["coffee", "ethiopian", "single origin", "fair trade", "premium"],
    isFeatured: false,
    stock: 55,
    weight: 0.45,
    origin: "Ethiopia",
    vendor: "Sidamo Coffee Farmers Union",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Mud Cloth Throw Pillow Covers (Set of 2)",
    slug: "mud-cloth-throw-pillow-covers-set",
    description: "Authentic mud cloth (Bògòlanfini) pillow covers from Mali. Traditional geometric patterns hand-painted with fermented mud on cotton fabric. Each piece is unique and tells a story through its symbols.",
    shortDescription: "Authentic mud cloth pillow covers with traditional patterns",
    price: 55.00,
    comparePrice: 70.00,
    images: [
      "/products/mud-cloth-pillows-1.jpg",
      "/products/mud-cloth-pillows-2.jpg"
    ],
    category: "home-living",
    subcategory: "textiles",
    tags: ["mud cloth", "bogolan", "pillow covers", "traditional", "mali", "geometric"],
    isFeatured: false,
    stock: 45,
    weight: 0.4,
    origin: "Mali",
    vendor: "Bamako Textile Artisans",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "African Healing Tea Blend",
    slug: "african-healing-tea-blend",
    description: "Traditional herbal tea blend featuring African potato, honeybush, rooibos, and other indigenous herbs. Known for its healing properties and rich, earthy flavor. Caffeine-free and naturally sweet.",
    shortDescription: "Traditional African herbal tea blend with healing properties",
    price: 24.00,
    comparePrice: 32.00,
    images: [
      "/products/healing-tea-1.jpg",
      "/products/healing-tea-2.jpg"
    ],
    category: "food-beverages",
    subcategory: "beverages",
    tags: ["herbal tea", "healing", "traditional", "caffeine free", "rooibos"],
    isFeatured: false,
    stock: 70,
    weight: 0.2,
    origin: "South Africa",
    vendor: "Cape Town Herbals",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Handwoven Grass Basket with Lid",
    slug: "handwoven-grass-basket-with-lid",
    description: "Beautiful handwoven grass basket with fitted lid, perfect for storage or decoration. Made by skilled artisans using traditional weaving techniques. Natural grass color with geometric patterns in black and brown.",
    shortDescription: "Handwoven grass storage basket with traditional patterns",
    price: 42.00,
    comparePrice: 55.00,
    images: [
      "/products/grass-basket-1.jpg",
      "/products/grass-basket-2.jpg"
    ],
    category: "home-living",
    subcategory: "storage",
    tags: ["basket", "handwoven", "grass", "storage", "traditional", "artisan"],
    isFeatured: false,
    stock: 25,
    weight: 0.6,
    origin: "Ghana",
    vendor: "Northern Ghana Weavers",
    availability: ProductAvailability.LOW_STOCK
  },
  {
    name: "Cowrie Shell Jewelry Set",
    slug: "cowrie-shell-jewelry-set",
    description: "Elegant jewelry set featuring natural cowrie shells - includes necklace, bracelet, and earrings. Cowrie shells symbolize prosperity and protection in African culture. Adjustable sizing with natural cotton cord.",
    shortDescription: "Elegant cowrie shell jewelry set - necklace, bracelet, earrings",
    price: 48.00,
    comparePrice: 65.00,
    images: [
      "/products/cowrie-jewelry-1.jpg",
      "/products/cowrie-jewelry-2.jpg"
    ],
    category: "jewelry",
    subcategory: "sets",
    tags: ["cowrie shells", "jewelry", "natural", "prosperity", "traditional", "set"],
    isFeatured: true,
    stock: 30,
    weight: 0.15,
    origin: "Ghana",
    vendor: "Coastal Craft Collective",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "African Print Tote Bag",
    slug: "african-print-tote-bag",
    description: "Spacious tote bag made with vibrant African wax print fabric. Features strong handles and internal pocket. Perfect for shopping, beach trips, or daily use. Machine washable and eco-friendly alternative to plastic bags.",
    shortDescription: "Vibrant African print tote bag with strong handles",
    price: 26.00,
    comparePrice: 35.00,
    images: [
      "/products/african-tote-1.jpg",
      "/products/african-tote-2.jpg"
    ],
    category: "clothing-accessories",
    subcategory: "bags",
    tags: ["tote bag", "african print", "wax print", "eco friendly", "shopping"],
    isFeatured: false,
    stock: 60,
    weight: 0.3,
    origin: "Ghana",
    vendor: "Accra Fashion House",
    availability: ProductAvailability.IN_STOCK
  },
  {
    name: "Djembe Drum (Small)",
    slug: "djembe-drum-small",
    description: "Authentic djembe drum hand-carved from a single piece of hardwood with genuine goatskin head. Produces rich, resonant tones perfect for rhythm practice or ceremonial use. Includes basic playing guide.",
    shortDescription: "Authentic hand-carved djembe drum with goatskin head",
    price: 95.00,
    comparePrice: 120.00,
    images: [
      "/products/djembe-drum-1.jpg",
      "/products/djembe-drum-2.jpg"
    ],
    category: "books-media",
    subcategory: "musical instruments",
    tags: ["djembe", "drum", "musical instrument", "handcarved", "traditional", "goatskin"],
    isFeatured: false,
    stock: 20,
    weight: 2.5,
    origin: "Mali",
    vendor: "Bamako Music Crafters",
    availability: ProductAvailability.IN_STOCK
  }
]

// Product variants for some items
export const PRODUCT_VARIANTS = [
  // Shea Butter variants
  {
    productSlug: "authentic-raw-shea-butter",
    variants: [
      { name: "Size", value: "100g", price: 0, stock: 75 },
      { name: "Size", value: "250g", price: 15, stock: 50 },
      { name: "Size", value: "500g", price: 25, stock: 30 }
    ]
  },
  // African Black Soap variants
  {
    productSlug: "african-black-soap-dudu-osun",
    variants: [
      { name: "Pack Size", value: "Single Bar", price: 0, stock: 100 },
      { name: "Pack Size", value: "3-Pack", price: 35, stock: 40 },
      { name: "Pack Size", value: "6-Pack", price: 65, stock: 25 }
    ]
  },
  // Coffee variants
  {
    productSlug: "ethiopian-coffee-beans-single-origin",
    variants: [
      { name: "Grind", value: "Whole Bean", price: 0, stock: 55 },
      { name: "Grind", value: "Coarse", price: 0, stock: 35 },
      { name: "Grind", value: "Medium", price: 0, stock: 40 },
      { name: "Grind", value: "Fine", price: 0, stock: 30 }
    ]
  }
]

// Admin user data
export const ADMIN_USER = {
  name: "Admin User",
  email: process.env.ADMIN_EMAIL || "admin@singlespine.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  role: "ADMIN" as const
}

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_USER.email }
    })

    let adminUser
    if (existingAdmin) {
      adminUser = existingAdmin
      console.log('👤 Admin user already exists:', adminUser.email)
    } else {
      adminUser = await prisma.user.create({
        data: {
          name: ADMIN_USER.name,
          email: ADMIN_USER.email,
          password: hashedPassword,
          role: ADMIN_USER.role
        }
      })
      console.log('👤 Admin user created:', adminUser.email)
    }

    // Create products
    console.log('📦 Creating products...')

    for (const productData of AFRICAN_PRODUCTS) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productData.slug }
      })

      let product
      if (existingProduct) {
        product = await prisma.product.update({
          where: { slug: productData.slug },
          data: productData
        })
        console.log(`✅ Updated product: ${product.name}`)
      } else {
        product = await prisma.product.create({
          data: productData
        })
        console.log(`✅ Created product: ${product.name}`)
      }

      // Add variants if they exist
      const productVariants = PRODUCT_VARIANTS.find(pv => pv.productSlug === productData.slug)
      if (productVariants) {
        for (const variant of productVariants.variants) {
          const sku = `${productData.slug}-${variant.name.toLowerCase()}-${variant.value.toLowerCase().replace(/\s+/g, '-')}`

          const existingVariant = await prisma.productVariant.findUnique({
            where: { sku }
          })

          if (existingVariant) {
            await prisma.productVariant.update({
              where: { sku },
              data: {
                name: variant.name,
                value: variant.value,
                price: variant.price,
                stock: variant.stock
              }
            })
          } else {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                name: variant.name,
                value: variant.value,
                price: variant.price,
                stock: variant.stock,
                sku
              }
            })
          }
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Created ${AFRICAN_PRODUCTS.length} products`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}
