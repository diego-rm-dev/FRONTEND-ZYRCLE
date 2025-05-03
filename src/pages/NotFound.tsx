import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, Recycle } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center bg-eco-forest-light/10 px-4">
                <div className="bg-white shadow-md rounded-2xl p-10 text-center max-w-md flex flex-col items-center">
                    <Recycle className="text-eco-forest w-12 h-12 mb-4 opacity-70" />
                    <motion.h1
                        className="text-6xl font-extrabold text-eco-forest mb-4"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                        }}
                    >
                        404
                    </motion.h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Oops! This page got lost in the recycling bin.
                    </p>
                    <Button asChild variant="default" className="gap-2">
                        <a href="/">
                            <ArrowLeftCircle className="h-5 w-5" />
                            Back to Home
                        </a>
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
