import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseForm";
import { ExternalLink } from "lucide-react";

interface TransactionHistoryProps {
  transactions: ExpenseData[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex flex-col p-4 bg-secondary rounded-lg space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-lg">{transaction.vendor || "Tiada Vendor"}</p>
                  <p className="text-sm text-gray-500">Direkod oleh: {transaction.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">RM {transaction.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{transaction.paymentMethod === 'cash' ? 'Tunai' : 
                    transaction.paymentMethod === 'transfer' ? 'Pemindahan Bank' : 'Kad Kredit/Debit'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Tarikh:</p>
                  <p>{transaction.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">No. Invoice:</p>
                  <p>{transaction.invoiceNo || "Tiada"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tujuan:</p>
                  <p>{transaction.purpose === 'farm_goods' ? 'Belian Barang Ladang' :
                      transaction.purpose === 'pesticides' ? 'Belian Racun' :
                      transaction.purpose === 'fertilizer' ? 'Belian Baja' :
                      transaction.purpose === 'wages' ? 'Upah Pekerja' :
                      transaction.purpose === 'machinery' ? 'Sewa Jentera/Lori' :
                      transaction.purpose === 'transport' ? 'Transport' :
                      transaction.customPurpose || 'Lain-lain'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kategori:</p>
                  <p>{transaction.category === 'durian' ? 'Projek Durian' :
                      transaction.category === 'pumpkin' ? 'Projek Labu' :
                      transaction.category === 'office' ? 'Pengurusan Pejabat' :
                      transaction.category === 'farm' ? 'Pengurusan Ladang' :
                      transaction.customCategory || 'Lain-lain'}</p>
                </div>
              </div>

              {transaction.receipt_url && (
                <a 
                  href={transaction.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  <ExternalLink size={16} />
                  Lihat Resit
                </a>
              )}
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">Tiada transaksi</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}