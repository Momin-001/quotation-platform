import { Facebook, Linkedin, Send, Twitter, Youtube, Instagram, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#0f2e4a] text-white pt-16 pb-8 font-open-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand & Description */}
                    <div className="space-y-4">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} />
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur. Viverra vitae id in erat. Vel blandit leo diam in aliquam arcu fusce neque. Eget vulputate ipsum.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="bg-white text-[#0f2e4a] p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-secondary cursor-pointer transition-colors"><Facebook size={16} /></div>
                            <div className="bg-white text-[#0f2e4a] p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-secondary cursor-pointer transition-colors"><Twitter size={16} /></div>
                            <div className="bg-white text-[#0f2e4a] p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-secondary cursor-pointer transition-colors"><Linkedin size={16} /></div>
                            <div className="bg-white text-[#0f2e4a] p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-secondary cursor-pointer transition-colors"><Youtube size={16} /></div>
                        </div>
                    </div>

                    {/* Our Address */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Our Address</h3>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <span>📞</span> +49 000 000 0000
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📧</span> support@website.com
                            </li>
                            <li className="flex items-start gap-2">
                                <span>📍</span>
                                <span>885 road, 1122 street.<br />Berlin, Germany</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="/about" className="hover:text-secondary">About</Link></li>
                            <li><Link href="/blogs" className="hover:text-secondary">Blogs</Link></li>
                            <li><Link href="/projects" className="hover:text-secondary">Projects</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary">Contact Us</Link></li>
                            <li><Link href="/help" className="hover:text-secondary">Help</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Newsletter</h3>
                        <div className="flex flex-col gap-4 font-archivo">
                            <Input
                                placeholder="Your Email Address"
                                className="bg-white text-black border-none h-12 placeholder:text-gray-500"
                            />
                            <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium h-12 w-32">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 flex items-center justify-between">
                    <p className="text-xs text-gray-400">© Copyright <span className="font-bold text-white">Quotation Platform</span>. All Right Reserved</p>
                    <div className="bg-secondary p-2 rounded-full cursor-pointer hover:opacity-90">
                        <ArrowUp size={20} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
