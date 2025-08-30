"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react"
import { WeeklyTaskList } from "@/components/tasks/weekly-task-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const dynamic = 'force-dynamic'

export default function AgendaPage() {
	return (
		<ProtectedRoute>
			<div className="container mx-auto px-4 py-6 max-w-5xl">
				{/* Minimalist Header */}
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
						<h1 className="text-xl font-semibold">Agenda</h1>
					</div>
					<Button 
						asChild 
						variant="ghost"
						className="h-8 px-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 hover:bg-green-50 dark:bg-green-950 dark:hover:bg-green-950/30"
					>
						<Link href="/">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Terug
						</Link>
					</Button>
				</div>

				<Card className="border-2 border-green-200 dark:border-green-800">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg">Weekoverzicht</CardTitle>
					</CardHeader>
					<CardContent>
						<WeeklyTaskList />
					</CardContent>
				</Card>
			</div>
		</ProtectedRoute>
	)
}