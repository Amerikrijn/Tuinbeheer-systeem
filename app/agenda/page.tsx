"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react"

export default function AgendaPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<Button asChild variant="ghost" className="mb-6">
				<Link href="/">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Terug naar Home
				</Link>
			</Button>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-green-600" />
						Agenda
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						De agenda-functionaliteit komt hier beschikbaar. Voor nu: bekijk en beheer taken op de pagina Taken.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}