export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * This is a one-time cleanup endpoint to remove duplicate records in the ReferralSettings table
 * It keeps only the most recent record and deletes all others
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all settings records ordered by most recent first
    const settings = await prisma.$queryRaw`
      SELECT "id", "updatedAt" FROM "ReferralSettings" ORDER BY "updatedAt" DESC;
    `;
    
    // Cast to proper type
    const settingsArray = settings as Array<{ id: string, updatedAt: Date }>;
    
    if (settingsArray.length <= 1) {
      return NextResponse.json({ 
        message: "No cleanup needed. Only one record exists.", 
        count: settingsArray.length
      });
    }
    
    // Keep the most recent record, delete all others
    const mostRecentId = settingsArray[0].id;
    const idsToDelete = settingsArray.slice(1).map(s => s.id);
    
    // Use a transaction to ensure atomicity
    const results = await prisma.$transaction(async (tx) => {
      const deletionResults = [];
      
      // For each ID to delete, run a separate delete operation
      for (const id of idsToDelete) {
        try {
          const result = await tx.$executeRaw`
            DELETE FROM "ReferralSettings" WHERE "id" = ${id};
          `;
          deletionResults.push({ id, success: true, result });
        } catch (err) {
          console.error(`Failed to delete record with ID ${id}:`, err);
          deletionResults.push({ id, success: false, error: String(err) });
        }
      }
      
      return deletionResults;
    }).catch(err => {
      console.error("Transaction failed:", err);
      throw new Error("Failed to delete records: " + String(err));
    });
    
    // Revalidate the path to make sure latest changes are reflected
    revalidatePath('/admin/settings/referrals');
    
    return NextResponse.json({ 
      message: "Database cleaned successfully", 
      kept: mostRecentId,
      deleted: idsToDelete,
      count: idsToDelete.length
    });
  } catch (error) {
    console.error("[API_ADMIN_REFERRAL_SETTINGS_CLEAN]", error);
    return NextResponse.json(
      { error: "Failed to clean up settings database", message: String(error) },
      { status: 500 }
    );
  }
} 