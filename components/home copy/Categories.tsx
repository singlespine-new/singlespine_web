'use client'

import { useState } from 'react'
import ProductCard, { Product } from '@/components/ui/ProductCard copy'

// Mock data that reflects the new, more detailed Product interface
const categoriesData: { title: string; products: Product[] }[] = [
  {
    title: "Chocolates and cakes",
    products: [
      {
        id: "cake_1",
        slug: "new",
        image: "/images/cake_1.png",
        name: "Intense dark chocolate",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "cake_2",
        slug: "new2",
        image: "/images/cake_2.png",
        name: "Cakes & Gardens - Legon",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "45-50 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "cake_3",
        slug: "new3",
        image: "/images/cake_3.png",
        name: "Intense dark chocolate",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ],
  },
  {
    title: "Flowers and floral",
    products: [
      {
        id: "flora_1",
        slug: "flora_1",
        image: "/images/flower_1.png",
        name: "Flowers Ghana - Madina",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "flora_2",
        slug: "flora_2",
        image: "/images/flower_2.png",
        name: "Flowers Ghana - Haatso",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "flora_3",
        slug: "flora_3",
        image: "/images/flower_3.png",
        name: "Nene's Flora - Adenta",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ]
  },
  {
    title: "Restaurants",
    products: [
      {
        id: "reast_1",
        slug: "reast_1",
        image: "/images/bioko_1.png",
        name: "Choppers Inn - Adenta down",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "reast_2",
        slug: "reast_2",
        image: "/images/bioko_2.png",
        name: "NsuomNam - Cantoments",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "reast_3",
        slug: "reast_3",
        image: "/images/bioko_3.png",
        name: "DziDzi - Ashaley Botwe",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "reast_4",
        slug: "reast_4",
        image: "/images/bioko_4.png",
        name: "Choppers Inn - Circle",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "reast_5",
        slug: "reast_5",
        image: "/images/bioko_2.png",
        name: "Choppers Inn - Circle",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
      {
        id: "reast_6",
        slug: "reast_6",
        image: "/images/bioko_4.png",
        name: "NsuomNam - Adenta Commandos",
        description: "Zesty mint and rich cocoa makes this bar inviting",
        price: 3.40,
        deliveryTime: "30-40 min",
        tag: "Bioko Treats - Osu",
      },
    ]
  }
];


const Categories = () => {
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set(['choco-1', 'food-2']));

  const handleToggleFavorite = (id: string | number) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {categoriesData.map((category) => (
        <section key={category.title} aria-labelledby={`category-${category.title.replace(/\s+/g, '-').toLowerCase()}`}>
          <h2
            id={`category-${category.title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-3xl font-bold tracking-tight text-foreground mb-6"
          >
            {category.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-6 gap-y-8">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  isFavorite: favorites.has(product.id)
                }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default Categories;
