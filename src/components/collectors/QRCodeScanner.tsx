import { useCallback } from "react";
import { QrReader } from "react-qr-reader";

interface QRCodeScannerProps {
    onScan: (result: string) => void;
}

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
    const handleResult = useCallback((result: any, error: any) => {
        if (result) {
            onScan(result?.text);
        }
        // Puedes loggear errores si quieres depurar
        // if (!!error) {
        //   console.error(error);
        // }
    }, [onScan]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleResult}
                containerStyle={{ width: "100%" }}
                videoStyle={{ borderRadius: "0.5rem", width: "100%" }}
            />
            <div className="absolute inset-0 border-4 border-eco-emerald/50 rounded-lg pointer-events-none" />
        </div>
    );
}
