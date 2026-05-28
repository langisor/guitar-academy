import { notFound } from "next/navigation";
import MusicSheetVsGuitar from "@/content/guides/music-sheet-notes";
import { menuItems } from "@/content/menu-items";
/**
 * How to use this file:
 * - Create the guide file at @/content/guides/
 * - Import here
 * - add to menuItems array at @/content/menu.ts
 */

 

export default async  function GuidePage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    const guideId = parseInt(id);

    if (isNaN(guideId)) {
        return notFound();
    }

    const guide = menuItems.flatMap(item => item.items || []).find(subItem => subItem.id === guideId);
 
    if (!guide) {
        return notFound();
    }

    switch (guideId) {
        case 23:
            return <MusicSheetVsGuitar />;
        default:
            return notFound();
    }

}