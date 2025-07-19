import { Truck } from "lucide-react";
import Image from "next/image";

interface Product {
  image: string;
  name: string;
  description: string;
  price: string;
  deliveryTime: string;
  tag: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-40">
        <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-600">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4 h-10">{product.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-700">
          <div className="flex justify-center items-center gap-1">
            <Truck className="w-4 h-4" /><span className="font-bold">{product.price}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{product.deliveryTime}</span>
          </div>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{product.tag}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
