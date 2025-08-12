import TopBar from "@/components/TopBar";

export default function Analytics() {
  return (
    <>
      <TopBar 
        title="Análises" 
        description="Insights profundos sobre o desempenho do gerenciamento de tickets"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Painel de Análises</h3>
          <p className="text-gray-50">Esta página conterá funcionalidades detalhadas de análise e relatórios.</p>
        </div>
      </div>
    </>
  );
}
