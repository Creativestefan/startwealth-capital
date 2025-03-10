"use client"

import type { RealEstateInvestment } from "@/lib/real-estate/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { InvestmentStatusBadge } from "../shared/investment-status-badge"
import { InvestmentProgress } from "../shared/investment-progress"
import { getInvestmentSummary } from "../shared/investment-utils"
import { formatCurrency, formatDate } from "@/lib/real-estate/utils/formatting"
import { Calendar, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react"

interface InvestmentDetailsProps {
  investment: RealEstateInvestment
  onWithdraw?: (id: string) => void
}

/**
 * Displays comprehensive information about a specific investment
 * Used on individual investment detail pages
 */
export function InvestmentDetails({ investment, onWithdraw }: InvestmentDetailsProps) {
  const summary = getInvestmentSummary(investment)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{summary.type}</h1>
          <div className="mt-1 flex items-center text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Invested on {summary.investedOn}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold md:text-2xl">{summary.amount}</div>
          <InvestmentStatusBadge status={investment.status} />
          {investment.status === "MATURED" && (
            <Button onClick={() => onWithdraw?.(investment.id)}>Withdraw Returns</Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium">Investment Details</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{summary.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Amount</dt>
                      <dd className="font-medium">{summary.amount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd>
                        <InvestmentStatusBadge status={investment.status} />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Start Date</dt>
                      <dd className="font-medium">{formatDate(investment.startDate)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">End Date</dt>
                      <dd className="font-medium">{formatDate(investment.endDate)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Returns</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Expected Return</dt>
                      <dd className="font-medium">{summary.expectedReturn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Return Rate</dt>
                      <dd className="font-medium">
                        {((Number(investment.expectedReturn) / Number(investment.amount)) * 100).toFixed(2)}%
                      </dd>
                    </div>
                    {investment.actualReturn && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Actual Return</dt>
                        <dd className="font-medium">{formatCurrency(investment.actualReturn)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Auto-reinvest</dt>
                      <dd className="font-medium">{investment.reinvest ? "Yes" : "No"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-lg font-medium">Progress</h3>
                <InvestmentProgress investment={investment} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-xl font-bold">{summary.amount}</h3>
                      <p className="text-sm text-muted-foreground">Initial Investment</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-xl font-bold">{summary.expectedReturn}</h3>
                      <p className="text-sm text-muted-foreground">Expected Return</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <ArrowUpRight className="h-8 w-8 text-primary" />
                      <h3 className="mt-2 text-xl font-bold">
                        {formatCurrency(Number(investment.amount) + Number(investment.expectedReturn))}
                      </h3>
                      <p className="text-sm text-muted-foreground">Total Value at Maturity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div>
                    <p className="font-medium">Initial Investment</p>
                    <p className="text-sm text-muted-foreground">{formatDate(investment.startDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{summary.amount}</p>
                    <p className="text-sm text-green-600">Completed</p>
                  </div>
                </div>

                {investment.status === "MATURED" && (
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-medium">Investment Matured</p>
                      <p className="text-sm text-muted-foreground">{formatDate(investment.endDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{summary.expectedReturn}</p>
                      <p className="text-sm text-blue-600">Return Available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

