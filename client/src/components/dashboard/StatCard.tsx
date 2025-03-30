import { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: {
    value: number;
    type: "increase" | "decrease" | "neutral";
    label?: string;
  };
}

export default function StatCard({ title, value, icon, change }: StatCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
            {change && (
              <div className="mt-1 flex items-center">
                <span 
                  className={`flex items-center text-xs font-medium ${
                    change.type === "increase" 
                      ? "text-success-500" 
                      : change.type === "decrease" 
                        ? "text-danger-500" 
                        : "text-gray-500"
                  }`}
                >
                  {change.type === "increase" ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                  ) : change.type === "decrease" ? (
                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                  ) : null}
                  {Math.abs(change.value)}%
                </span>
                {change.label && (
                  <span className="ml-1.5 text-xs text-gray-500">{change.label}</span>
                )}
              </div>
            )}
          </div>
          <div className="rounded-full p-2 bg-blue-50 text-blue-500">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
