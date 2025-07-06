"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (credentials.username === "wt_admin" && credentials.password === "wt_admin") {
      // Store login state
      localStorage.setItem("admin_logged_in", "true")
      router.push("/admin/dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img src="/logo.png" alt="MP Government Logo" className="w-20 h-20 mx-auto bg-white rounded-full p-2" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800">Admin Login</CardTitle>
          <p className="text-gray-600">Madhya Pradesh Tourism Board</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900">
              Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="text-blue-800 border-blue-800 hover:bg-blue-50"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
