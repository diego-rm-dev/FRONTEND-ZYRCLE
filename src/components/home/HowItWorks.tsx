
import { ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Connect Your Wallet",
        description: "Link your existing MetaMask or other compatible wallet to start tracking your recycling impact and earning rewards.",
        image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    },
    {
        number: "02",
        title: "Recycle Materials",
        description: "Deposit recyclable materials into IoT-equipped smart containers at your residence or neighborhood collection point.",
        image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
    },
    {
        number: "03",
        title: "Earn ZYRCLE Tokens",
        description: "Automatically receive ZYRCLE tokens based on the weight, volume, and type of materials you recycle.",
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    },
    {
        number: "04",
        title: "Spend & Grow",
        description: "Use your earned tokens to purchase eco-friendly products or services in our marketplace.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
];

export function HowItWorks() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-eco-forest-dark mb-4">
                        How ZYRCLE Works
                    </h2>
                    <p className="text-eco-forest-dark/70">
                        Our streamlined process makes recycling more rewarding and efficient than ever before.
                    </p>
                </div>

                <div className="space-y-20">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                                }`}
                        >
                            <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                                <div className="flex items-baseline gap-4 mb-4">
                                    <span className="text-4xl font-bold text-eco-emerald">{step.number}</span>
                                    <div className="h-px bg-eco-emerald flex-grow"></div>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-eco-forest-dark mb-4">{step.title}</h3>
                                <p className="text-eco-forest-dark/70 text-lg mb-6">{step.description}</p>
                                {index === steps.length - 1 && (
                                    <button className="flex items-center text-eco-emerald font-medium">
                                        Learn more
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                                <div className="relative">
                                    <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-eco-lime/20 to-eco-emerald/20 blur-lg"></div>
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-[300px] lg:h-[400px] object-cover rounded-xl relative z-10 shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
