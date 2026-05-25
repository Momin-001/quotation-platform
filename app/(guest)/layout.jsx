
import Navbar from "@/components/guest/Navbar";
import Footer from "@/components/guest/Homepage/Footer";
import { FooterProvider } from "@/context/FooterContext";
import UserHeader from "@/components/user/UserHeader";
import { getGuestLayoutData } from "@/lib/guest-cms-data";

export default async function GuestLayout({ children }) {
    const { navbarData, footerData } = await getGuestLayoutData();

    return (
        <div>
            <Navbar navbarData={navbarData} />
            <UserHeader />
            <FooterProvider initialFooterData={footerData}>
                {children}
                <Footer footerData={footerData} />
            </FooterProvider>
        </div>
    );
}
