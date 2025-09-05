'use client'

import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import CountrySelector from './components/CountrySelector'

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState('US')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            CultureChat
          </h1>
          <p className="text-gray-600">
            문화적 배려가 담긴 매너있는 채팅 서비스
          </p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <CountrySelector 
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
          />
          <ChatInterface targetCountry={selectedCountry} />
        </div>
      </div>
    </main>
  )
}