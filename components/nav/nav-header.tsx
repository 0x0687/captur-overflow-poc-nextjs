"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ConnectButton } from "@mysten/dapp-kit"

import '@mysten/dapp-kit/dist/index.css';
import { useBalance } from "../providers/balance-provider"
import { formatCaptAmount } from "@/lib/utils"


export default function NavHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const {balance} = useBalance();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    {/* Mobile Navigation */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <div className="flex flex-col">
                                <div className="border-b p-4">
                                    <SheetTitle className="text-lg font-semibold">Navigation</SheetTitle>
                                </div>
                                {/* <nav className="flex flex-col p-2">
                                    <Link
                                        href="/"
                                        className="group flex h-10 w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/houses"
                                        className="group flex h-10 w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Houses
                                    </Link>
                                    <Link
                                        href="/rewards"
                                        className="group flex h-10 w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Rewards
                                    </Link>
                                </nav> */}
                            </div>
                        </SheetContent>
                    </Sheet>
                    {/* Logo */}
                    <Link href="/" className="font-semibold text-xl hidden md:block">
                        <Image src="/captur-logo.avif" alt="Captur Logo" width={158} height={38} className="inline-block mr-2" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                        Tracker
                    </Link>
                    <Link href="/verification" className="text-sm font-medium transition-colors hover:text-primary">
                        Verification
                    </Link>
                    <Link href="/marketplace" className="text-sm font-medium transition-colors hover:text-primary">
                        Marketplace
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    {balance != undefined && <div className="inline-flex items-center gap-2 font-medium">
                        <Image
                        src={"/captur-icon.avif"}
                        alt="Captur Logo"
                        width={32}
                        height={32}
                        />
                        {formatCaptAmount(balance)}
                    </div>}
                    <ConnectButton />
                </div>
            </div>
        </header>
    )
}

