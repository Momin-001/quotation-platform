import ControllersClient from "./ControllersClient";
import { fetchGuestControllersListing } from "@/features/controllers/guest-controllers-list";

const INITIAL_PAGE_SIZE = 10;

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
