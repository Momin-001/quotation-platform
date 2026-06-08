import ControllersClient from "./ControllersClient";
import { fetchGuestControllersListing } from "@/features/controllers/guest-controllers-list";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";

const INITIAL_PAGE_SIZE = 10;

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/controllers", validateLocale(locale));
}

export default async function ControllersPage() {
    let initialControllers = [];
    try {
        initialControllers = await fetchGuestControllersListing({
            limit: INITIAL_PAGE_SIZE,
            offset: 0,
        });
    } catch {
        initialControllers = [];
    }

    const initialHasMore = initialControllers.length === INITIAL_PAGE_SIZE;

    return (
        <ControllersClient
            initialControllers={initialControllers}
            initialHasMore={initialHasMore}
        />
    );
}
