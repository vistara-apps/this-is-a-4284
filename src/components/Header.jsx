import React from 'react'
import { Shield, Menu, User } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

function Header({ user, onLanguageChange }) {
  return (
    <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-white" />
            <span className="text-xl font-semibold text-white">
              PocketJustice
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector
              selectedLanguage={user.preferredLanguage}
              onLanguageChange={onLanguageChange}
            />
            
            <div className="flex items-center space-x-2 text-white">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">
                {user.subscriptionStatus === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            
            <button className="p-2 text-white hover:bg-white/10 rounded-md transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header