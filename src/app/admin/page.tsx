import { prisma } from "@/lib/prisma";
import { Users, CreditCard, Eye, TrendingUp } from "lucide-react";
import AdminCharts from "@/components/AdminCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function getStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [userCount, cardCount, viewCount, recentUsers, monthlyUsers, monthlyCards] = await Promise.all([
    prisma.user.count(),
    prisma.card.count(),
    prisma.cardView.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.card.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Process chart data
  const chartDataMap = new Map();
  
  // Initialize last 30 days
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chartDataMap.set(dateStr, { date: dateStr, users: 0, cards: 0 });
  }

  monthlyUsers.forEach(u => {
    const dateStr = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDataMap.has(dateStr)) {
      chartDataMap.get(dateStr).users++;
    }
  });

  monthlyCards.forEach(c => {
    const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDataMap.has(dateStr)) {
      chartDataMap.get(dateStr).cards++;
    }
  });

  const chartData = Array.from(chartDataMap.values()).reverse();

  return { userCount, cardCount, viewCount, recentUsers, chartData };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats.userCount,
      description: "Registered users",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Cards",
      value: stats.cardCount,
      description: "Cards created",
      icon: CreditCard,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Total Views",
      value: stats.viewCount,
      description: "All time views",
      icon: Eye,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Active Now",
      value: "-",
      description: "Real-time data",
      icon: TrendingUp,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Monitor your platform's key metrics and user activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7">
          <AdminCharts data={stats.chartData} />
        </div>
        
        <Card className="col-span-7 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest users who joined the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user, index) => (
                <div key={user.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{user.name || "No Name"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {index < stats.recentUsers.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
