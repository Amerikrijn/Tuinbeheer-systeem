"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Move, Trash2, Edit, X, RefreshCw } from "lucide-react"
import { getMockPlantBeds, type Plant } from "@/lib/mock-data"

interface BulkOperationsPanelProps {
  selectedCount: number
  onMove: (targetBedId: string) => Promise<void>
  onDelete: () => Promise<void>
  onUpdate: (updates: Partial<Plant>) => Promise<void>
  onCancel: () => void
  currentBedId: string
}

export function BulkOperationsPanel({
  selectedCount,
  onMove,
  onDelete,
  onUpdate,
  onCancel,
  currentBedId,
}: BulkOperationsPanelProps) {
  const [activeOperation, setActiveOperation] = useState<"move" | "update" | "delete" | null>(null)
  const [loading, setLoading] = useState(false)
  const [targetBedId, setTargetBedId] = useState("")
  const [updateData, setUpdateData] = useState({
    color: "",
    status: "",
    notes: "",
  })

  const plantBeds = getMockPlantBeds().filter((bed) => bed.id !== currentBedId)
  const colorOptions = ["Wit", "Geel", "Oranje", "Rood", "Roze", "Paars", "Blauw", "Groen", "Bruin", "Zwart", "Gemengd"]
  const statusOptions = ["Gezond", "Ziek", "Herstellend", "Nieuw geplant", "Te verplaatsen"]

  const handleMove = async () => {
    if (!targetBedId) return
    setLoading(true)
    try {
      await onMove(targetBedId)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    const updates: Partial<Plant> = {}
    if (updateData.color) updates.color = updateData.color
    if (updateData.status) updates.status = updateData.status
    if (updateData.notes) updates.notes = updateData.notes

    if (Object.keys(updates).length === 0) return

    setLoading(true)
    try {
      await onUpdate(updates)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className=""border-blue-200 bg-blue-50 dark:bg-blue-950">
      <CardHeader>
        <div className=""flex items-center justify-between">
          <CardTitle className=""flex items-center gap-2 text-blue-800">
            <Edit className=""h-5 w-5" />
            Bulk Operaties
            <Badge variant="secondary" className=""ml-2">
              {selectedCount} geselecteerd
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className=""h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!activeOperation ? (
          <div className=""grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className=""h-auto p-4 flex flex-col items-center gap-2 bg-card"
              onClick={() => setActiveOperation("move")}
              disabled={selectedCount === 0}
            >
              <Move className=""h-6 w-6 text-primary" />
              <div className=""text-center">
                <div className=""font-medium text-foreground">Verplaatsen</div>
                <div className=""text-sm text-muted-foreground">Naar ander plantvak</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className=""h-auto p-4 flex flex-col items-center gap-2 bg-card"
              onClick={() => setActiveOperation("update")}
              disabled={selectedCount === 0}
            >
              <Edit className=""h-6 w-6 text-green-600 dark:text-green-400" />
              <div className=""text-center">
                <div className=""font-medium text-foreground">Bijwerken</div>
                <div className=""text-sm text-muted-foreground">Eigenschappen wijzigen</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className=""h-auto p-4 flex flex-col items-center gap-2 bg-card"
              onClick={() => setActiveOperation("delete")}
              disabled={selectedCount === 0}
            >
              <Trash2 className=""h-6 w-6 text-destructive" />
              <div className=""text-center">
                <div className=""font-medium text-foreground">Verwijderen</div>
                <div className=""text-sm text-muted-foreground">Permanent verwijderen</div>
              </div>
            </Button>
          </div>
        ) : (
          <div className=""space-y-4">
            {activeOperation === "move" && (
              <div className=""space-y-4">
                <div className=""flex items-center gap-2">
                  <Move className=""h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className=""font-medium">Planten verplaatsen</h3>
                </div>
                <p className=""text-sm text-gray-600 dark:text-gray-300">
                  Verplaats {selectedCount} geselecteerde planten naar een ander plantvak.
                </p>
                <div className=""space-y-2">
                  <Label htmlFor="targetBed">Doel plantvak</Label>
                  <Select value={targetBedId} onValueChange={setTargetBedId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer plantvak" />
                    </SelectTrigger>
                    <SelectContent>
                      {plantBeds.map((bed) => (
                        <SelectItem key={bed.id} value={bed.id}>
                          {bed.id} - {bed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className=""flex gap-2">
                  <Button
                    onClick={handleMove}
                    disabled={!targetBedId || loading}
                    className=""bg-blue-600 dark:bg-blue-700 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className=""h-4 w-4 mr-2 animate-spin" />
                        Verplaatsen...
                      </>
                    ) : (
                      <>
                        <Move className=""h-4 w-4 mr-2" />
                        Verplaatsen
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveOperation(null)}>
                    Annuleren
                  </Button>
                </div>
              </div>
            )}

            {activeOperation === "update" && (
              <div className=""space-y-4">
                <div className=""flex items-center gap-2">
                  <Edit className=""h-5 w-5 text-green-600" />
                  <h3 className=""font-medium">Planten bijwerken</h3>
                </div>
                <p className=""text-sm text-gray-600 dark:text-gray-300">
                  Werk eigenschappen bij van {selectedCount} geselecteerde planten.
                </p>
                <div className=""grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className=""space-y-2">
                    <Label htmlFor="bulkColor">Kleur</Label>
                    <Select
                      value={updateData.color}
                      onValueChange={(value) => setUpdateData((prev) => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer kleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=""space-y-2">
                    <Label htmlFor="bulkStatus">Status</Label>
                    <Select
                      value={updateData.status}
                      onValueChange={(value) => setUpdateData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className=""space-y-2">
                  <Label htmlFor="bulkNotes">Notities toevoegen</Label>
                  <Textarea
                    id="bulkNotes"
                    value={updateData.notes}
                    onChange={(e) => setUpdateData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Extra notities voor alle geselecteerde planten..."
                    rows={3}
                  />
                </div>
                <div className=""flex gap-2">
                  <Button onClick={handleUpdate} disabled={loading} className=""bg-green-600 dark:bg-green-700 hover:bg-green-700">
                    {loading ? (
                      <>
                        <RefreshCw className=""h-4 w-4 mr-2 animate-spin" />
                        Bijwerken...
                      </>
                    ) : (
                      <>
                        <Edit className=""h-4 w-4 mr-2" />
                        Bijwerken
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveOperation(null)}>
                    Annuleren
                  </Button>
                </div>
              </div>
            )}

            {activeOperation === "delete" && (
              <div className=""space-y-4">
                <div className=""flex items-center gap-2">
                  <Trash2 className=""h-5 w-5 text-red-600 dark:text-red-400" />
                  <h3 className=""font-medium text-red-700 dark:text-red-300">Planten verwijderen</h3>
                </div>
                <div className=""bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-4">
                  <p className=""text-red-800 font-medium mb-2">⚠️ Waarschuwing</p>
                  <p className=""text-red-700 dark:text-red-300 text-sm">
                    Je staat op het punt om {selectedCount} planten permanent te verwijderen. Deze actie kan niet
                    ongedaan worden gemaakt.
                  </p>
                </div>
                <div className=""flex gap-2">
                  <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className=""h-4 w-4 mr-2 animate-spin" />
                        Verwijderen...
                      </>
                    ) : (
                      <>
                        <Trash2 className=""h-4 w-4 mr-2" />
                        Ja, Verwijderen
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveOperation(null)}>
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
