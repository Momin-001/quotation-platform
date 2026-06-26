import RefurbishedProductsClient from "./RefurbishedProductsClient";
import {
    fetchGuestRefurbishedListing,
    fetchRefurbishedPixelPitchBounds,
} from "@/features/refurbished-products/guest-refurbished-list";

const INITIAL_PAGE_SIZE = 10;

export const metadata = {
    title: "Refurbished LED Products",
    description: "Certified used LED display systems available for purchase.",
};

export default async function RefurbishedProductsPage() {
    let initialProducts = [];
    let filterBounds = { pixelPitchMin: "0.10", pixelPitchMax: "30.00" };

    try {
        [initialProducts, filterBounds] = await Promise.all([
            fetchGuestRefurbishedListing({ limit: INITIAL_PAGE_SIZE, offset: 0 }),
            fetchRefurbishedPixelPitchBounds(),
        ]);
    } catch {
        initialProducts = [];
    }

    const initialHasMore = initialProducts.length === INITIAL_PAGE_SIZE;

    return (
        <RefurbishedProductsClient
            initialProducts={initialProducts}
            initialHasMore={initialHasMore}
            filterBounds={filterBounds}
        />
    );
}
