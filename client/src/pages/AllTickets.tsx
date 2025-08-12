import TopBar from "@/components/TopBar";

export default function AllTickets() {
  return (
    <>
      <TopBar 
        title="Todos os Tickets" 
        description="Visualizar e gerenciar todos os tickets de suporte"
      />
      
      <div className="flex-1 overflow-auto p-6 bg-gray-10">
        <div className="bg-white rounded-lg border border-gray-20 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Visualização de Todos os Tickets</h3>
          <p className="text-gray-50">Esta página conterá uma tabela abrangente de tickets com recursos de filtragem e classificação.</p>
        </div>
      </div>
    </>
  );
}
