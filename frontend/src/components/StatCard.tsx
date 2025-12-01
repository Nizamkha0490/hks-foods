import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon?: LucideIcon
  iconBg?: string
}

const StatCard = ({ title, value, icon: Icon, iconBg }: StatCardProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${iconBg || 'bg-primary'}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  )
}

export default StatCard
export { StatCard }
