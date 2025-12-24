"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit3,
  Eye,
  BarChart3,
  Settings,
  Share2,
  QrCode,
  Download,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  LogOut,
  CreditCard,
  Bell,
  Menu,
  X,
  ChevronRight,
  Trash2,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import ImageUpload from "@/components/ImageUpload";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ChatInterface from "@/components/ChatInterface";
import CardBuilder from "@/components/CardBuilder";
import CardDisplay from "@/components/CardDisplay";
import QRCodeModal from "@/components/QRCodeModal";
import PaymentModal from "@/components/PaymentModal";
import { PaymentSuccessModal } from "@/components/PaystackPayment";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("cards"); // cards, analytics, settings
  const [editData, setEditData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createdCard, setCreatedCard] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userCards, setUserCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const isAdmin = user?.role === "admin";

  // Load user cards from database
  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user]);

  const fetchUserCards = async () => {
    try {
      setCardsLoading(true);
      const response = await fetch('/api/cards');
      if (response.ok) {
        const { cards } = await response.json();
        setUserCards(cards || []);
        // Set the most recent card as the displayed card
        if (cards && cards.length > 0) {
          const latestCard = cards[0];
          setCreatedCard({
            id: latestCard.id,
            cardId: latestCard.cardId,
            template: { id: latestCard.templateId },
            formData: latestCard.formData,
            createdAt: latestCard.createdAt
          });
        }
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      const profileData = response?.profile;

      if (profileData) {
        setProfile(profileData);
        setEditData(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await updateProfile(user.id, editData);
      if (error) throw error;

      setProfile(editData);
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const generateVCF = () => {
    if (!profile) return;

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name || ""}
ORG:${profile.company || ""}
TITLE:${profile.job_title || ""}
TEL:${profile.phone || ""}
EMAIL:${profile.email || ""}
URL:${profile.website_url || ""}
NOTE:${profile.bio || ""}
END:VCARD`;

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.full_name || "contact"}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "cards", label: "Make Card", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "support", label: "Support Chat", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (isAdmin) {
    tabs.push({ id: "admin", label: "Admin Dashboard", icon: Shield, href: "/admin" });
  }

  const handleCardComplete = (cardData) => {
    setCreatedCard(cardData);
    // Refresh the cards list
    fetchUserCards();
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.cardId);
    setCreatedCard({
      id: card.id,
      cardId: card.cardId,
      template: { id: card.templateId },
      formData: card.formData,
      createdAt: card.createdAt
    });
    setActiveTab('cards');
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Card deleted successfully');
        // Clear displayed card if it was the deleted one
        if (createdCard?.cardId === cardId) {
          setCreatedCard(null);
        }
        // Refresh cards list
        fetchUserCards();
      } else {
        throw new Error('Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const generateVCFFromCard = () => {
    if (!createdCard || !createdCard.formData) {
      alert('Please create a card first');
      return;
    }

    const data = createdCard.formData;
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ''}
ORG:${data.company || ''}
TITLE:${data.title || data.jobTitle || ''}
TEL:${data.phone || ''}
EMAIL:${data.email || ''}
URL:${data.website || ''}
NOTE:${data.bio || ''}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name || data.username || 'contact'}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getCardURL = () => {
    if (createdCard && createdCard.formData && createdCard.formData.username) {
      return `${window.location.origin}/card/${createdCard.formData.username}`;
    }
    return '';
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile sidebar when tab changes
  };

  const handlePaymentSuccess = (plan, data) => {
    setShowPaymentModal(false);
    setPaymentSuccessData({
      planType: plan.name,
      amount: plan.price,
      reference: data.reference
    });
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>

              <div className="hidden sm:flex items-center space-x-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <span>Welcome back,</span>
                <span className="font-medium text-gray-900 dark:text-white truncate max-w-32 sm:max-w-none">
                  {profile?.full_name || user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
               
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toast('Opening home — taking you there…')
                    router.push('/')
                  }}
                  className="inline-flex"
                >
                  Home
                </Button>
              
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white hidden sm:inline-flex"
                size="sm"
              >
                Upgrade
              </Button>

              <button
                onClick={signOut}
                className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-1 sm:ml-2 hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation - Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white">Navigation</h2>
              </div>
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  if (tab.id === 'admin') {
                    return (
                      <a
                        key={tab.id}
                        href={tab.href}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 mr-3 text-purple-600" />
                          <span className="text-purple-600 font-medium">{tab.label}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-purple-600" />
                      </a>
                    );
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 mr-3" />
                        {tab.label}
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}
                
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowPaymentModal(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-left text-green-600 hover:bg-green-50 transition-colors mt-2 border border-green-200"
                >
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span className="font-medium">Upgrade</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>

              {/* Mobile Quick Stats */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Profile Views</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Contact Saves</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Profile Complete</span>
                    <span className="font-medium text-green-600">
                      {profile
                        ? Math.round(
                            (Object.values({
                              name: profile.full_name,
                              email: profile.email,
                              phone: profile.phone,
                              company: profile.company,
                              bio: profile.bio,
                            }).filter(Boolean).length /
                              5) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
                  <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  if (tab.id === 'admin') {
                    return (
                      <a
                        key={tab.id}
                        href={tab.href}
                        className="w-full flex items-center px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <IconComponent className="w-5 h-5 mr-3 text-purple-600" />
                        <span className="text-purple-600 font-medium">{tab.label}</span>
                      </a>
                    );
                  }
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Desktop Quick Stats */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Profile Views</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Contact Saves</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Profile Complete</span>
                    <span className="font-medium text-green-600">
                      {profile
                        ? Math.round(
                            (Object.values({
                              name: profile.full_name,
                              email: profile.email,
                              phone: profile.phone,
                              company: profile.company,
                              bio: profile.bio,
                            }).filter(Boolean).length /
                              5) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "cards" && (
              <div className="space-y-6">
                {/* Card Builder and Display Grid */}
                {cardsLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                    <div className="h-[600px] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-[600px] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card Builder - Left Side */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                      <CardBuilder onCardComplete={handleCardComplete} editingCard={editingCardId ? createdCard : null} />
                    </div>

                    {/* Card Display - Right Side */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                      <CardDisplay cardData={createdCard} isEditable={true} />
                    
                    {/* Card Link, Edit and Delete buttons underneath the card */}
                    {createdCard && createdCard.formData && createdCard.formData.username && (
                        <div className="md:bottom-[11rem] mt-10 bottom-[14rem]  md:bottom-0 space-y-4 relative z-10">
                        {/* Card Link */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">Your Card Link:</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={getCardURL()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 underline break-all flex-1"
                            >
                              {getCardURL()}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(getCardURL());
                                alert('Link copied to clipboard!');
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                              title="Copy link"
                            >
                              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditCard({
                              id: createdCard.id,
                              cardId: createdCard.cardId,
                              templateId: createdCard.template?.id,
                              formData: createdCard.formData,
                              createdAt: createdCard.createdAt
                            })}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Card
                          </button>
                          <button
                            onClick={() => handleDeleteCard(createdCard.cardId)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Card
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                )}

            
                {/* Quick Actions - Only show when card exists */}
                {createdCard && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 relative z-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={generateVCFFromCard}
                  disabled={!createdCard}
                  className="flex items-center justify-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Download VCF
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {createdCard ? 'Save your card' : 'Create card first'}
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => setShowQRModal(true)}
                  disabled={!createdCard || !createdCard.formData?.username}
                  className="flex items-center justify-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      QR Code
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {createdCard ? 'Generate & share' : 'Create card first'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center justify-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors w-full"
                >
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Upgrade
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Get premium features
                    </p>
                  </div>
                </button>
              </div>
            </div>
              )}
          </div>
        )}

            {activeTab === "analytics" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <AnalyticsDashboard profileId={profile?.id} userId={user?.id} />
              </div>
            )}

            {activeTab === "support" && (
              <div className="max-w-4xl mx-auto">
                <ChatInterface />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Account Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Email Address
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 self-start sm:self-auto">
                        Change
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last updated 30 days ago
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 self-start sm:self-auto">
                        Update
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Profile URL
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 break-all sm:break-normal">
                          {profile?.username
                            ? `1necard.co/${profile.username}`
                            : "Not set"}
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 self-start sm:self-auto">
                        Customize
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Notifications
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Profile Views",
                        description:
                          "Get notified when someone views your profile",
                      },
                      {
                        name: "Weekly Reports",
                        description: "Receive weekly analytics summaries",
                      },
                      {
                        name: "Product Updates",
                        description: "Stay informed about new features",
                      },
                    ].map((notification, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between py-3 border-b border-gray-200 last:border-0 space-x-4"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {notification.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {notification.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-red-900 dark:text-red-300 mb-4">
                    Danger Zone
                  </h2>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-red-200 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Deactivate Account
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Temporarily disable your profile
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded self-start sm:self-auto">
                        Deactivate
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Delete Account
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Permanently delete your account and data
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded self-start sm:self-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={getCardURL()}
        username={createdCard?.formData?.username || ''}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        paymentData={paymentSuccessData}
      />

      {/* Bottom padding for mobile */}
      <div className="h-4 sm:h-0"></div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
