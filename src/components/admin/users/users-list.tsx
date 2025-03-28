"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Eye,
  Filter,
  RefreshCw,
  Search,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  User
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"

type UserListItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  role: string
  kycStatus: string | null
  hasWallet: boolean
}

export default function UsersList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("USER")
  const [kycFilter, setKycFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const pageSize = 10

  const { data, isLoading, isError, refetch } = useQuery<{
    users: UserListItem[]
    totalUsers: number
    totalPages: number
  }>({
    queryKey: ["users", currentPage, searchQuery, roleFilter, kycFilter, sortBy, sortOrder],
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&limit=${pageSize}&search=${searchQuery}&role=${roleFilter}&kyc=${kycFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      
      return response.json()
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const renderKycStatus = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-gray-500 bg-gray-100">
          Not Started
        </Badge>
      )
    }

    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="text-green-600 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-500 bg-gray-100">
            {status}
          </Badge>
        )
    }
  }
  
  // Loading state UI
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state UI
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-10">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Failed to load users</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the user data.
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="w-full pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Users</SelectItem>
              {/* Uncomment below if you need to specifically view admins */}
              {/* <SelectItem value="ADMIN">Admin</SelectItem> */}
            </SelectContent>
          </Select>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All KYC Status</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          size="sm"
          variant="outline" 
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Users table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("firstName")}
                >
                  User
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Joined
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("kycStatus")}
                >
                  KYC Status
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  Role
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users && data.users.length > 0 ? (
              data.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="mr-2 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="max-w-[200px] truncate block">{user.email}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>{renderKycStatus(user.kycStatus)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={user.role === "ADMIN" ? "destructive" : "default"}
                      className="capitalize"
                    >
                      {user.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/users/all/${user.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View user details</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent align="end">
                          <p>View user details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <User className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No users found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.users && data.users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, data.totalUsers)}
            </span>{" "}
            of <span className="font-medium">{data.totalUsers}</span> users
          </p>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
} 