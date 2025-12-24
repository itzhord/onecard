'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Eye, 
  Users, 
  MapPin, 
  Smartphone, 
  Monitor, 
  TrendingUp,
  Download,
  Calendar,
  Clock,
  Share2,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Tablet,
  ChevronDown
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts'

export default function AnalyticsDashboard({ profileId = 'profile_1', userId = 'user_1' }) {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    contactSaves: 0,
    socialClicks: 0
  })
  const [viewsData, setViewsData] = useState([
    { date: 'Mon', views: 0, uniqueViews: 0 },
    { date: 'Tue', views: 0, uniqueViews: 0 },
    { date: 'Wed', views: 0, uniqueViews: 0 },
    { date: 'Thu', views: 0, uniqueViews: 0 },
    { date: 'Fri', views: 0, uniqueViews: 0 },
    { date: 'Sat', views: 0, uniqueViews: 0 },
    { date: 'Sun', views: 0, uniqueViews: 0 }
  ])
  const [deviceData, setDeviceData] = useState([
    { name: 'Mobile', value: 0, color: '#3B82F6' },
    { name: 'Desktop', value: 0, color: '#10B981' },
    { name: 'Tablet', value: 0, color: '#F59E0B' },
  ])
  const [locationData, setLocationData] = useState([])
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(prev => ({ ...prev, ...data.analytics }));
          if (data.viewsData && data.viewsData.length > 0) setViewsData(data.viewsData);
          if (data.deviceData && data.deviceData.length > 0) setDeviceData(data.deviceData);
          if (data.locationData) setLocationData(data.locationData);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);
  const [comparisonData] = useState({
    totalViews: 2234,
    uniqueVisitors: 1567,
    contactSaves: 321,
    socialClicks: 234
  })
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false)

  const calculateGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const exportAnalytics = () => {
    console.log('Exporting analytics...')
  }

  const getTimeRangeLabel = (range) => {
    switch(range) {
      case '24h': return '24 Hours'
      case '7d': return '7 Days'
      case '30d': return '30 Days'
      case '90d': return '90 Days'
      default: return '7 Days'
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const recentActivity = [
    { action: 'Profile viewed', location: 'San Francisco, CA', time: '2m ago', device: 'Mobile', icon: Eye },
    { action: 'Contact saved', location: 'New York, NY', time: '15m ago', device: 'Desktop', icon: Download },
    { action: 'LinkedIn clicked', location: 'London, UK', time: '1h ago', device: 'Mobile', icon: Linkedin },
    { action: 'Profile viewed', location: 'Toronto, CA', time: '2h ago', device: 'Tablet', icon: Eye },
    { action: 'Website clicked', location: 'Berlin, DE', time: '3h ago', device: 'Desktop', icon: Globe }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">Profile Analytics</h2>
          <p className="text-sm lg:text-base text-gray-600">Track how people interact with your profile</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Mobile Time Range Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span>{getTimeRangeLabel(timeRange)}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTimeRangeDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTimeRangeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                {[
                  { key: '24h', label: '24 Hours' },
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '30 Days' },
                  { key: '90d', label: '90 Days' }
                ].map((range) => (
                  <button
                    key={range.key}
                    onClick={() => {
                      setTimeRange(range.key)
                      setShowTimeRangeDropdown(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      timeRange === range.key ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Time Range Selector */}
          <div className="hidden sm:flex bg-white rounded-lg border border-gray-200 p-1">
            {[
              { key: '24h', label: '24h' },
              { key: '7d', label: '7d' },
              { key: '30d', label: '30d' },
              { key: '90d', label: '90d' }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === range.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={exportAnalytics}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-sm touch-manipulation"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Total Views</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-800">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className={`w-3 h-3 lg:w-4 lg:h-4 mr-1 ${
              calculateGrowthPercentage(analytics.totalViews, comparisonData?.totalViews) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`} />
            <span className={`font-medium ${
              calculateGrowthPercentage(analytics.totalViews, comparisonData?.totalViews) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {calculateGrowthPercentage(analytics.totalViews, comparisonData?.totalViews) >= 0 ? '+' : ''}
              {calculateGrowthPercentage(analytics.totalViews, comparisonData?.totalViews)}%
            </span>
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
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Unique Visitors</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-800">{analytics.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className={`w-3 h-3 lg:w-4 lg:h-4 mr-1 ${
              calculateGrowthPercentage(analytics.uniqueVisitors, comparisonData?.uniqueVisitors) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`} />
            <span className={`font-medium ${
              calculateGrowthPercentage(analytics.uniqueVisitors, comparisonData?.uniqueVisitors) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {calculateGrowthPercentage(analytics.uniqueVisitors, comparisonData?.uniqueVisitors) >= 0 ? '+' : ''}
              {calculateGrowthPercentage(analytics.uniqueVisitors, comparisonData?.uniqueVisitors)}%
            </span>
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
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Contact Saves</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-800">{analytics.contactSaves.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className={`w-3 h-3 lg:w-4 lg:h-4 mr-1 ${
              calculateGrowthPercentage(analytics.contactSaves, comparisonData?.contactSaves) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`} />
            <span className={`font-medium ${
              calculateGrowthPercentage(analytics.contactSaves, comparisonData?.contactSaves) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {calculateGrowthPercentage(analytics.contactSaves, comparisonData?.contactSaves) >= 0 ? '+' : ''}
              {calculateGrowthPercentage(analytics.contactSaves, comparisonData?.contactSaves)}%
            </span>
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
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Social Clicks</p>
              <p className="text-lg lg:text-2xl font-bold text-slate-800">{analytics.socialClicks.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 lg:mt-4 text-xs lg:text-sm">
            <TrendingUp className={`w-3 h-3 lg:w-4 lg:h-4 mr-1 ${
              calculateGrowthPercentage(analytics.socialClicks, comparisonData?.socialClicks) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`} />
            <span className={`font-medium ${
              calculateGrowthPercentage(analytics.socialClicks, comparisonData?.socialClicks) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {calculateGrowthPercentage(analytics.socialClicks, comparisonData?.socialClicks) >= 0 ? '+' : ''}
              {calculateGrowthPercentage(analytics.socialClicks, comparisonData?.socialClicks)}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row - Stacked on mobile */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">Views Over Time</h3>
            <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
              <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Last {timeRange}</span>
            </div>
          </div>
          
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
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
                  dataKey="views" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="uniqueViews" 
                  stroke="#10B981" 
                  fillOpacity={0.1} 
                  fill="#10B981" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center mt-4 space-x-4 lg:space-x-6 text-xs lg:text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
              <span>Total Views</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Unique Views</span>
            </div>
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">Device Types</h3>
            <Smartphone className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-2">
            {deviceData.map((device, index) => (
              <div key={device.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: device.color || COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="capitalize">{device.name.toLowerCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs">
                    {Math.round((device.value / deviceData.reduce((sum, d) => sum + d.value, 0)) * 100)}%
                  </span>
                  <span className="font-medium">{device.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Location and Actions Analysis - Stacked on mobile */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">Top Locations</h3>
            <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {locationData.slice(0, 5).map((location, index) => (
              <div key={location.name} className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-6 h-6 bg-blue-100 rounded text-blue-600 text-xs flex items-center justify-center font-medium mr-3 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 text-sm truncate">{location.name}</span>
                </div>
                <div className="flex items-center ml-3">
                  <div className="w-16 lg:w-20 h-2 bg-gray-200 rounded-full mr-3">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ 
                        width: `${(location.value / Math.max(...locationData.map(l => l.value))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right flex-shrink-0">
                    {location.value}
                  </span>
                </div>
              </div>
            ))}
            
            {locationData.length > 5 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  +{locationData.length - 5} more locations
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">User Actions</h3>
            <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm lg:text-base">Profile Views</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-blue-600 ml-3">{analytics.totalViews.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-green-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <Download className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm lg:text-base">Contact Saves</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-green-600 ml-3">{analytics.contactSaves.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <Share2 className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm lg:text-base">Social Clicks</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-purple-600 ml-3">{analytics.socialClicks.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 lg:p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm lg:text-base">Unique Visitors</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-orange-600 ml-3">{analytics.uniqueVisitors.toLocaleString()}</span>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs lg:text-sm text-gray-600 mb-1">Contact Save Rate</p>
              <p className="text-xl lg:text-2xl font-bold text-slate-800">
                {analytics.totalViews > 0 
                  ? Math.round((analytics.contactSaves / analytics.totalViews) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500">of visitors save your contact</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
      >
        <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-4 lg:mb-6">Recent Activity</h3>
        
        <div className="space-y-3 lg:space-y-4">
          {recentActivity.map((activity, index) => {
            const IconComponent = activity.icon
            return (
              <div key={index} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.location} • {activity.device}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-3 flex-shrink-0">{activity.time}</span>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {recentActivity.length === 0 && (
          <div className="text-center py-8 lg:py-12">
            <BarChart3 className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No data yet</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Share your profile to start seeing analytics data here.</p>
          </div>
        )}
      </motion.div>

      {/* Mobile Performance Tips */}
      <div className="lg:hidden bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Boost Your Profile Performance</h4>
            <p className="text-xs text-blue-700 mb-2">
              Your profile is performing well! Consider adding more social links or updating your bio to increase engagement.
            </p>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
              Learn optimization tips →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}