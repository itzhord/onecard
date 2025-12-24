'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Shield, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MoreVertical,
  Calendar,
  MapPin,
  Activity,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'
import { NativeSelect, NativeSelectOption } from './ui/NativeSelect'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeCards: 892,
    totalRevenue: 45000,
    monthlyGrowth: 12.5
  })
  const [users] = useState([
    {
      id: 1,
      full_name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      company: 'Tech Corp',
      job_title: 'Software Engineer',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      profile_image_url: null,
      user_id: 'user_1'
    },
    {
      id: 2,
      full_name: 'Sarah Johnson',
      username: 'sarahj',
      email: 'sarah@company.com',
      phone: '+1 234 567 8901',
      company: 'Design Studio',
      job_title: 'UI Designer',
      is_active: true,
      created_at: '2024-01-20T14:30:00Z',
      profile_image_url: null,
      user_id: 'user_2'
    },
    {
      id: 3,
      full_name: 'Mike Chen',
      username: 'mikechen',
      email: 'mike@startup.io',
      phone: null,
      company: 'StartupXYZ',
      job_title: 'Product Manager',
      is_active: false,
      created_at: '2024-02-01T09:15:00Z',
      profile_image_url: null,
      user_id: 'user_3'
    }
  ])
  const [loading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserActions, setShowUserActions] = useState(null)

  const handleUserAction = async (userId, action) => {
    console.log(`${action} user:`, userId)
    setShowUserActions(null)
    // Simulate API call
  }

  const exportData = () => {
    console.log('Exporting data...')
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesFilter
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const chartData = {
    userGrowth: [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 180 },
      { month: 'Mar', users: 250 },
      { month: 'Apr', users: 320 },
      { month: 'May', users: 410 },
      { month: 'Jun', users: 480 }
    ],
    revenue: [
      { month: 'Jan', revenue: 3000 },
      { month: 'Feb', revenue: 4500 },
      { month: 'Mar', revenue: 6200 },
      { month: 'Apr', revenue: 8100 },
      { month: 'May', revenue: 9800 },
      { month: 'Jun', revenue: 12000 }
    ]
  }

  const recentActivity = [
    { action: 'New user registered', user: 'john@example.com', time: '2 minutes ago', type: 'user' },
    { action: 'Card activated', user: 'sarah@company.com', time: '15 minutes ago', type: 'card' },
    { action: 'Payment received', user: 'Premium Plan - $45', time: '1 hour ago', type: 'payment' },
    { action: 'Profile updated', user: 'mike@startup.io', time: '2 hours ago', type: 'update' },
    { action: 'Support ticket', user: 'Issue with QR code', time: '3 hours ago', type: 'support' }
  ]

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Cards - Mobile-optimized grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-lg lg:text-3xl font-bold text-slate-800">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+{stats.monthlyGrowth}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Active Cards</p>
              <p className="text-lg lg:text-3xl font-bold text-slate-800">{stats.activeCards.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+8.2%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-lg lg:text-3xl font-bold text-slate-800">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+15.3%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Growth Rate</p>
              <p className="text-lg lg:text-3xl font-bold text-slate-800">{stats.monthlyGrowth}%</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <Activity className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500 mr-1" />
            <span className="text-blue-500 font-medium">Monthly</span>
          </div>
        </motion.div>
      </div>

      {/* Charts - Stacked on mobile, side by side on desktop */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6">User Growth</h3>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6">Monthly Revenue</h3>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
      >
        <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6">Recent Activity</h3>
        <div className="space-y-3 lg:space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-400' :
                  activity.type === 'card' ? 'bg-green-400' :
                  activity.type === 'payment' ? 'bg-purple-400' :
                  activity.type === 'update' ? 'bg-orange-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate max-w-48 lg:max-w-none">{activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Users Header - Mobile optimized */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Users Management</h2>
          <p className="text-sm lg:text-base text-gray-600">Manage user accounts and profiles</p>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            onClick={exportData}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters - Mobile optimized */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* Replaced native select with shadcn-style NativeSelect for better light/dark contrast */}
          <div className="min-w-0 lg:min-w-32">
            <NativeSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter status"
            >
              <NativeSelectOption value="all">All Status</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Mobile Users List */}
      <div className="block lg:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {user.profile_image_url ? (
                    <img src={user.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{user.full_name || 'N/A'}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  <p className="text-xs text-gray-600 truncate mb-1">{user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user.company || 'No company'} • {user.job_title || 'No title'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserActions(showUserActions === user.id ? null : user.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
                
                {showUserActions === user.id && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-36">
                    <button
                      onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </button>
                    <button
                      onClick={() => handleUserAction(user.user_id, user.is_active ? 'deactivate' : 'activate')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleUserAction(user.user_id, 'delete')}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {user.profile_image_url ? (
                          <img src={user.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.company || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{user.job_title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.user_id, user.is_active ? 'deactivate' : 'activate')}
                        className={`${user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.user_id, 'delete')}
                        className="text-red-600 hover:text-red-700"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCards = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Cards Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Generate Batch
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Card management functionality coming soon...</p>
      </div>
    </div>
  )

  const renderRevenue = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Revenue Analytics</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Revenue analytics coming soon...</p>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-4 lg:space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-slate-800">System Settings</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">System settings coming soon...</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Admin Panel</h1>
            <p className="text-sm text-gray-600">Onecard System</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-gray-600">Onecard System Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <div className={`
            fixed lg:relative top-0 left-0 h-full lg:h-auto w-64 lg:w-64 z-40 lg:z-0
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            transition-transform duration-200 ease-in-out lg:transition-none
            bg-white lg:bg-transparent pt-20 lg:pt-0
          `}>
            <div className="bg-white rounded-lg border border-gray-200 p-4 mx-4 lg:mx-0 mt-4 lg:mt-0">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false) // Close mobile menu after selection
                      }}
                      className={`w-full flex items-center px-3 py-3 lg:py-2 rounded-lg text-left transition-colors touch-manipulation ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'cards' && renderCards()}
            {activeTab === 'revenue' && renderRevenue()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  )
}