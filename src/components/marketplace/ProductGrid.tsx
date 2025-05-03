
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, Search, FilterX, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data for eco-friendly products
const mockProducts = [
    {
        id: 1,
        name: "Bamboo Compost Bin",
        description: "Eco-friendly compost bin made from sustainable bamboo.",
        price: 42,
        image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
        category: "Home",
        rating: 4.5,
        inStock: true,
        carbonOffset: 3.2,
    },
    {
        id: 2,
        name: "Recycled Plastic Planter",
        description: "Beautiful planter made from 100% recycled plastic.",
        price: 28,
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
        category: "Garden",
        rating: 4.2,
        inStock: true,
        carbonOffset: 2.5,
    },
    {
        id: 3,
        name: "Biodegradable Phone Case",
        description: "Protect your phone with this 100% biodegradable case.",
        price: 35,
        image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
        category: "Tech",
        rating: 3.8,
        inStock: true,
        carbonOffset: 1.8,
    },
    {
        id: 4,
        name: "Hemp Grocery Bags",
        description: "Set of 3 durable grocery bags made from organic hemp.",
        price: 18,
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        category: "Lifestyle",
        rating: 4.7,
        inStock: true,
        carbonOffset: 2.1,
    },
    {
        id: 5,
        name: "Solar-Powered Charger",
        description: "Charge your devices with clean energy from the sun.",
        price: 65,
        image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
        category: "Tech",
        rating: 4.0,
        inStock: true,
        carbonOffset: 4.2,
    },
    {
        id: 6,
        name: "Recycled Paper Notebook",
        description: "Premium notebook made from 100% recycled paper.",
        price: 12,
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
        category: "Stationery",
        rating: 4.3,
        inStock: false,
        carbonOffset: 1.5,
    },
];

export function ProductGrid() {
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState([0, 100]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sort, setSort] = useState("popular");
    const [cart, setCart] = useState<{ id: number, quantity: number }[]>([]);

    const filteredProducts = mockProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

        return matchesSearch && matchesPrice && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sort === "price-low") return a.price - b.price;
        if (sort === "price-high") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        // Default is "popular"
        return b.rating - a.rating;
    });

    const addToCart = (productId: number) => {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            setCart(cart.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { id: productId, quantity: 1 }]);
        }
    };

    const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

    const clearFilters = () => {
        setSearchQuery("");
        setPriceRange([0, 100]);
        setSelectedCategories([]);
        setSort("popular");
    };

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const categories = Array.from(new Set(mockProducts.map(product => product.category)));

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-eco-forest/40" />
                    <Input
                        placeholder="Search eco-friendly products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">Filters</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Filter Products</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div>
                                    <h4 className="font-medium mb-3">Price Range</h4>
                                    <div className="px-2">
                                        <Slider
                                            value={priceRange}
                                            min={0}
                                            max={100}
                                            step={1}
                                            onValueChange={setPriceRange}
                                        />
                                        <div className="flex justify-between mt-2 text-sm text-eco-forest/60">
                                            <span>{priceRange[0]} ZYRCLE</span>
                                            <span>{priceRange[1]} ZYRCLE</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-3">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <div key={category} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category}`}
                                                    checked={selectedCategories.includes(category)}
                                                    onCheckedChange={() => toggleCategory(category)}
                                                />
                                                <Label htmlFor={`category-${category}`}>{category}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4 border-t">
                                    <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                                        <FilterX className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                    <Button>Apply Filters</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {(searchQuery || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100) && (
                        <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                            <FilterX className="h-4 w-4" />
                            <span className="hidden sm:inline">Clear</span>
                        </Button>
                    )}
                </div>
            </div>

            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                        <Badge key={category} variant="outline" className="px-3 py-1 rounded-full">
                            {category}
                            <button
                                className="ml-2 text-eco-forest/60 hover:text-eco-forest"
                                onClick={() => toggleCategory(category)}
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <div className="relative aspect-square overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                            />
                            {!product.inStock && (
                                <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                                    <Badge variant="outline" className="text-white border-white">
                                        Out of Stock
                                    </Badge>
                                </div>
                            )}
                            <Badge className="absolute top-3 right-3 bg-eco-emerald">
                                -{product.carbonOffset} kg CO₂
                            </Badge>
                        </div>
                        <CardHeader className="p-4 pb-0">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg text-eco-forest">{product.name}</h3>
                                <p className="text-sm text-eco-forest/70 line-clamp-2">{product.description}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <CircleDollarSign className="h-5 w-5 mr-1 text-eco-token" />
                                    <span className="font-bold text-lg text-eco-forest">{product.price}</span>
                                    <span className="text-eco-forest/60 ml-1 text-sm">ZYRCLE</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-xs text-eco-forest/60 ml-1">
                                        {product.rating}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button
                                className="w-full bg-eco-forest hover:bg-eco-forest-dark"
                                onClick={() => addToCart(product.id)}
                                disabled={!product.inStock}
                            >
                                {product.inStock ? "Add to Cart" : "Notify When Available"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {sortedProducts.length === 0 && (
                <div className="text-center py-20">
                    <div className="bg-eco-forest/5 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                        <Search className="h-8 w-8 text-eco-forest/40" />
                    </div>
                    <h3 className="text-xl font-semibold text-eco-forest mb-2">No products found</h3>
                    <p className="text-eco-forest/60 max-w-md mx-auto">
                        We couldn't find any products matching your criteria. Try clearing some filters or changing your search query.
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Floating cart indicator */}
            {totalCartItems > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button className="bg-eco-forest text-white rounded-full p-4 shadow-lg flex items-center space-x-2">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="absolute -top-2 -right-2 bg-eco-emerald text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {totalCartItems}
                            </span>
                        </div>
                        <span>View Cart</span>
                    </button>
                </div>
            )}
        </div>
    );
}
