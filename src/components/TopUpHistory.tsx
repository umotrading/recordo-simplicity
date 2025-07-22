import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TopUpData } from "./PettyCashTopUp";
import { Trash2 } from "lucide-react";

interface TopUpHistoryProps {
  topUps: TopUpData[];
  onDelete: (topUpId: string) => void;
}

export function TopUpHistory({ topUps, onDelete }: TopUpHistoryProps) {
  // Group top-ups by month and year
  const groupedTopUps = useMemo(() => {
    const groups: { [key: string]: TopUpData[] } = {};
    
    topUps.forEach((topUp) => {
      const date = new Date(topUp.date);
      const monthYear = date.toLocaleDateString('ms-MY', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(topUp);
    });

    // Sort groups by date (newest first) and sort top-ups within each group
    const sortedGroups: { [key: string]: TopUpData[] } = {};
    Object.keys(groups)
      .sort((a, b) => {
        const dateA = new Date(groups[a][0].date);
        const dateB = new Date(groups[b][0].date);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach(key => {
        sortedGroups[key] = groups[key].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

    return sortedGroups;
  }, [topUps]);

  const getTotalForMonth = (monthTopUps: TopUpData[]) => {
    return monthTopUps.reduce((sum, topUp) => sum + Number(topUp.amount), 0);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sejarah Penambahan Baki</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedTopUps).length === 0 ? (
          <p className="text-center text-gray-500">
            Tiada sejarah penambahan baki
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedTopUps).map(([monthYear, monthTopUps]) => (
              <AccordionItem key={monthYear} value={monthYear} className="border rounded-lg mb-2">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex justify-between items-center w-full mr-4">
                    <span className="font-medium text-left">{monthYear}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {monthTopUps.length} penambahan
                      </span>
                      <div className="text-sm font-medium text-green-600">
                        + RM {getTotalForMonth(monthTopUps).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {monthTopUps.map((topUp, index) => (
                      <div
                        key={`${monthYear}-${index}`}
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}