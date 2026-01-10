'use client'

import WasteScanner from '@/components/WasteScanner'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function ScannerPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-10 px-4">

            <div className="w-full max-w-4xl flex items-center mb-8 relative">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="absolute left-0 text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                </Button>
                <h1 className="w-full text-center text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    Smart Waste Sorter
                </h1>
            </div>

            <p className="text-slate-400 mb-8 max-w-lg text-center">
                Not sure if it's trash or treasure? Use the <span className="text-green-400 font-bold">Eco-Lens</span> to find out!
            </p>

            <WasteScanner />

        </div>
    )
}
