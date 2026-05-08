import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST() {
  try {
    // Delete in correct order to avoid foreign key constraint errors
    await prisma.auditoria.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.scrapedBusiness.deleteMany();

    return NextResponse.json({ success: true, message: "Database cleared successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
