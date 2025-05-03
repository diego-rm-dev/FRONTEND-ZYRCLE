
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";


export function Hero() {
    return (
        <div className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] rounded-full bg-eco-emerald/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-eco-lime/10 blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-eco-forest-light/10 text-eco-forest-dark font-medium text-sm">
                            Sustainable Recycling with Web3
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-eco-forest-dark leading-tight">
                            Join the <span className="text-eco-emerald">Eco-Revolution</span> with Blockchain Recycling
                        </h1>
                        <p className="text-lg text-eco-forest-dark/80 max-w-xl">
                            ZYRCLE transforms waste management using blockchain technology on Avalanche, IoT sensors, and AI to make recycling more efficient, transparent, and rewarding.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild variant="outline" className="border-eco-forest text-eco-forest hover:bg-eco-forest/5 rounded-full px-8 h-12">
                                <a href="#learn-more">Learn More</a>
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md">
                            <div className="rounded-2xl overflow-hidden shadow-xl border border-eco-forest/10">
                                <img
                                    src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843"
                                    alt="Eco-friendly forest"
                                    className="w-full h-[400px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-eco-forest/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <p className="text-sm font-medium mb-2">Join thousands of users recycling efficiently</p>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-eco-lime-light border-2 border-white"></div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full bg-eco-emerald flex items-center justify-center text-xs font-bold border-2 border-white">
                                            +50
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg border border-eco-forest/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-eco-emerald flex items-center justify-center text-white font-bold">
                                        🌱
                                    </div>
                                    <div>
                                        <p className="text-xs text-eco-forest/60">Total Impact</p>
                                        <p className="font-semibold text-eco-forest">
                                            120+ tons recycled
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-eco-forest/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-eco-lime flex items-center justify-center text-white font-bold">
                                        💰
                                    </div>
                                    <div>
                                        <p className="text-xs text-eco-forest/60">Rewards Distributed</p>
                                        <p className="font-semibold text-eco-forest">
                                            10,000+ CYCLE tokens
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
