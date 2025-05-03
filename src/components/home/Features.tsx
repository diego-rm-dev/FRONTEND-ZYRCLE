
import { RecycleIcon, RefreshCw, Leaf, Award, CircleDollarSign, Truck } from "lucide-react";

const features = [
    {
        title: "Blockchain Transparency",
        description: "Every recycling transaction is recorded on the Avalanche blockchain, ensuring complete transparency and traceability.",
        icon: <RecycleIcon className="h-8 w-8 text-white" />
    },
    {
        title: "IoT Integration",
        description: "Smart containers with IoT sensors track fill levels, material type, and weight for optimized collection.",
        icon: <RefreshCw className="h-8 w-8 text-white" />
    },
    {
        title: "Carbon Footprint Reduction",
        description: "Quantify your environmental impact with precise carbon offset metrics for every recycling action.",
        icon: <Leaf className="h-8 w-8 text-white" />
    },
    {
        title: "ZYRCLE Token Rewards",
        description: "Earn ZYRCLE tokens for your recycling efforts that can be exchanged for eco-friendly products and services.",
        icon: <CircleDollarSign className="h-8 w-8 text-white" />
    },
    {
        title: "Optimized Collection Routes",
        description: "AI-powered route optimization for waste collectors minimizes carbon emissions and maximizes efficiency.",
        icon: <Truck className="h-8 w-8 text-white" />
    },
    {
        title: "Community Recognition",
        description: "Earn badges and climb leaderboards as your recycling efforts contribute to a cleaner planet.",
        icon: <Award className="h-8 w-8 text-white" />
    }
];

export function Features() {
    return (
        <section id="learn-more" className="py-20 bg-eco-forest/5">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-eco-forest-dark mb-4">
                        Revolutionizing Recycling with Web3
                    </h2>
                    <p className="text-eco-forest-dark/70">
                        Our platform combines blockchain technology with IoT and AI to create a more efficient,
                        transparent, and rewarding recycling experience for everyone.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-sm border border-eco-forest/10 hover:shadow-md transition-shadow"
                        >
                            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-eco-lime to-eco-emerald mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-eco-forest-dark mb-2">{feature.title}</h3>
                            <p className="text-eco-forest-dark/70">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
