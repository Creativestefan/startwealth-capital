"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/real-estate/utils/formatting";
import { Badge } from "@/components/ui/badge";
import { TransactionStatus, InvestmentStatus } from "@prisma/client";

interface StatusUpdate {
  id: string;
  status: TransactionStatus | InvestmentStatus;
  timestamp: string;
  notes?: string;
  updatedBy: {
    name: string;
    email: string;
  };
}

interface StatusTimelineProps {
  transactionId: string;
  transactionType: "equipment" | "investment";
}

export default function StatusTimeline({
  transactionId,
  transactionType,
}: StatusTimelineProps) {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatusUpdates = async () => {
      try {
        setIsLoading(true);
        
        // TODO: Implement the actual API call to fetch status updates
        // Example:
        // const response = await fetch(`/api/transactions/${transactionId}/status-history`);
        // const data = await response.json();
        // setStatusUpdates(data);
        
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockData: StatusUpdate[] = [
          {
            id: "1",
            status: transactionType === "equipment" ? "PENDING" : "ACTIVE",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            updatedBy: {
              name: "System",
              email: "system@startwealth.com",
            },
            notes: "Transaction created",
          },
        ];
        
        // Add more mock statuses for equipment transactions
        if (transactionType === "equipment") {
          mockData.push(
            {
              id: "2",
              status: "ACCEPTED",
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
              updatedBy: {
                name: "Admin User",
                email: "admin@startwealth.com",
              },
              notes: "Order accepted and payment confirmed",
            },
            {
              id: "3",
              status: "PROCESSING",
              timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
              updatedBy: {
                name: "Admin User",
                email: "admin@startwealth.com",
              },
              notes: "Order is being processed and prepared for shipping",
            },
            {
              id: "4",
              status: "OUT_FOR_DELIVERY",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              updatedBy: {
                name: "Admin User",
                email: "admin@startwealth.com",
              },
              notes: "Order has been shipped and is out for delivery",
            }
          );
        }
        
        setStatusUpdates(mockData);
      } catch (error) {
        console.error("Failed to fetch status updates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusUpdates();
  }, [transactionId, transactionType]);

  const getStatusBadgeColor = (status: TransactionStatus | InvestmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-800";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "MATURED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading status history...</div>;
  }

  if (statusUpdates.length === 0) {
    return <div className="py-8 text-center">No status updates found</div>;
  }

  return (
    <div className="space-y-6">
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {statusUpdates.map((update, index) => (
          <li key={update.id} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
              </svg>
            </span>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <Badge className={getStatusBadgeColor(update.status)}>
                  {update.status}
                </Badge>
                <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                  {formatDate(update.timestamp)}
                </time>
              </div>
              {update.notes && (
                <p className="text-sm font-normal text-gray-500 dark:text-gray-300 mt-2">
                  {update.notes}
                </p>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Updated by: {update.updatedBy.name} ({update.updatedBy.email})
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
} 