import ProductCard from "../ui/ProductCard";



const categoriesData = [
  {
    title: "Chocolates & Cakes",
    products: [
      {
        image: "/images/cake_1.png",
        name: "Intense dark chocolate",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/cake_2.png",
        name: "Cakes & Gardens - Legon",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "45-50 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/cake_3.png",
        name: "Intense dark chocolate",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ],
  },
  {
    title: "Flowers & Floral",
    products: [
      {
        image: "/images/flower_1.png",
        name: "Flowers Ghana - Madina",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/flower_2.png",
        name: "Flowers Ghana - Haatso",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/flower_3.png",
        name: "Nene's Flora - Adenta",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ]
  },
  {
    title: "Restaurants",
    products: [
      {
        image: "/images/bioko_1.png",
        name: "Choppers Inn - Adenta down",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/bioko_2.png",
        name: "NsuomNam - Cantoments",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/bioko_3.png",
        name: "DziDzi - Ashaley Botwe",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/bioko_4.png",
        name: "Choppers Inn - Circle",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/bioko_2.png",
        name: "Choppers Inn - Circle",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        image: "/images/bioko_4.png",
        name: "NsuomNam - Adenta Commandos",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: "€3.40",
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ]
  }
];



const Categories = () => {
  return (
    <div className="p-4 bg-gray-50 flex flex-col space-y-2">
      {categoriesData.map((category) => (
        <div key={category.title} className="mb-16">
          <h3 className="text-3xl font-bold mb-4 ml-2">{category.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((product, index) => (
              <ProductCard key={`${category.title}-${index}`} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Categories;
