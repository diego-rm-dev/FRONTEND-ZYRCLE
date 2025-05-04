import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Web3 from "web3";
import AbiCertificate from "@/lib/AbiCertificate";

const CONTRACT_ADDRESS = "0xBC40b4722049910591db53a8334842390Ce2128C";

const certificateProducts = [
    {
        id: 1,
        name: "Gold Carbon Certificate",
        description: "Awarded for preventing 2 tons of CO₂ emissions.",
        uri: "ipfs://bafkreidtbeo2bu2tb5ztwifnnsd4fxumhevfbkto37grwvl6kdo2mowp2e",
        image: "https://gateway.pinata.cloud/ipfs/bafybeiecfedwjacjezbd7nnnelox7jylusy2tvst62dqxhbdu5c6z72lji",
        price: 200,
        level: "Gold"
    },
    {
        id: 2,
        name: "Silver Carbon Certificate",
        description: "Awarded for preventing 1 ton of CO₂ emissions.",
        uri: "ipfs://bafkreibc3z3545claecbpjhvu3nmxb7o3ewqafavpt4xst3kk6nuf4glui",
        image: "https://gateway.pinata.cloud/ipfs/bafybeid375zofvzjsyjpqqlr4svnmzgypu4ssutvlfbewqzfpfxa3ofuk4",
        price: 100,
        level: "Silver"
    },
    {
        id: 3,
        name: "Bronze Carbon Certificate",
        description: "Awarded for preventing 500kg of CO₂ emissions.",
        uri: "ipfs://bafkreiepxu3mqhu47q35p2fw2eb4gqtkogi3xnko7nxq7z4azwvt64rbgu",
        image: "https://gateway.pinata.cloud/ipfs/bafybeiezq2dekmilwfel2faqfhjsdtytkadz7457vr446z5opov3uzw3na",
        price: 50,
        level: "Bronze"
    }
];

export function ProductGrid() {
    const [cart, setCart] = useState<any[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

    const addToCart = (product: any) => {
        if (!cart.some((item) => item.id === product.id)) {
            setCart([...cart, product]);
        }
    };

    const handleCheckout = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            const contract = new web3.eth.Contract(AbiCertificate, CONTRACT_ADDRESS);
            const item = cart[0];

            const result = await contract.methods.safeMint(account, item.uri).send({ from: account });

            // ✅ Debug completo (puedes eliminar en producción)    
            console.log("Transaction result:", result);

            // ✅ Buscar evento Transfer emitido hacia este usuario
            const transferEvents = Object.values(result.events || {}).filter(
                (e: any) =>
                    e.event === "Transfer" &&
                    e.returnValues?.to?.toLowerCase() === account.toLowerCase()
            );

            const tokenId = transferEvents[0]?.returnValues?.tokenId ?? null;

            if (tokenId !== null) {
                setMintedTokenId(tokenId.toString());
                setCart([]);
            } else {
                console.warn("Token ID not found in events");
            }

        } catch (err) {
            console.error("Minting failed:", err);
        }
    };


    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-eco-forest">Carbon Credit Certificates</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificateProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                        <CardHeader className="p-4">
                            <h3 className="font-semibold text-lg text-eco-forest">{product.name}</h3>
                            <p className="text-sm text-eco-forest/70">{product.description}</p>
                        </CardHeader>
                        <CardContent className="px-4">{product.price} ZYRCLE</CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button className="w-full bg-eco-emerald text-white" onClick={() => addToCart(product)}>
                                Add to Cart
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={() => setCartOpen(true)}
                        className="bg-eco-forest text-white rounded-full p-4 shadow-lg"
                    >
                        🛒 {cart.length}
                    </Button>
                </div>
            )}

            <Dialog open={cartOpen} onOpenChange={setCartOpen}>
                <DialogContent className="rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle>Your Cart</DialogTitle>
                    </DialogHeader>

                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2">
                            <div>
                                <h4 className="font-medium text-eco-forest">{item.name}</h4>
                                <p className="text-sm text-eco-forest/60">{item.price} ZYRCLE</p>
                            </div>
                        </div>
                    ))}

                    <Button onClick={handleCheckout} className="mt-4 w-full bg-eco-emerald text-white">
                        Mint Certificate
                    </Button>

                    {mintedTokenId !== null && (
                        <div className="mt-4 text-center text-green-600">
                            ✅ Certificate minted! Token ID: {mintedTokenId}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
