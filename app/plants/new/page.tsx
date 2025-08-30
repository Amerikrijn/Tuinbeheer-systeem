"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, ArrowLeft } from "lucide-react"

export default function NewPlantPage() {
	return (
		<div className=""container mx-auto px-4 py-6 max-w-2xl">
			{/* Minimalist Header */}
			<div className=""flex items-center gap-3 mb-4">
				<Button 
					asChild 
					variant="ghost" 
					className=""h-8 px-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-300 hover:bg-green-50 dark:bg-green-950 dark:hover:bg-green-950/30"
				>
					<Link href="/plants">
						<ArrowLeft className=""h-4 w-4 mr-2" />
						Terug
					</Link>
				</Button>

				<div className=""flex items-center gap-2">
					<Leaf className=""h-6 w-6 text-green-600 dark:text-green-400" />
					<h1 className=""text-xl font-semibold">Nieuwe Plant</h1>
				</div>
			</div>

			<Card className=""border-2 border-green-200 dark:border-green-800">
				<CardHeader className=""pb-3">
					<CardTitle className=""flex items-center gap-2 text-lg">
						<Leaf className=""h-5 w-5 text-green-600 dark:text-green-400" />
						Plant Toevoegen
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className=""text-muted-foreground text-sm">
						Deze pagina is nog in ontwikkeling. Voeg voorlopig planten toe via een plantvak.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}