import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopUpData } from "./PettyCashTopUp";
import { Trash2 } from "lucide-react";

interface TopUpHistoryProps {
  topUps: TopUpData[];
  onDelete: (topUpId: string) => void;
}

export function TopUpHistory({ topUps, onDelete }: TopUpHistoryProps) {
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
                <div className="flex items-center gap-2">
                  <p className="font-medium text-green-600">
                    + RM {topUp.amount.toFixed(2)}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(topUp.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {topUp.notes && topUp.notes.trim() !== "" && (
                <p className="text-sm text-gray-600">Nota: {topUp.notes}</p>
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