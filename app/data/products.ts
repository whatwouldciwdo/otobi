export interface Product {
    id: string;
    title: string;
    image: string;
    price: string;
    weight: number;
    rating: number;
    description: string;
}

export const productsData: Product[] = [
    {
        id: "all-purpose-cleaner",
        title: "All Purpose Cleaner",
        image: "/product/images/all-purpose-cleaner-otobi.png",
        price: "RP 123",
        weight: 700,
        rating: 5,
        description: "A premium, versatile cleaner designed to tackle dirt, grease, and grime on various surfaces of your vehicle. Formulated for safety and effectiveness, leaving your car spotless without damaging delicate materials.",
    },
    {
        id: "ipa-paint-decreaser",
        title: "Ipa Paint Decreaser",
        image: "/product/images/ipa-paint-otobi.png",
        price: "RP 123",
        weight: 250,
        rating: 5,
        description: "Essential prep spray for any detailing process. Our IPA Paint Decreaser effectively strips away old waxes, polishing oils, and residues to ensure a perfectly clean surface before applying ceramic coatings or sealants.",
    },
    {
        id: "ph-balanced-shampoo",
        title: "PH Balanced Shampoo",
        image: "/product/images/ph-balanced-shampoo-otobi.png",
        price: "RP 123",
        weight: 500,
        rating: 5,
        description: "A gentle yet powerful pH balanced auto wash. Creates thick, luxurious suds that safely lift away dirt and road grime without stripping your existing wax or ceramic coating layer. Leaves a brilliant shine.",
    },
];
