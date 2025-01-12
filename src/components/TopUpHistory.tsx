import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopUpData } from "./PettyCashTopUp";

interface TopUpHistoryProps {
  topUps: TopUpData[];
}

export function TopUpHistory({ topUps }: TopUpHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sejarah Penambahan Baki</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topUps.map((topUp, index) => (
            <div
              key={index}
              className="flex flex-col p-4 bg-secondary rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{topUp.date}</p>
                <p className="font-medium text-green-600">
                  + RM {topUp.amount.toFixed(2)}
                </p>
              </div>
              {topUp.notes && (
                <p className="text-sm text-gray-600">{topUp.notes}</p>
              )}
            </div>
          ))}
          {topUps.length === 0 && (
            <p className="text-center text-gray-500">
              Tiada sejarah penambahan baki
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}