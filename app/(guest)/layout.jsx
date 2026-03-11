
import Navbar from "@/components/guest/Navbar";
import UserHeader from "@/components/user/UserHeader";
import Footer from "@/components/guest/Footer";
import { BASE_URL } from "@/lib/constants";

const defaultNavbarData = {
    navItem1En: "HOME",
    navItem1De: "STARTSEITE",
    navItem2En: "PRODUCTS",
    navItem2De: "PRODUKTE",
    navItem3En: "CONTROLLERS",
    navItem3De: "CONTROLLER",
    navItem4En: "LEDITOR",
    navItem4De: "LEDITOR",
    navItem5En: "BLOGS",
    navItem5De: "BLOGS",
    navItem6En: "BECOME PARTNERS",
    navItem6De: "PARTNER WERDEN",
};

const defaultFooterData = {
    descriptionEn: "PROLEDALL is a platform that allows you to get quotes for your LED products. We are a team of experts who are dedicated to providing the best possible service to our clients.",
    descriptionDe: "PROLEDALL ist eine Plattform, die es Ihnen ermöglicht, Angebote für Ihre LED-Produkte zu erhalten. Wir sind ein Team von Experten, die sich der Bereitstellung des bestmöglichen Service für unsere Kunden widmen.",
    ourAddressTitleEn: "Our Address",
    ourAddressTitleDe: "Unsere Adresse",
    quickLinksTitleEn: "Quick Links",
    quickLinksTitleDe: "Schnelllinks",
    quickLink1En: "About",
    quickLink1De: "Über uns",
    quickLink2En: "Blogs",
    quickLink2De: "Blogs",
    quickLink3En: "Projects",
    quickLink3De: "Projekte",
    quickLink4En: "Contact Us",
    quickLink4De: "Kontaktieren Sie uns",
    quickLink5En: "Help",
    quickLink5De: "Hilfe",
    newsletterTitleEn: "Newsletter",
    newsletterTitleDe: "Newsletter",
    emailPlaceholderEn: "Your Email Address",
    emailPlaceholderDe: "Ihre E-Mail-Adresse",
    subscribeButtonEn: "Subscribe",
    subscribeButtonDe: "Abonnieren",
    copyrightTextEn: "© Copyright Quotation Platform. All Right Reserved",
    copyrightTextDe: "© Copyright Quotationsplattform. Alle Rechte vorbehalten",
};

const defaultUserHeaderData = {
    userHeaderMyEnquiryEn: "My Enquiry",
    userHeaderMyEnquiryDe: "Meine Anfrage",
    userHeaderMyQuotationEn: "My Quotation",
    userHeaderMyQuotationDe: "Meine Angebot",
    userHeaderMyAccountEn: "My Account",
    userHeaderMyAccountDe: "Mein Konto",
    userHeaderMyCartEn: "My Cart",
    userHeaderMyCartDe: "Mein Warenkorb",
};

async function getLayoutData() {
    const [navbarRes, footerRes, userHeaderRes] = await Promise.all([
      fetch(`${BASE_URL}/api/navbar`, { cache: "no-store" }),
      fetch(`${BASE_URL}/api/footer`, { cache: "no-store" }),
      fetch(`${BASE_URL}/api/user-header`, { cache: "no-store" }),
    ]);
  
    const navbarJson = await navbarRes.json();
    const footerJson = await footerRes.json();
    const userHeaderJson = await userHeaderRes.json();
    return {
      navbarData: navbarJson?.data || defaultNavbarData,
      footerData: footerJson?.data || defaultFooterData,
      userHeaderData: userHeaderJson?.data || defaultUserHeaderData,
    };
  }
  
  export default async function GuestLayout({ children }) {
    const { navbarData, footerData, userHeaderData } = await getLayoutData();
  
    return (
      <div>
        <Navbar navbarData={navbarData} />
        <UserHeader userHeaderData={userHeaderData} />
        {children}
        <Footer footerData={footerData} />
      </div>
    );
  }