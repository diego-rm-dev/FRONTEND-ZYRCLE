
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleDollarSign } from "lucide-react";

const Marketplace = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="bg-eco-forest-light/10 py-4 px-4 md:px-6">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" asChild>
                                <a href="/" className="flex items-center">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </a>
                            </Button>
                            <h1 className="text-xl font-semibold">ZYRCLE Marketplace</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                                <CircleDollarSign className="h-4 w-4 text-eco-token mr-2" />
                                <span className="text-sm font-medium">245.8 ZYRCLE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <main className="flex-grow bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <Tabs defaultValue="all">
                        <div className="mb-6">
                            <TabsList className="bg-white p-1 shadow-sm border border-gray-100">
                                <TabsTrigger value="all">All Products</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="m-0">
                            <ProductGrid />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Marketplace;
