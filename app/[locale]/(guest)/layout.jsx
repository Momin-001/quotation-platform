import Navbar from "@/components/guest/Navbar";
import Footer from "@/components/guest/Footer";
import { PrivacyPolicyProvider } from "@/context/PrivacyPolicyContext";
import { CartProvider } from "@/context/CartContext";
import UserHeader from "@/components/user/UserHeader";
import { getPrivacyPolicyPdfUrl } from "@/features/cms/guest-cms-data";

export default async function GuestLayout({ children }) {
    const privacyPolicyPdfUrl = await getPrivacyPolicyPdfUrl();

    return (
        <CartProvider>
            <Navbar />
            <UserHeader />
            <PrivacyPolicyProvider pdfUrl={privacyPolicyPdfUrl}>
                {children}
                <Footer />
            </PrivacyPolicyProvider>
        </CartProvider>
    );
}
