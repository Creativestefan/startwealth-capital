import { NextResponse } from "next/server"
import { createMarketPlan, deleteMarketPlan, getMarketPlans, updateMarketPlan } from "@/lib/market/actions/plans"
import { validateMarketPlan } from "@/lib/market/utils/validation"
import { MarketPlanType } from "@/lib/market/utils/constants"

export async function GET() {
  try {
    const plans = await getMarketPlans()
    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching market plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch market plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const planInput = {
      name: data.name,
      description: data.description,
      minAmount: parseFloat(data.minAmount),
      maxAmount: parseFloat(data.maxAmount),
      returnRate: parseFloat(data.returnRate),
      durationMonths: parseInt(data.durationMonths),
      type: (data.type as MarketPlanType) || MarketPlanType.SEMI_ANNUAL
    }
    const validatedData = validateMarketPlan(planInput)
    const plan = await createMarketPlan(validatedData)
    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error creating market plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create market plan" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    const planInput = {
      name: updateData.name,
      description: updateData.description,
      minAmount: parseFloat(updateData.minAmount),
      maxAmount: parseFloat(updateData.maxAmount),
      returnRate: parseFloat(updateData.returnRate),
      durationMonths: parseInt(updateData.durationMonths),
      type: (updateData.type as MarketPlanType) || MarketPlanType.SEMI_ANNUAL
    }
    const validatedData = validateMarketPlan(planInput)
    const plan = await updateMarketPlan(id, validatedData)
    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error updating market plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update market plan" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await deleteMarketPlan(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting market plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete market plan" },
      { status: 500 }
    )
  }
} 