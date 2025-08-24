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
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-green-600" />
						<h1 className="text-2xl font-bold">Agenda</h1>
					</div>
					<Button asChild variant="ghost">
						<Link href="/">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Terug
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
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