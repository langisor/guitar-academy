import { levelRepository } from "@/repositories";
import WorldClient from "./WorldClient";
import { db } from "@/db/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorldPage({ params }: PageProps) {
  const { id } = await params;
  const worldId = parseInt(id) || 1;

  // Fetch levels from database
  const levels = await levelRepository.getByWorld(worldId);
  
  // Fetch world details
  const worldResult = await db.execute({
    sql: "SELECT * FROM worlds WHERE id = ?",
    args: [worldId]
  });
  
  const world = worldResult.rows[0];
  const worldTitle = world ? (world.title as string) : `World ${worldId}`;

  return (
    <WorldClient 
      worldId={worldId} 
      worldTitle={worldTitle} 
      levels={levels as any} 
    />
  );
}
