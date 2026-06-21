import { Header } from "@/components/layout/header";
import { FinanceManager } from "@/components/modules/finance-manager";
import { getFinanceSummary } from "@/lib/actions/finance";
import { listSuppliersOptions } from "@/lib/actions/suppliers";

export default async function FinanceiroPage() {
  const [finance, suppliers] = await Promise.all([
    getFinanceSummary(),
    listSuppliersOptions(),
  ]);

  return (
    <>
      <Header title="Financeiro" description="Contas, fluxo de caixa e lançamentos" />
      <div className="p-8">
        <FinanceManager
          summary={{
            totalReceivable: finance.totalReceivable,
            totalPayable: finance.totalPayable,
            balance: finance.balance,
            monthIncome: finance.monthIncome,
            monthExpense: finance.monthExpense,
            overdueReceivables: finance.overdueReceivables,
          }}
          payables={finance.payables}
          receivables={finance.receivables}
          cashFlow={finance.cashFlow}
          suppliers={suppliers}
        />
      </div>
    </>
  );
}
