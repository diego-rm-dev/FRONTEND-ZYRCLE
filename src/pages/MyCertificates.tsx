import { useEffect, useState } from "react";
import Web3 from "web3";
import AbiCertificate from "@/lib/AbiCertificate";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDRESS = "0xBC40b4722049910591db53a8334842390Ce2128C";

export default function MyCertificates() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const accounts = await web3.eth.getAccounts();
                const user = accounts[0];
                const contract = new web3.eth.Contract(AbiCertificate, CONTRACT_ADDRESS);

                const latestBlock = Number(await web3.eth.getBlockNumber());
                const fromBlock = latestBlock - 5000 > 0 ? latestBlock - 1000 : 0;

                const transferEvents = await contract.getPastEvents("Transfer", {
                    fromBlock,
                    toBlock: "latest",
                });

                const ownedTokens = transferEvents
                    .filter((e) => e.returnValues.to.toLowerCase() === user.toLowerCase())
                    .map((e) => Number(e.returnValues.tokenId));

                const uniqueTokens = Array.from(new Set(ownedTokens));

                const results = await Promise.all(
                    uniqueTokens.map(async (tokenId) => {
                        try {
                            const uri = await contract.methods.tokenURI(tokenId).call();
                            const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
                            console.log("Fetching metadata for token", tokenId, "→", gatewayUrl);

                            const response = await fetch(gatewayUrl);
                            if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

                            const text = await response.text();
                            const metadata = JSON.parse(text);

                            return {
                                tokenId: Number(tokenId),
                                ...metadata,
                            };
                        } catch (innerErr) {
                            console.warn(`Error processing token ID ${tokenId}:`, innerErr);
                            return null;
                        }
                    })
                );

                const filtered = results.filter((r) => r !== null);
                setCertificates(filtered);
            } catch (err) {
                console.error("Error fetching certificates:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <main className="flex-grow px-4 py-8 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-eco-forest mb-2 flex items-center">
                        🏛️ My Carbon Certificates
                    </h2>
                    <p className="text-sm text-eco-forest/70">
                        These are the NFTs you have minted for your sustainability contributions.
                    </p>
                </div>

                {loading ? (
                    <p className="text-eco-forest/60">Loading your certificates...</p>
                ) : certificates.length === 0 ? (
                    <p className="text-eco-forest/60">You haven't minted any certificates yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <Card key={cert.tokenId} className="overflow-hidden shadow-md">
                                <img src={cert.image} alt={cert.name} className="w-full h-48 object-cover" />
                                <CardHeader>
                                    <CardTitle className="text-lg text-eco-forest">{cert.name}</CardTitle>
                                    <CardDescription className="text-eco-forest/70">Token ID: {cert.tokenId}</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-eco-forest">
                                    <p className="mb-2">{cert.description}</p>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            window.open(
                                                `https://gateway.pinata.cloud/ipfs/${cert.image.replace("ipfs://", "")}`,
                                                "_blank"
                                            )
                                        }
                                    >
                                        View Certificate
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
