"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { LogOut, User, FileSpreadsheet } from "lucide-react"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in")
    if (loggedIn === "true") {
      setIsAuthenticated(true)
    } else {
      router.push("/admin")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in")
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="Profile" className="w-12 h-12 rounded-full bg-white p-1" />
              <div>
                <h1 className="text-xl font-bold">Welcome: Brajmohan Vishwakarma PAWT</h1>
                <p className="text-blue-100 text-sm">Administrator Dashboard</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-800 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Water Tourism License Applications Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View in Spreadsheet</div>
              <p className="text-xs text-muted-foreground">Live data from Google Sheets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin User</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Brajmohan Vishwakarma</div>
              <p className="text-xs text-muted-foreground">PAWT Administrator</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Spreadsheet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Water Tourism License Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden" style={{ height: "600px" }}>
              <iframe
                src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQjgZC2VvgOzyvlzHbRP53FVhLpMjqY-X8aagNeYu86BWuGpujySnbIMl5WsQok_vda0GuKjIRue_jk/pubhtml"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Water Tourism Applications Spreadsheet"
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() =>
                    window.open(
                      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjgZC2VvgOzyvlzHbRP53FVhLpMjqY-X8aagNeYu86BWuGpujySnbIMl5WsQok_vda0GuKjIRue_jk/pubhtml",
                      "_blank",
                    )
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  Open Spreadsheet in New Tab
                </Button>
                <Button onClick={() => router.push("/")} variant="outline">
                  View Application Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
