"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, ArrowLeft } from "lucide-react"

export default function NewPlantPage() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<Button asChild variant="ghost" className="mb-6">
				<Link href="/plants">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Terug naar Planten
				</Link>
			</Button>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Leaf className="h-5 w-5 text-green-600" />
						Nieuwe Plant
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						Deze pagina is nog in ontwikkeling. Voeg voorlopig planten toe via een plantvak.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}