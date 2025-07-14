"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlowerSelector } from '@/components/ui/flower-selector';
import { getPopularFlowers, getFlowersByCategory, FLOWER_CATEGORIES } from '@/lib/dutch-flowers';
import { Leaf, Palette, Info, Calendar, TreePine, Home } from 'lucide-react';
import Link from 'next/link';

export default function FlowerSelectorDemo() {
  const [selectedFlower, setSelectedFlower] = useState<string>('');
  const [selectedFlower2, setSelectedFlower2] = useState<string>('');
  const [selectedFlower3, setSelectedFlower3] = useState<string>('');

  const popularFlowers = getPopularFlowers().slice(0, 10);
  const categories = Object.entries(FLOWER_CATEGORIES);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Leaf className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌸 Nederlandse Bloemennamen Database
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kies gemakkelijk uit over 60 populaire Nederlandse bloemen met onze slimme bloemen selector.
          </p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <Home className="h-4 w-4 mr-2" />
                Terug naar Home
              </Button>
            </Link>
            <Link href="/visual-garden-demo">
              <Button variant="outline">
                <TreePine className="h-4 w-4 mr-2" />
                Visual Garden Designer
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Flower Selector */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-green-600" />
                Basis Bloemen Selector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FlowerSelector
                value={selectedFlower}
                onValueChange={setSelectedFlower}
                placeholder="Zoek een bloem..."
                showDetails={true}
                showCategories={true}
                showPopularFirst={true}
              />
              {selectedFlower && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Geselecteerd:</strong> {selectedFlower}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compact Flower Selector */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-blue-600" />
                Compacte Selector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FlowerSelector
                value={selectedFlower2}
                onValueChange={setSelectedFlower2}
                placeholder="Kies een bloem..."
                showDetails={false}
                showCategories={false}
                showPopularFirst={true}
              />
              {selectedFlower2 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Geselecteerd:</strong> {selectedFlower2}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Flower Selector */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5 text-purple-600" />
                Uitgebreide Selector met Alle Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FlowerSelector
                value={selectedFlower3}
                onValueChange={setSelectedFlower3}
                placeholder="Zoek je favoriete bloem..."
                showDetails={true}
                showCategories={true}
                showPopularFirst={true}
              />
              {selectedFlower3 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Geselecteerd:</strong> {selectedFlower3}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Deze bloem kan nu worden toegevoegd aan je plantvak in het Visual Garden Designer!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Database Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-green-600" />
                Database Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Totaal bloemen:</span>
                <Badge variant="secondary">60+</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Populaire bloemen:</span>
                <Badge variant="secondary">{popularFlowers.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Categorieën:</span>
                <Badge variant="secondary">{categories.length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Bloeiperioden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Voorjaar:</span>
                  <Badge variant="outline">Maart-Mei</Badge>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Zomer:</span>
                  <Badge variant="outline">Juni-Augustus</Badge>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Herfst:</span>
                  <Badge variant="outline">September-November</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Beschikbare Kleuren
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {['Wit', 'Geel', 'Roze', 'Rood', 'Paars', 'Blauw', 'Oranje'].map((color) => (
                  <Badge key={color} variant="secondary" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Flowers Preview */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Populaire Nederlandse Bloemen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {popularFlowers.map((flower) => (
                <Button
                  key={flower.name}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-2 text-xs"
                  onClick={() => setSelectedFlower(flower.name)}
                >
                  <div className="text-left w-full">
                    <div className="font-medium">{flower.name}</div>
                    <div className="text-xs text-gray-500">{flower.bloeiperiode}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-blue-600" />
              Bloem Categorieën
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(([key, label]) => {
                const categoryFlowers = getFlowersByCategory(key as any);
                return (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm text-gray-800 mb-1">{label}</div>
                    <div className="text-xs text-gray-600">
                      {categoryFlowers.length} bloemen
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {categoryFlowers.slice(0, 3).map(f => f.name).join(', ')}
                      {categoryFlowers.length > 3 && '...'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6 text-gray-600">
          <p className="text-sm">
            🌸 Nederlandse Bloemennamen Database - Gemaakt voor het Tuinbeheer Systeem
          </p>
          <p className="text-xs mt-2">
            Database bevat 60+ populaire Nederlandse bloemen met details over bloeiperiode, kleur en categorie.
          </p>
        </div>
      </div>
    </div>
  );
}