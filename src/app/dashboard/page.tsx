"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit3,
  Eye,
  BarChart3,
  Settings,
  QrCode,
  Download,
  ExternalLink,
  LogOut,
  CreditCard,
  Menu,
  X,
  Trash2,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import ChatInterface from "@/components/ChatInterface";
import CardBuilder from "@/components/CardBuilder";
import CardDisplay from "@/components/CardDisplay";
import QRCodeModal from "@/components/QRCodeModal";
import PaymentModal from "@/components/PaymentModal";
import { PaymentSuccessModal } from "@/components/PaystackPayment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";

function DashboardContent() {
  const { user, signOut } = useAuth() as any;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");
  const [editData, setEditData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createdCard, setCreatedCard] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userCards, setUserCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const isAdmin = user?.role === "admin";

  // Load user cards from database
  useEffect(() => {
    if (user) {
      fetchUserCards();
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/user/subscription?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const { subscription } = await response.json();
        console.log('Fetched subscription:', subscription);
        setSubscription(subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchUserCards = async () => {
    try {
      setCardsLoading(true);
      const response = await fetch('/api/cards');
      if (response.ok) {
        const { cards } = await response.json();
        setUserCards(cards || []);
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
      toast.error('Failed to load cards');
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

  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Updating profile...");

    try {
      const result = await updateProfile(editData);
      if (!result) throw new Error("Failed to update profile");

      setProfile(editData);
      setEditMode(false);
      toast.success("Profile updated successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", { id: loadingToast });
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

  const handleCardComplete = (cardData) => {
    setCreatedCard(cardData);
    setUserCards(prev => [cardData, ...prev]);
    setEditMode(false);
    toast.success("Card created successfully!");
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

    const loadingToast = toast.loading("Deleting card...");

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Card deleted successfully', { id: loadingToast });
        if (createdCard?.cardId === cardId) {
          setCreatedCard(null);
        }
        fetchUserCards();
      } else {
        throw new Error('Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card. Please try again.', { id: loadingToast });
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
    setSidebarOpen(false);
  };

  const handlePaymentSuccess = (plan: any, data: any) => {
    setShowPaymentModal(false);
    setPaymentSuccessData({
      planType: plan.name,
      amount: plan.price,
      reference: data.reference
    });
    setShowSuccessModal(true);
    // We'll fetch subscription when they click "Continue" to ensure they see the success message first
    // and to allow time for the webhook/verification to complete.
  };

  const handleSuccessModalClose = async () => {
    setVerifyingSubscription(true);
    try {
      // Poll for subscription update a few times if needed, or just fetch once.
      // Let's try fetching immediately, if it's not active, maybe wait a sec and try again?
      // For now, just a simple fetch.
      await fetchSubscription();
      
      // Optional: Add a small delay to make the interaction feel smoother
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Re-fetch to be sure
      await fetchSubscription();
      await fetchUserCards();
    } catch (error) {
      console.error("Error verifying subscription:", error);
    } finally {
      setVerifyingSubscription(false);
      setShowSuccessModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <h1 className="text-lg sm:text-2xl font-bold">Dashboard</h1>

              <div className="hidden sm:flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                <span>Welcome back,</span>
                <span className="font-medium text-foreground truncate max-w-32 sm:max-w-none">
                  {profile?.full_name || user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <ModeToggle />
              
              {(!subscription || subscription.status !== 'active') && (
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white hidden sm:inline-flex"
                  size="sm"
                >
                  Upgrade (Premium)
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
                <span className="ml-1 sm:ml-2 hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-card shadow-xl">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Navigation</h2>
              </div>
              <nav className="p-4 space-y-2">
                <Button
                  variant={activeTab === "cards" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange("cards")}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Make Card
                </Button>
                <Button
                  variant={activeTab === "analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange("analytics")}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Analytics
                </Button>
                <Button
                  variant={activeTab === "support" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange("support")}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Support Chat
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleTabChange("settings")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/admin">
                      <Shield className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="text-purple-600">Admin Dashboard</span>
                    </a>
                  </Button>
                )}
              </nav>

              {/* Mobile Quick Stats */}
              {/* Removed Quick Stats */}
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-card border-r min-h-screen">
            <div className="p-6">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === "cards" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("cards")}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Make Card
                </Button>
                <Button
                  variant={activeTab === "analytics" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Analytics
                </Button>
                <Button
                  variant={activeTab === "support" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("support")}
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Support Chat
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="/admin">
                      <Shield className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="text-purple-600">Admin Dashboard</span>
                    </a>
                  </Button>
                )}
              </nav>

              {/* Desktop Quick Stats */}
              {/* Removed Quick Stats */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "cards" && (
              <div className="space-y-6">
                {cardsLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                    <div className="h-[600px] bg-muted rounded-lg"></div>
                    <div className="h-[600px] bg-muted rounded-lg"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card Builder */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Create Your Card</CardTitle>
                        <CardDescription>Design your digital business card</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(!subscription || subscription.status !== 'active') && !isAdmin ? (
                           <div className="text-center py-12">
                             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                               <CreditCard className="w-8 h-8 text-primary" />
                             </div>
                             <h3 className="text-lg font-semibold mb-2">Create a New Card</h3>
                             <p className="text-muted-foreground mb-6">
                               You need an active subscription to create a card.
                             </p>
                             <Button onClick={() => setShowPaymentModal(true)}>
                               Subscribe Now
                             </Button>
                           </div>
                        ) : (
                           <CardBuilder onCardComplete={handleCardComplete} editingCard={editingCardId ? createdCard : null} />
                        )}
                      </CardContent>
                    </Card>

                    {/* Card Display */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Card Preview</CardTitle>
                        <CardDescription>See how your card looks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CardDisplay cardData={createdCard} isEditable={true} />
                    
                        {createdCard && createdCard.formData && createdCard.formData.username && (
                          <div className="mt-6 space-y-4">
                            {/* Card Link */}
                            <div className="p-4 bg-muted rounded-lg border">
                              <p className="text-xs font-medium mb-2">Your Card Link:</p>
                              <div className="flex items-center gap-2">
                                <a
                                  href={getCardURL()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline break-all flex-1"
                                >
                                  {getCardURL()}
                                </a>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    navigator.clipboard.writeText(getCardURL());
                                    alert('Link copied to clipboard!');
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </Button>
                              </div>
                            </div>

                            {/* Edit and Delete Buttons */}
                            <div className="flex gap-3">
                              <Button
                                className="flex-1"
                                onClick={() => handleEditCard({
                                  id: createdCard.id,
                                  cardId: createdCard.cardId,
                                  templateId: createdCard.template?.id,
                                  formData: createdCard.formData,
                                  createdAt: createdCard.createdAt
                                })}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Card
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleDeleteCard(createdCard.cardId)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Card
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Quick Actions */}
                {createdCard && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Manage and share your card</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="h-auto flex-col items-start p-4"
                          onClick={generateVCFFromCard}
                          disabled={!createdCard}
                        >
                          <Download className="w-5 h-5 mb-2" />
                          <div className="text-left">
                            <p className="font-medium text-sm">Download VCF</p>
                            <p className="text-xs text-muted-foreground">
                              {createdCard ? 'Save your card' : 'Create card first'}
                            </p>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-auto flex-col items-start p-4"
                          onClick={() => setShowQRModal(true)}
                          disabled={!createdCard || !createdCard.formData?.username}
                        >
                          <QrCode className="w-5 h-5 mb-2" />
                          <div className="text-left">
                            <p className="font-medium text-sm">QR Code</p>
                            <p className="text-xs text-muted-foreground">
                              {createdCard ? 'Generate & share' : 'Create card first'}
                            </p>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Track your card performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard profileId={profile?.id} userId={user?.id} />
                </CardContent>
              </Card>
            )}

            {activeTab === "support" && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Support Chat</CardTitle>
                    <CardDescription>Get help from our support team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChatInterface />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 max-w-4xl">
                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">Email Address</h3>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Button variant="ghost" size="sm">Change</Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="font-medium">Password</h3>
                        <p className="text-sm text-muted-foreground">Last updated 30 days ago</p>
                      </div>
                      <Button variant="ghost" size="sm">Update</Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">Profile URL</h3>
                        <p className="text-sm text-muted-foreground break-all">
                          {profile?.username ? `1necard.co/${profile.username}` : "Not set"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">Customize</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: "Profile Views", description: "Get notified when someone views your profile" },
                      { name: "Weekly Reports", description: "Receive weekly analytics summaries" },
                      { name: "Product Updates", description: "Stay informed about new features" },
                    ].map((notification, index) => (
                      <div key={index} className="flex items-start justify-between py-3 border-b last:border-0 space-x-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm">{notification.name}</h3>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">Deactivate Account</h3>
                        <p className="text-sm text-muted-foreground">Temporarily disable your profile</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive">
                        Deactivate
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
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
        onClose={handleSuccessModalClose}
        paymentData={paymentSuccessData}
        loading={verifyingSubscription}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute loadingComponent={null}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
