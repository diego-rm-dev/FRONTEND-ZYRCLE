import { Link } from "react-router-dom";
import { Mail, Github, Twitter, ChevronUp, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-emerald-50 text-eco-forest border-t border-eco-emerald/20">
            {/* Top button */}
            <div className="container mx-auto relative">
                <Button
                    onClick={scrollToTop}
                    variant="outline"
                    size="icon"
                    className="absolute -top-5 right-4 md:right-10 bg-eco-emerald text-white border-eco-emerald hover:bg-eco-emerald/90 hover:text-white rounded-full shadow-lg z-10"
                >
                    <ChevronUp className="h-5 w-5" />
                </Button>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-16 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    <div className="space-y-5">
                        <div className="flex items-center space-x-2">
                            <img src="/favicon.svg" alt="Zyrcle Logo" className="h-12 w-12" />
                            <span className="text-xl font-bold text-eco-forest">ZYRCLE</span>
                        </div>
                        <p className="text-eco-forest/80 max-w-xs leading-relaxed">
                            Transformamos el reciclaje con blockchain en Avalanche, aprovechando IoT y AI para crear un futuro sostenible.
                        </p>
                        <div className="flex space-x-3 pt-2">
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-emerald/20 hover:bg-eco-emerald/30 transition-all duration-300"
                            >
                                <Twitter size={18} className="text-eco-forest" />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-emerald/20 hover:bg-eco-emerald/30 transition-all duration-300"
                            >
                                <Github size={18} className="text-eco-forest" />
                            </a>
                            <a
                                href="#"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-eco-emerald/20 hover:bg-eco-emerald/30 transition-all duration-300"
                            >
                                <Mail size={18} className="text-eco-forest" />
                            </a>
                        </div>
                    </div>

                    <div className="md:ml-8">
                        <h3 className="font-semibold text-lg mb-6 flex items-center space-x-2 text-eco-forest">
                            <span className="inline-block w-8 h-0.5 bg-eco-emerald rounded-full mr-2"></span>
                            Plataforma
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/residence"
                                    className="text-eco-forest/80 hover:text-eco-emerald transition-colors flex items-center rounded-md"
                                >
                                    <span className="inline-block w-3 h-0.5 bg-eco-emerald/30 rounded-full mr-2"></span>
                                    Residencia
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/collectors"
                                    className="text-eco-forest/80 hover:text-eco-emerald transition-colors flex items-center rounded-md"
                                >
                                    <span className="inline-block w-3 h-0.5 bg-eco-emerald/30 rounded-full mr-2"></span>
                                    Recolectores
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/marketplace"
                                    className="text-eco-forest/80 hover:text-eco-emerald transition-colors flex items-center rounded-md"
                                >
                                    <span className="inline-block w-3 h-0.5 bg-eco-emerald/30 rounded-full mr-2"></span>
                                    Marketplace
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-6 flex items-center space-x-2 text-eco-forest">
                            <span className="inline-block w-8 h-0.5 bg-eco-emerald rounded-full mr-2"></span>
                            Recursos
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="#"
                                    className="text-eco-forest/80 hover:text-eco-emerald transition-colors flex items-center rounded-md"
                                >
                                    <span className="inline-block w-3 h-0.5 bg-eco-emerald/30 rounded-full mr-2"></span>
                                    White Paper
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="md:ml-4">
                        <h3 className="font-semibold text-lg mb-6 flex items-center space-x-2 text-eco-forest">
                            <span className="inline-block w-8 h-0.5 bg-eco-emerald rounded-full mr-2"></span>
                            Contacto
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-eco-emerald/20">
                                    <MapPin className="h-4 w-4 text-eco-forest" />
                                </div>
                                <span className="text-eco-forest/80">Av. Sostenible 123, Ciudad Verde</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-eco-emerald/20">
                                    <Phone className="h-4 w-4 text-eco-forest" />
                                </div>
                                <span className="text-eco-forest/80">+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-eco-emerald/20">
                                    <Mail className="h-4 w-4 text-eco-forest" />
                                </div>
                                <span className="text-eco-forest/80">info@cycleeco.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom section */}
                <div className="pt-8 mt-8 border-t border-eco-emerald/20">
                    <div className="flex flex-col md:flex-row justify-between items-center text-eco-forest/60">
                        <p>© {new Date().getFullYear()} ZYRCLE. Todos los derechos reservados.</p>
                        <div className="mt-4 md:mt-0 flex space-x-6">
                            <a href="#" className="text-eco-forest/60 hover:text-eco-emerald transition-colors text-sm">
                                Privacidad
                            </a>
                            <a href="#" className="text-eco-forest/60 hover:text-eco-emerald transition-colors text-sm">
                                Términos
                            </a>
                            <a href="#" className="text-eco-forest/60 hover:text-eco-emerald transition-colors text-sm">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}